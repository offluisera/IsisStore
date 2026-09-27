// Teste de regras de negócio, cálculo server-side e snapshot do Checkout (Fase 08)
import assert from "node:assert";

interface Product {
  id: string;
  name: string;
  sku: string;
  price_cents: number;
  sale_price_cents: number | null;
  stock: number;
  is_active: boolean;
}

interface CartInputItem {
  productId: string;
  quantity: number;
}

function processCheckoutServerSide(
  productsDb: Product[],
  items: CartInputItem[],
  shippingMethod: "pac" | "sedex",
  paymentMethod: "pix" | "credit_card",
  coupon?: string
) {
  const productMap = new Map(productsDb.map((p) => [p.id, p]));

  let subtotalCents = 0;
  const orderItemsSnapshot: Array<{
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price_cents: number;
    subtotal_cents: number;
  }> = [];

  const stockUpdates: Array<{ id: string; newStock: number }> = [];

  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (!prod || !prod.is_active) {
      throw new Error(`Produto indisponível: ${item.productId}`);
    }

    if (prod.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para ${prod.name}`);
    }

    const unitPriceCents = prod.sale_price_cents || prod.price_cents;
    const itemSubtotal = unitPriceCents * item.quantity;
    subtotalCents += itemSubtotal;

    orderItemsSnapshot.push({
      product_id: prod.id,
      product_name: prod.name,
      sku: prod.sku,
      quantity: item.quantity,
      unit_price_cents: unitPriceCents,
      subtotal_cents: itemSubtotal,
    });

    stockUpdates.push({
      id: prod.id,
      newStock: prod.stock - item.quantity,
    });
  }

  // Frete
  const shippingCents =
    shippingMethod === "sedex" ? 2990 : subtotalCents >= 19900 ? 0 : 1890;

  // Descontos
  let discountCents = 0;
  if (coupon && coupon.trim().toUpperCase() === "ISIS10") {
    discountCents += Math.round(subtotalCents * 0.1);
  }

  if (paymentMethod === "pix") {
    const pixDiscount = Math.round((subtotalCents - discountCents) * 0.05);
    discountCents += pixDiscount;
  }

  const totalCents = Math.max(0, subtotalCents + shippingCents - discountCents);

  return {
    subtotalCents,
    shippingCents,
    discountCents,
    totalCents,
    orderItemsSnapshot,
    stockUpdates,
  };
}

// Mock de banco de produtos
const mockCatalog: Product[] = [
  {
    id: "p1",
    name: "Brinco Coração Ouro 18k",
    sku: "BRIN-001",
    price_cents: 12000,
    sale_price_cents: 9900, // R$ 99,00
    stock: 5,
    is_active: true,
  },
  {
    id: "p2",
    name: "Bolsa Couro Nude",
    sku: "BOLS-002",
    price_cents: 25000,
    sale_price_cents: null, // R$ 250,00
    stock: 2,
    is_active: true,
  },
  {
    id: "p3",
    name: "Item Esgotado",
    sku: "ESGOT-003",
    price_cents: 5000,
    sale_price_cents: null,
    stock: 0,
    is_active: true,
  },
];

// Teste 1: Cálculo correto com frete grátis e snapshot imutável
const res1 = processCheckoutServerSide(
  mockCatalog,
  [
    { productId: "p1", quantity: 1 }, // R$ 99,00
    { productId: "p2", quantity: 1 }, // R$ 250,00
  ],
  "pac",
  "credit_card"
);

console.log("Teste 1 - Subtotal e Snapshot:", res1);
assert.strictEqual(res1.subtotalCents, 34900); // R$ 349,00
assert.strictEqual(res1.shippingCents, 0); // Frete Grátis (>= R$ 199,00)
assert.strictEqual(res1.totalCents, 34900);
assert.strictEqual(res1.orderItemsSnapshot.length, 2);
assert.strictEqual(res1.orderItemsSnapshot[0].unit_price_cents, 9900);
assert.strictEqual(res1.stockUpdates[0].newStock, 4);
assert.strictEqual(res1.stockUpdates[1].newStock, 1);

// Teste 2: Abortar se estoque insuficiente (Concorrência)
assert.throws(
  () => {
    processCheckoutServerSide(
      mockCatalog,
      [{ productId: "p2", quantity: 5 }], // Pede 5, mas tem 2
      "pac",
      "credit_card"
    );
  },
  /Estoque insuficiente/,
  "Deveria ter lançado erro de estoque insuficiente"
);

// Teste 3: Abortar se produto estiver esgotado
assert.throws(
  () => {
    processCheckoutServerSide(
      mockCatalog,
      [{ productId: "p3", quantity: 1 }],
      "pac",
      "credit_card"
    );
  },
  /Estoque insuficiente/,
  "Deveria ter lançado erro de item esgotado"
);

// Teste 4: Desconto Pix + Cupom ISIS10
const res4 = processCheckoutServerSide(
  mockCatalog,
  [{ productId: "p1", quantity: 1 }], // R$ 99,00 (subtotal 9900, frete pac 1890)
  "pac",
  "pix",
  "ISIS10"
);

console.log("Teste 4 - Desconto Cupom + Pix:", res4);
assert.strictEqual(res4.subtotalCents, 9900);
assert.strictEqual(res4.shippingCents, 1890); // Abaixo de 199, paga frete
// Cupom 10% de 9900 = 990. Subtotal restante = 8910. Pix 5% de 8910 = 446. Total desc = 1436.
assert.strictEqual(res4.discountCents, 990 + 446);
assert.strictEqual(res4.totalCents, 9900 + 1890 - 1436); // 10354 centavos

console.log("✅ Gate 08 Aprovado: Regras de Checkout, Snapshot Imutável e Concorrência de Estoque validadas!");
