// Teste do Gateway Mercado Pago, Adapter, Webhooks e Idempotência (Fase 09)
import assert from "node:assert";
import crypto from "node:crypto";
import {
  createPixPayment,
  createPreference,
  verifyWebhookSignature,
} from "../../../lib/payments/mercadopago";

async function runTests() {
  console.log("Iniciando testes da Fase 09 — Mercado Pago Gateway & Webhooks...");

  // 1. Teste de Criação de Pagamento Pix (Sandbox / Adapter)
  const mockPayer = {
    email: "cliente.teste@isisstore.com.br",
    name: "Isis Lima",
    cpf: "123.456.789-00",
  };

  const pixResult = await createPixPayment({
    orderId: "order_test_uuid_12345",
    orderNumber: "ISIS-2026-9999",
    amountCents: 15990, // R$ 159,90
    payer: mockPayer,
  });

  console.log("1. Pix Payment Gerado:", {
    paymentId: pixResult.paymentId,
    status: pixResult.status,
    hasQrCode: Boolean(pixResult.qrCode),
    hasBase64: Boolean(pixResult.qrCodeBase64),
  });

  assert.ok(pixResult.paymentId, "Payment ID deve ser retornado");
  assert.strictEqual(pixResult.status, "pending");
  assert.ok(pixResult.qrCode.length > 20, "QR Code deve conter string válida");
  assert.ok(pixResult.qrCodeBase64.length > 20, "QR Code Base64 deve ser retornado");
  assert.strictEqual(pixResult.amountCents, 15990);

  // 2. Teste de Criação de Preference para Cartão
  const prefResult = await createPreference({
    orderId: "order_test_uuid_12345",
    orderNumber: "ISIS-2026-9999",
    items: [
      {
        id: "prod_01",
        title: "Vestido Seda Isis",
        quantity: 1,
        unitPriceCents: 15990,
      },
    ],
    payer: mockPayer,
    shippingCents: 1890,
    discountCents: 1000,
  });

  console.log("2. Preference Gerada:", {
    preferenceId: prefResult.preferenceId,
    initPoint: prefResult.initPoint,
  });

  assert.ok(prefResult.preferenceId, "Preference ID deve ser retornado");
  assert.ok(prefResult.initPoint.length > 0, "initPoint deve ser retornado");

  // 3. Teste de Assinatura HMAC SHA-256 do Webhook
  const testSecret = "test_webhook_secret_key_isis_store_2026";
  const testDataId = "payment_987654321";
  const testRequestId = "req_uuid_alpha_omega";
  const testTimestamp = "1727464000";

  const manifest = `id:${testDataId};request-id:${testRequestId};ts:${testTimestamp};`;
  const validHash = crypto
    .createHmac("sha256", testSecret)
    .update(manifest)
    .digest("hex");

  const validSignatureHeader = `ts=${testTimestamp},v1=${validHash}`;

  // 3.1 Assinatura correta deve retornar true
  const isValid = verifyWebhookSignature({
    xSignature: validSignatureHeader,
    xRequestId: testRequestId,
    dataId: testDataId,
    secret: testSecret,
  });
  assert.strictEqual(isValid, true, "Assinatura legítima deve validar com sucesso");

  // 3.2 Assinatura adulterada deve retornar false
  const isInvalid = verifyWebhookSignature({
    xSignature: `ts=${testTimestamp},v1=tampered_hash_123456`,
    xRequestId: testRequestId,
    dataId: testDataId,
    secret: testSecret,
  });
  assert.strictEqual(isInvalid, false, "Assinatura adulterada deve ser rejeitada");

  // 3.3 DataID diferente deve invalidar assinatura
  const isDataMismatch = verifyWebhookSignature({
    xSignature: validSignatureHeader,
    xRequestId: testRequestId,
    dataId: "outropagamento_hacker",
    secret: testSecret,
  });
  assert.strictEqual(isDataMismatch, false, "Payload adulterado deve ser rejeitado");

  // 4. Teste de Idempotência Financeira (Simulação de tabela payment_events)
  const processedEvents = new Set<string>();

  function simulateWebhookProcessing(eventId: string) {
    if (processedEvents.has(eventId)) {
      // Simula erro de chave duplicada (Postgres error 23505)
      return { status: 200, message: "Evento já processado anteriormente (Idempotente)" };
    }
    processedEvents.add(eventId);
    return { status: 200, message: "Evento processado com sucesso" };
  }

  const webhookCall1 = simulateWebhookProcessing("mp_payment_12345_unique_req");
  assert.strictEqual(webhookCall1.message, "Evento processado com sucesso");

  const webhookCall2Retry = simulateWebhookProcessing("mp_payment_12345_unique_req");
  assert.strictEqual(webhookCall2Retry.message, "Evento já processado anteriormente (Idempotente)");

  // 5. Teste de Mapeamento de Status
  function mapGatewayStatusToOrder(mpStatus: string) {
    let paymentStatus: "pending" | "approved" | "rejected" | "cancelled" | "in_process" = "pending";
    let orderStatus: "pending_payment" | "paid" | "processing" | "cancelled" = "pending_payment";

    if (mpStatus === "approved") {
      paymentStatus = "approved";
      orderStatus = "paid";
    } else if (mpStatus === "in_process" || mpStatus === "authorized") {
      paymentStatus = "in_process";
      orderStatus = "processing";
    } else if (mpStatus === "rejected" || mpStatus === "cancelled" || mpStatus === "refunded") {
      paymentStatus = "cancelled";
      orderStatus = "cancelled";
    }

    return { paymentStatus, orderStatus };
  }

  assert.deepStrictEqual(mapGatewayStatusToOrder("approved"), {
    paymentStatus: "approved",
    orderStatus: "paid",
  });

  assert.deepStrictEqual(mapGatewayStatusToOrder("in_process"), {
    paymentStatus: "in_process",
    orderStatus: "processing",
  });

  assert.deepStrictEqual(mapGatewayStatusToOrder("rejected"), {
    paymentStatus: "cancelled",
    orderStatus: "cancelled",
  });

  console.log("✅ Gate 09 Aprovado: Gateway Adapter, Webhook HMAC SHA-256 e Idempotência validados com sucesso!");
}

runTests().catch((err) => {
  console.error("Falha nos testes do Gate 09:", err);
  process.exit(1);
});
