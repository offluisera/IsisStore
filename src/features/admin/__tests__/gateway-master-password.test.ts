import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  validateMasterPassword,
} from "@/lib/payments/credentials";

describe("Segurança do Gateway: Senha Master & Criptografia AES-256-GCM", () => {
  const TEST_MASTER_PASSWORD = "master_super_secret_test_2026";
  const TEST_ACCESS_TOKEN = "APP_USR-789456123-092718-isis-test-token-abcdef123456";
  const TEST_WEBHOOK_SECRET = "sec_test_hmac_secret_998877";

  it("1. Deve criptografar e descriptografar com exatidão usando a Senha Master (AES-256-GCM)", () => {
    const encrypted = encryptSecret(TEST_ACCESS_TOKEN, TEST_MASTER_PASSWORD);

    assert.ok(encrypted.includes(":"), "Texto cifrado deve conter separadores de IV e AuthTag");
    const parts = encrypted.split(":");
    assert.strictEqual(parts.length, 3, "Formato esperado: iv:tag:data");

    // Descriptografar com a chave correta
    const decrypted = decryptSecret(encrypted, TEST_MASTER_PASSWORD);
    assert.strictEqual(
      decrypted,
      TEST_ACCESS_TOKEN,
      "Texto descriptografado deve ser idêntico ao original"
    );
  });

  it("2. Deve rejeitar descriptografia se a Senha Master for incorreta ou adulterada", () => {
    const encrypted = encryptSecret(TEST_ACCESS_TOKEN, TEST_MASTER_PASSWORD);

    // Tentativa com senha errada
    const decryptedWrong = decryptSecret(encrypted, "senha_completamente_errada");
    assert.strictEqual(
      decryptedWrong,
      "",
      "Descriptografia com chave errada deve falhar e retornar vazio"
    );

    // Tentativa com ciphertext adulterado
    const [iv, tag, data] = encrypted.split(":");
    const tamperedCipher = `${iv}:${tag}:${data.slice(0, -2)}ff`;
    const decryptedTampered = decryptSecret(tamperedCipher, TEST_MASTER_PASSWORD);
    assert.strictEqual(
      decryptedTampered,
      "",
      "Ciphertext adulterado deve falhar na autenticação de integridade (Auth Tag)"
    );
  });

  it("3. Deve mascarar tokens para exibição segura sem expor dados confidenciais", () => {
    const masked = maskSecret(TEST_ACCESS_TOKEN);
    assert.ok(masked.includes("••••••••"), "Token deve conter máscara com bullets");
    assert.ok(!masked.includes("isis-test-token"), "Miolo secreto do token não pode ser revelado");

    const shortMasked = maskSecret("12345");
    assert.strictEqual(shortMasked, "••••••••", "Tokens curtos devem ser mascarados integralmente");

    const emptyMasked = maskSecret("");
    assert.strictEqual(emptyMasked, "", "String vazia deve retornar vazio");
  });

  it("4. Deve validar a Senha Master do .env com proteção estrita", () => {
    const originalEnv = process.env.ADMIN_MASTER_PASSWORD;
    process.env.ADMIN_MASTER_PASSWORD = TEST_MASTER_PASSWORD;

    try {
      // Senha correta
      assert.strictEqual(
        validateMasterPassword(TEST_MASTER_PASSWORD),
        true,
        "Senha master correta deve retornar true"
      );

      // Senha incorreta
      assert.strictEqual(
        validateMasterPassword("senha_incorreta_xyz"),
        false,
        "Senha incorreta deve retornar false"
      );

      // Senha vazia ou nula
      assert.strictEqual(
        validateMasterPassword(""),
        false,
        "Senha vazia deve retornar false"
      );
      assert.strictEqual(
        validateMasterPassword(null),
        false,
        "Senha nula deve retornar false"
      );

      // Se env não estiver configurado
      delete process.env.ADMIN_MASTER_PASSWORD;
      assert.strictEqual(
        validateMasterPassword(TEST_MASTER_PASSWORD),
        false,
        "Se ADMIN_MASTER_PASSWORD não estiver no .env, deve rejeitar"
      );
    } finally {
      process.env.ADMIN_MASTER_PASSWORD = originalEnv;
    }
  });

  it("5. Deve criptografar múltiplos segredos de forma independente e segura", () => {
    const encToken = encryptSecret(TEST_ACCESS_TOKEN, TEST_MASTER_PASSWORD);
    const encWebhook = encryptSecret(TEST_WEBHOOK_SECRET, TEST_MASTER_PASSWORD);

    assert.notStrictEqual(encToken, encWebhook);

    const decToken = decryptSecret(encToken, TEST_MASTER_PASSWORD);
    const decWebhook = decryptSecret(encWebhook, TEST_MASTER_PASSWORD);

    assert.strictEqual(decToken, TEST_ACCESS_TOKEN);
    assert.strictEqual(decWebhook, TEST_WEBHOOK_SECRET);
  });
});
