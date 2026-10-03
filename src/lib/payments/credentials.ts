import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";

// Derivar chave AES-256 a partir da Senha Master
function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Criptografa dados sensíveis utilizando AES-256-GCM com autenticação de integridade.
 * O resultado armazena IV, Auth Tag e dados criptografados em formato hexadecimal.
 */
export function encryptSecret(plainText: string, masterKey: string): string {
  if (!plainText || !masterKey) return "";
  const key = deriveKey(masterKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Descriptografa dados sensíveis com verificação da tag de autenticação AES-256-GCM.
 * Se a senha master estiver incorreta ou os dados tiverem sido alterados, retorna string vazia.
 */
export function decryptSecret(cipherText: string, masterKey: string): string {
  if (!cipherText || !masterKey || !cipherText.includes(":")) return "";
  try {
    const [ivHex, authTagHex, encryptedHex] = cipherText.split(":");
    if (!ivHex || !authTagHex || !encryptedHex) return "";

    const key = deriveKey(masterKey);
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}

/**
 * Mascara strings confidenciais para exibição segura no painel sem expor segredos.
 */
export function maskSecret(val?: string | null): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.length <= 8) return "••••••••";
  const startLen = Math.min(8, Math.floor(trimmed.length / 3));
  const endLen = Math.min(4, Math.floor(trimmed.length / 4));
  return `${trimmed.slice(0, startLen)}••••••••${trimmed.slice(-endLen)}`;
}

/**
 * Validação com proteção contra Timing Attack da Senha Master definida no .env.
 */
export function validateMasterPassword(inputPassword?: string | null): boolean {
  const masterPassword = process.env.ADMIN_MASTER_PASSWORD;
  if (!masterPassword || !inputPassword) return false;

  const expectedBuffer = Buffer.from(masterPassword.trim());
  const actualBuffer = Buffer.from(inputPassword.trim());

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export interface ActivePaymentCredentials {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
  mode: "sandbox" | "production";
  isSandbox: boolean;
  isConfigured: boolean;
  source: "database" | "env" | "none";
}

/**
 * Recupera as credenciais ativas do Mercado Pago de forma dinâmica.
 * Prioridade:
 * 1. Banco de Dados (payment_gateways) descriptografado com a Senha Master do .env
 * 2. Fallback de variáveis de ambiente (.env / .env.local)
 */
export async function getActiveMercadoPagoCredentials(): Promise<ActivePaymentCredentials> {
  const envAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  const envPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "";
  const envWebhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
  const masterKey = process.env.ADMIN_MASTER_PASSWORD || "";

  try {
    const supabase = await createClient();
    const { data: gateway } = await supabase
      .from("payment_gateways")
      .select("settings, is_active")
      .eq("name", "mercadopago")
      .maybeSingle();

    if (gateway && gateway.settings) {
      const settings = gateway.settings as Record<string, unknown>;
      const mode = (settings.mode as "sandbox" | "production") || "sandbox";

      let dbAccessToken = "";
      if (settings.encrypted_access_token && masterKey) {
        dbAccessToken = decryptSecret(
          String(settings.encrypted_access_token),
          masterKey
        );
      } else if (settings.access_token) {
        dbAccessToken = String(settings.access_token);
      }

      let dbWebhookSecret = "";
      if (settings.encrypted_webhook_secret && masterKey) {
        dbWebhookSecret = decryptSecret(
          String(settings.encrypted_webhook_secret),
          masterKey
        );
      } else if (settings.webhook_secret) {
        dbWebhookSecret = String(settings.webhook_secret);
      }

      const dbPublicKey = settings.public_key ? String(settings.public_key) : "";

      const accessToken = dbAccessToken || envAccessToken;
      const publicKey = dbPublicKey || envPublicKey;
      const webhookSecret = dbWebhookSecret || envWebhookSecret;

      const isConfigured = Boolean(
        accessToken &&
          !accessToken.includes("your-mercadopago-access-token") &&
          (accessToken.startsWith("APP_USR-") || accessToken.startsWith("TEST-"))
      );

      return {
        accessToken,
        publicKey,
        webhookSecret,
        mode,
        isSandbox: mode === "sandbox",
        isConfigured,
        source: dbAccessToken ? "database" : envAccessToken ? "env" : "none",
      };
    }
  } catch (err) {
    console.warn("Aviso: Falha ao consultar credenciais no banco, usando fallback do ambiente:", err);
  }

  const isConfigured = Boolean(
    envAccessToken &&
      !envAccessToken.includes("your-mercadopago-access-token") &&
      (envAccessToken.startsWith("APP_USR-") || envAccessToken.startsWith("TEST-"))
  );

  return {
    accessToken: envAccessToken,
    publicKey: envPublicKey,
    webhookSecret: envWebhookSecret,
    mode: "sandbox",
    isSandbox: true,
    isConfigured,
    source: envAccessToken ? "env" : "none",
  };
}
