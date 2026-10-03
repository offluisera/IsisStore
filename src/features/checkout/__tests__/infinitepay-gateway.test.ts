import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkoutSchema } from "@/schemas/checkout";
import {
  createInfinitePayCheckoutLink,
  type InfinitePayOrderData,
  type InfinitePaySettings,
} from "@/lib/payments/infinitepay";
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  validateMasterPassword,
} from "@/lib/payments/credentials";

describe("Gateway InfinitePay: Integração, Segurança e Checkout", () => {
  const TEST_MASTER_PASSWORD = "isis_master_test_key_2026";
  const TEST_CLIENT_SECRET = "sec_live_99887766554433221100aabbccddeeff";

  it("1. Checkout Schema deve aceitar 'infinitepay' como método válido de pagamento", () => {
    const validPayload = {
      addressId: "11111111-1111-4111-8111-111111111111",
      shippingMethod: "pac" as const,
      paymentMethod: "infinitepay" as const,
      couponCode: "ISIS10",
      notes: "Por favor embrulhar para presente",
      items: [
        {
          productId: "22222222-2222-4222-8222-222222222222",
          quantity: 2,
        },
      ],
    };

    const parsed = checkoutSchema.safeParse(validPayload);
    assert.strictEqual(parsed.success, true, "Schema deve validar infinitepay com sucesso");
    if (parsed.success) {
      assert.strictEqual(parsed.data.paymentMethod, "infinitepay");
    }
  });

  it("2. Deve gerar link de checkout da InfinitePay com fallback seguro", async () => {
    const orderData: InfinitePayOrderData = {
      id: "ord_test_123",
      order_number: "ISIS-889911-4321",
      total_cents: 38990,
      customer: {
        name: "Maria da Silva",
        email: "maria@example.com",
        phone: "5511999998888",
      },
      items: [
        {
          name: "Vestido Isis Silk Premium",
          quantity: 1,
          price_cents: 38990,
        },
      ],
    };

    const settings: InfinitePaySettings = {
      handle: "@isisstore",
      mode: "production",
      max_installments: 12,
    };

    const result = await createInfinitePayCheckoutLink(
      orderData,
      settings,
      "http://localhost:3000"
    );

    assert.strictEqual(result.success, true);
    assert.ok(result.checkoutUrl, "Deve retornar uma URL de checkout");
    assert.ok(
      result.checkoutUrl.startsWith("https://"),
      "A URL retornada pela API ou fallback deve ser HTTPS válida"
    );
  });

  it("3. Deve criptografar e proteger o Client Secret da InfinitePay com Senha Master", () => {
    const originalEnv = process.env.ADMIN_MASTER_PASSWORD;
    process.env.ADMIN_MASTER_PASSWORD = TEST_MASTER_PASSWORD;

    try {
      // 1. Criptografia AES-256-GCM
      const encrypted = encryptSecret(TEST_CLIENT_SECRET, TEST_MASTER_PASSWORD);
      assert.ok(encrypted.includes(":"), "Deve conter IV e Auth Tag no formato seguro");

      // 2. Descriptografia exata com a Senha Master
      const decrypted = decryptSecret(encrypted, TEST_MASTER_PASSWORD);
      assert.strictEqual(decrypted, TEST_CLIENT_SECRET, "Deve recuperar o secret original");

      // 3. Mascaramento para exibição segura no painel
      const masked = maskSecret(TEST_CLIENT_SECRET);
      assert.ok(masked.includes("••••••••"), "Deve conter caracteres mascarados");
      assert.ok(!masked.includes("9988776655"), "Não pode expor miolo secreto");

      // 4. Validação da Senha Master
      assert.strictEqual(validateMasterPassword(TEST_MASTER_PASSWORD), true);
      assert.strictEqual(validateMasterPassword("senha_incorreta"), false);
    } finally {
      process.env.ADMIN_MASTER_PASSWORD = originalEnv;
    }
  });

  it("4. Deve higienizar o handle da InfinitePay removendo @ e espaços", async () => {
    const orderData: InfinitePayOrderData = {
      id: "ord_clean_test",
      order_number: "ISIS-554433-1234",
      total_cents: 12000,
      customer: {
        name: "Carlos Eduardo",
        email: "carlos@example.com",
      },
      items: [
        {
          name: "Colar Coração Ouro",
          quantity: 1,
          price_cents: 12000,
        },
      ],
    };

    const settings: InfinitePaySettings = {
      handle: "   @loja_isis_oficial   ",
      mode: "sandbox",
    };

    const result = await createInfinitePayCheckoutLink(
      orderData,
      settings,
      "http://localhost:3000"
    );

    assert.strictEqual(result.success, true);
    assert.ok(
      result.checkoutUrl?.includes("loja_isis_oficial"),
      "Deve conter o handle limpo"
    );
    assert.ok(
      !result.checkoutUrl?.includes("@"),
      "Não pode conter o caractere @"
    );
  });
});
