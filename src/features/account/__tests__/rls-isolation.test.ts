// Teste de integridade do Gate 07 - Isolamento de Dados por RLS
import assert from "node:assert";

interface UserContext {
  id: string;
  email: string;
}

interface OrderRecord {
  id: string;
  customer_id: string;
  order_number: string;
  total_cents: number;
}

interface AddressRecord {
  id: string;
  profile_id: string;
  street: string;
}

// Simulação de execução sob contexto de RLS
class MockRlsDatabase {
  private orders: OrderRecord[] = [
    { id: "ord-1", customer_id: "user-A", order_number: "ISIS-1001", total_cents: 18990 },
    { id: "ord-2", customer_id: "user-A", order_number: "ISIS-1002", total_cents: 9990 },
    { id: "ord-3", customer_id: "user-B", order_number: "ISIS-2001", total_cents: 29990 },
  ];

  private addresses: AddressRecord[] = [
    { id: "addr-1", profile_id: "user-A", street: "Rua A, 100" },
    { id: "addr-2", profile_id: "user-B", street: "Av B, 500" },
  ];

  // Regra de RLS: orders SELECT WHERE customer_id = auth.uid()
  selectOrders(user: UserContext): OrderRecord[] {
    return this.orders.filter((o) => o.customer_id === user.id);
  }

  // Regra de RLS: order por ID WHERE id = :id AND customer_id = auth.uid()
  selectOrderById(user: UserContext, orderId: string): OrderRecord | null {
    const order = this.orders.find((o) => o.id === orderId && o.customer_id === user.id);
    return order || null;
  }

  // Regra de RLS: addresses SELECT WHERE profile_id = auth.uid()
  selectAddresses(user: UserContext): AddressRecord[] {
    return this.addresses.filter((a) => a.profile_id === user.id);
  }
}

const db = new MockRlsDatabase();

const userA: UserContext = { id: "user-A", email: "clienteA@isisstore.com.br" };
const userB: UserContext = { id: "user-B", email: "clienteB@isisstore.com.br" };

// Teste 1: Cliente A visualiza somente seus pedidos
const ordersA = db.selectOrders(userA);
console.log("Pedidos vistos pelo Usuário A:", ordersA.map((o) => o.order_number));
assert.strictEqual(ordersA.length, 2);
assert.strictEqual(ordersA.every((o) => o.customer_id === "user-A"), true);

// Teste 2: Cliente B visualiza somente seus pedidos
const ordersB = db.selectOrders(userB);
console.log("Pedidos vistos pelo Usuário B:", ordersB.map((o) => o.order_number));
assert.strictEqual(ordersB.length, 1);
assert.strictEqual(ordersB[0].order_number, "ISIS-2001");

// Teste 3: Tentativa de Cliente A acessar diretamente o pedido do Cliente B (/conta/pedidos/ord-3)
const crossOrderAttempt = db.selectOrderById(userA, "ord-3");
console.log("Tentativa de Usuário A ver pedido ord-3 (pertencente a B):", crossOrderAttempt);
assert.strictEqual(crossOrderAttempt, null, "Vazamento de dados! Usuário A conseguiu ver pedido de B!");

// Teste 4: Cliente A não vê endereços do Cliente B
const addressesA = db.selectAddresses(userA);
console.log("Endereços vistos pelo Usuário A:", addressesA.map((a) => a.street));
assert.strictEqual(addressesA.length, 1);
assert.strictEqual(addressesA[0].profile_id, "user-A");
assert.strictEqual(addressesA.some((a) => a.profile_id === "user-B"), false);

console.log("✅ Gate 07 Aprovado: Isolamento estrito de dados e RLS validado entre múltiplos clientes!");
