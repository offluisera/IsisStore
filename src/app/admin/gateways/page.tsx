import { createClient } from "@/lib/supabase/server";
import { GatewayManagerView, GatewayRecord } from "@/components/admin/gateway-manager-view";
import { maskSecret } from "@/lib/payments/credentials";

export const metadata = {
  title: "Gateways de Pagamento & WhatsApp — Isis Store Admin",
  description: "Configure os gateways de pagamento online e atendimento de vendas via WhatsApp com baixa manual.",
};

export default async function AdminGatewaysPage() {
  const supabase = await createClient();

  const { data: gateways } = await supabase
    .from("payment_gateways")
    .select("id, name, is_active, is_default, settings, updated_at")
    .order("name", { ascending: true });

  const envHasToken = Boolean(
    process.env.MERCADOPAGO_ACCESS_TOKEN &&
      !process.env.MERCADOPAGO_ACCESS_TOKEN.includes("your-mercadopago-access-token")
  );
  const isMasterConfigured = Boolean(process.env.ADMIN_MASTER_PASSWORD);

  const typedGateways: GatewayRecord[] = (gateways || []).map((g) => {
    const rawSettings = (g.settings as Record<string, unknown>) || {};
    
    // Sanitização de segurança estrita: nunca envia dados criptografados brutos ao client
    if (g.name === "mercadopago") {
      const sanitized: Record<string, unknown> = {
        name: rawSettings.name || "Mercado Pago Checkout Pro",
        mode: rawSettings.mode || "sandbox",
        public_key: rawSettings.public_key || "",
        masked_access_token:
          rawSettings.masked_access_token ||
          (rawSettings.access_token ? maskSecret(String(rawSettings.access_token)) : ""),
        has_saved_credentials: Boolean(
          rawSettings.encrypted_access_token || rawSettings.access_token
        ),
        has_webhook_secret: Boolean(
          rawSettings.encrypted_webhook_secret || rawSettings.webhook_secret
        ),
        has_env_fallback: envHasToken,
        is_master_configured: isMasterConfigured,
        updated_at_master: rawSettings.updated_at_master || null,
      };

      return {
        id: g.id,
        name: g.name,
        is_active: g.is_active,
        is_default: g.is_default,
        settings: sanitized,
        updated_at: g.updated_at,
      };
    }

    if (g.name === "infinitepay") {
      const sanitized: Record<string, unknown> = {
        name: rawSettings.name || "InfinitePay Checkout Integrado",
        handle: rawSettings.handle || "isisstore",
        mode: rawSettings.mode || "production",
        client_id: rawSettings.client_id || "",
        masked_client_secret:
          rawSettings.masked_client_secret ||
          (rawSettings.client_secret ? maskSecret(String(rawSettings.client_secret)) : ""),
        has_saved_credentials: Boolean(
          rawSettings.encrypted_client_secret ||
            rawSettings.client_secret ||
            rawSettings.client_id ||
            rawSettings.handle
        ),
        has_secret_configured: Boolean(
          rawSettings.encrypted_client_secret || rawSettings.client_secret
        ),
        max_installments: Number(rawSettings.max_installments || 12),
        is_master_configured: isMasterConfigured,
        updated_at_master: rawSettings.updated_at_master || null,
      };

      return {
        id: g.id,
        name: g.name,
        is_active: g.is_active,
        is_default: g.is_default,
        settings: sanitized,
        updated_at: g.updated_at,
      };
    }

    return {
      id: g.id,
      name: g.name,
      is_active: g.is_active,
      is_default: g.is_default,
      settings: rawSettings,
      updated_at: g.updated_at,
    };
  });

  return <GatewayManagerView gateways={typedGateways} />;
}

