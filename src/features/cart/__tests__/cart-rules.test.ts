// Teste de integridade de regras de negócio do carrinho (Fase 06)
const assert = require("assert");

interface CartItem {
  id: string;
  name: string;
  price: number; // centavos
  quantity: number;
}

function calculateCart(items: CartItem[], coupon?: string) {
  const subtotalCents = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingThreshold = 19900;
  const isFreeShipping = subtotalCents >= freeShippingThreshold;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalCents);
  
  let discountCents = 0;
  if (coupon && coupon.trim().toUpperCase() === "ISIS10") {
    discountCents = Math.round(subtotalCents * 0.1);
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);

  return {
    subtotalCents,
    itemsCount,
    isFreeShipping,
    missingForFreeShipping,
    discountCents,
    totalCents,
  };
}

// 1. Teste Múltiplos Produtos
const items = [
  { id: "p1", name: "Bolsa Couro Legítimo Nude", price: 18990, quantity: 1 },
  { id: "p2", name: "Brinco Coração Dourado", price: 4990, quantity: 2 },
];

const res1 = calculateCart(items);
console.log("Teste 1 - Múltiplos produtos:", res1);
assert.strictEqual(res1.itemsCount, 3);
assert.strictEqual(res1.subtotalCents, 18990 + 4990 * 2); // 28970 centavos (R$ 289,70)
assert.strictEqual(res1.isFreeShipping, true);
assert.strictEqual(res1.missingForFreeShipping, 0);

// 2. Teste Cupom ISIS10
const res2 = calculateCart(items, "ISIS10");
console.log("Teste 2 - Cupom ISIS10:", res2);
assert.strictEqual(res2.discountCents, Math.round(28970 * 0.1)); // 2897 centavos (R$ 28,97)
assert.strictEqual(res2.totalCents, 28970 - 2897); // 26073 centavos

// 3. Teste Limite Frete Grátis
const cheapItems = [{ id: "p3", name: "Scrunchie Seda", price: 2990, quantity: 1 }];
const res3 = calculateCart(cheapItems);
console.log("Teste 3 - Abaixo de R$ 199:", res3);
assert.strictEqual(res3.isFreeShipping, false);
assert.strictEqual(res3.missingForFreeShipping, 19900 - 2990); // 16910 centavos faltantes

console.log("✅ Todos os testes de regras e cálculos da Fase 06 passaram com precisão de centavos!");
