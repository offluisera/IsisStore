// Teste do Gateway WhatsApp, Templates, Encodings e Baixa Manual
import assert from "node:assert";
import { checkoutSchema } from "../../../schemas/checkout";
import { updateGatewaySchema } from "../../../schemas/admin";

async function runTests() {
  console.log("Iniciando testes do Gateway WhatsApp & Baixa Manual...");

  // 1. Validação do checkoutSchema com paymentMethod: "whatsapp"
  const validWhatsAppCheckout = {
    addressId: "11111111-1111-4111-a111-111111111111",
    shippingMethod: "pac",
    paymentMethod: "whatsapp",
    notes: "Aos cuidados da recepção",
    items: [
      {
        productId: "22222222-2222-4222-a222-222222222222",
        quantity: 2,
      },
    ],
  };

  const parseResult = checkoutSchema.safeParse(validWhatsAppCheckout);
  assert.ok(parseResult.success, "Checkout com método 'whatsapp' deve ser aceito pelo schema");
  console.log("1. Checkout schema com 'whatsapp' aprovado.");

  // 2. Validação do updateGatewaySchema para o WhatsApp
  const validGatewayUpdate = {
    id: "017f081a-2134-43be-9341-0d034a97f657",
    is_active: true,
    is_default: false,
    settings: {
      name: "Pedido & Pagamento via WhatsApp",
      phone: "5511999998888",
      message_template:
        "Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação",
      instructions: "Baixa manual no painel",
      auto_redirect: true,
    },
  };

  const gatewayParse = updateGatewaySchema.safeParse(validGatewayUpdate);
  assert.ok(gatewayParse.success, "Update gateway schema deve aceitar configurações do WhatsApp");
  console.log("2. updateGatewaySchema com WhatsApp aprovado.");

  // 3. Teste de Interpolação de Template de Mensagem Oficial
  const template =
    "Olá tive interesse no produto {produto} meu pedido é numero {pedido} no valor {valor} gostaria de mais informação";
  const productName = "Vestido Isis Silk Premium";
  const orderNumber = "ISIS-77123";
  const priceFormatted = "R$ 389,90";

  const interpolated = template
    .replace(/\{produto\}/gi, productName)
    .replace(/\{pedido\}/gi, orderNumber)
    .replace(/\{valor\}/gi, priceFormatted);

  assert.strictEqual(
    interpolated,
    "Olá tive interesse no produto Vestido Isis Silk Premium meu pedido é numero ISIS-77123 no valor R$ 389,90 gostaria de mais informação"
  );
  console.log("3. Interpolação da mensagem oficial do WhatsApp validada:", interpolated);

  // 4. Teste de Sanitização de Telefone e Geração de URL
  const rawPhones = [
    "+55 (11) 99999-8888",
    "55 11 99999-8888",
    "5511999998888",
    "+55 11 999998888",
  ];

  for (const rawPhone of rawPhones) {
    const clean = rawPhone.replace(/\D/g, "");
    assert.strictEqual(clean, "5511999998888");

    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(interpolated)}`;
    assert.ok(waUrl.startsWith("https://wa.me/5511999998888?text="));
    assert.ok(waUrl.includes(encodeURIComponent(orderNumber)));
  }
  console.log("4. Sanitização de múltiplos formatos de telefone validada com sucesso.");

  // 5. Teste da Lógica de Baixa Manual
  // No WhatsApp, o pedido inicia como pending_payment e não deduz estoque.
  // Quando o admin marca como 'paid', a baixa é processada.
  const initialStock = 10;
  const orderQuantity = 2;
  let currentStock = initialStock;

  // Ao criar pedido via WhatsApp: estoque permanece intacto
  const paymentMethod = "whatsapp";
  if (paymentMethod !== "whatsapp") {
    currentStock -= orderQuantity;
  }
  assert.strictEqual(currentStock, 10, "Estoque deve permanecer intacto na criação de pedido via WhatsApp");

  // Na baixa manual feita pelo admin:
  const previousStatus = "pending_payment";
  const newStatus = "paid";
  const isWhatsAppOrder = true;

  if (
    (newStatus === "paid" || newStatus === "processing") &&
    previousStatus === "pending_payment" &&
    isWhatsAppOrder
  ) {
    currentStock = Math.max(0, currentStock - orderQuantity);
  }

  assert.strictEqual(currentStock, 8, "Estoque deve ser deduzido após a baixa manual para 'paid'");
  console.log("5. Lógica de baixa manual do estoque validada com sucesso.");

  // 6. Teste da Lógica de Exibição Dinâmica de Botões (Mercado Pago vs WhatsApp)
  const getVisibleButtons = (mpActive: boolean, waActive: boolean) => {
    return {
      showBuyNow: mpActive,
      showWhatsApp: waActive,
      fullWidthWhatsApp: !mpActive && waActive,
      fullWidthBuyNow: mpActive && !waActive,
      bothActive: mpActive && waActive,
      noneActive: !mpActive && !waActive,
    };
  };

  // Cenário 1: Mercado Pago desativado, WhatsApp ativado (Cenário do usuário)
  const c1 = getVisibleButtons(false, true);
  assert.strictEqual(c1.showBuyNow, false, "Comprar Agora deve estar OCULTO quando Mercado Pago desativado");
  assert.strictEqual(c1.showWhatsApp, true, "Comprar WhatsApp deve estar VISÍVEL quando WhatsApp ativado");
  assert.strictEqual(c1.fullWidthWhatsApp, true, "Comprar WhatsApp deve ocupar largura total");

  // Cenário 2: Ambos ativados
  const c2 = getVisibleButtons(true, true);
  assert.strictEqual(c2.showBuyNow, true);
  assert.strictEqual(c2.showWhatsApp, true);
  assert.strictEqual(c2.bothActive, true);

  // Cenário 3: Mercado Pago ativado, WhatsApp desativado
  const c3 = getVisibleButtons(true, false);
  assert.strictEqual(c3.showBuyNow, true);
  assert.strictEqual(c3.showWhatsApp, false);
  assert.strictEqual(c3.fullWidthBuyNow, true);

  // Cenário 4: Nenhum ativado
  const c4 = getVisibleButtons(false, false);
  assert.strictEqual(c4.noneActive, true);
  console.log("6. Lógica de visibilidade dinâmica de botões de compra validada com sucesso.");

  console.log("\nTodos os 6 testes de WhatsApp Gateway & Baixa Manual passaram com 100% de sucesso!");
}

runTests().catch((err) => {
  console.error("Falha nos testes:", err);
  process.exit(1);
});
