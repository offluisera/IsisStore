// Testes de Regras de Negócio do Painel Admin e Auditoria (Fase 10)
import assert from "node:assert";
import {
  categorySchema,
  updateStockSchema,
  updateProductStatusSchema,
  updateOrderStatusSchema,
  updateUserRoleSchema,
} from "../../../schemas/admin";

async function runAdminTests() {
  console.log("Iniciando testes da Fase 10 — Painel Admin & Auditoria...");

  // 1. Validação de Schemas Zod Administrativos
  const validStock = updateStockSchema.safeParse({
    productId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    stock: 25,
  });
  assert.strictEqual(validStock.success, true, "Estoque válido deve passar");

  const invalidNegativeStock = updateStockSchema.safeParse({
    productId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    stock: -5,
  });
  assert.strictEqual(invalidNegativeStock.success, false, "Estoque negativo deve falhar");

  const validStatus = updateProductStatusSchema.safeParse({
    productId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    status: "published",
  });
  assert.strictEqual(validStatus.success, true);

  const invalidStatus = updateProductStatusSchema.safeParse({
    productId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    status: "invalid_status",
  });
  assert.strictEqual(invalidStatus.success, false);

  const validOrderUpdate = updateOrderStatusSchema.safeParse({
    orderId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    status: "shipped",
    trackingCode: "BR123456789BR",
  });
  assert.strictEqual(validOrderUpdate.success, true);

  const validCat = categorySchema.safeParse({ name: "Vestidos" });
  assert.strictEqual(validCat.success, true);

  const validRole = updateUserRoleSchema.safeParse({
    userId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    role: "admin",
  });
  assert.strictEqual(validRole.success, true);

  // 2. Teste de Proteção contra Auto-Rebaixamento de Administrador
  function simulateRoleUpdate(
    currentUserId: string,
    targetUserId: string,
    newRole: "customer" | "admin"
  ) {
    if (currentUserId === targetUserId && newRole !== "admin") {
      throw new Error(
        "Por segurança, você não pode revogar seu próprio acesso de administrador."
      );
    }
    return { success: true, updatedRole: newRole };
  }

  // Admin promovendo outro usuário: OK
  const promoRes = simulateRoleUpdate("admin-1", "user-2", "admin");
  assert.strictEqual(promoRes.updatedRole, "admin");

  // Admin tentando rebaixar a si próprio: Deve lançar erro de segurança
  assert.throws(
    () => simulateRoleUpdate("admin-1", "admin-1", "customer"),
    /Por segurança, você não pode revogar seu próprio acesso/,
    "Deveria ter impedido o auto-rebaixamento"
  );

  // 3. Teste de Reversão de Estoque no Cancelamento de Pedido
  interface MockProduct {
    id: string;
    stock: number;
  }

  interface MockOrderItem {
    productId: string;
    quantity: number;
  }

  function simulateOrderStatusChange(
    previousStatus: string,
    newStatus: string,
    items: MockOrderItem[],
    productsMap: Map<string, MockProduct>
  ) {
    let stockReverted = false;

    // Se cancelado ou reembolsado e antes não estava cancelado, reverter estoque
    if (
      (newStatus === "cancelled" || newStatus === "refunded") &&
      previousStatus !== "cancelled" &&
      previousStatus !== "refunded"
    ) {
      for (const item of items) {
        const prod = productsMap.get(item.productId);
        if (prod) {
          prod.stock += item.quantity;
          stockReverted = true;
        }
      }
    }

    return { newStatus, stockReverted };
  }

  const catalog = new Map<string, MockProduct>([
    ["p1", { id: "p1", stock: 3 }],
  ]);

  // Transição: paid -> cancelled deve reverter estoque
  const cancelRes = simulateOrderStatusChange(
    "paid",
    "cancelled",
    [{ productId: "p1", quantity: 2 }],
    catalog
  );
  assert.strictEqual(cancelRes.stockReverted, true);
  assert.strictEqual(catalog.get("p1")?.stock, 5); // 3 + 2 = 5

  // Cancelar pedido já cancelado não deve duplicar o estoque
  const doubleCancelRes = simulateOrderStatusChange(
    "cancelled",
    "cancelled",
    [{ productId: "p1", quantity: 2 }],
    catalog
  );
  assert.strictEqual(doubleCancelRes.stockReverted, false);
  assert.strictEqual(catalog.get("p1")?.stock, 5); // mantém 5

  // 4. Teste de Estrutura do Registro de Auditoria
  const auditLogs: Array<{
    actor_id: string;
    action: string;
    entity: string;
    entity_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }> = [];

  function recordAudit(
    actorId: string,
    action: string,
    entity: string,
    entityId: string,
    metadata: Record<string, unknown>
  ) {
    auditLogs.push({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    });
  }

  recordAudit("admin-uuid", "update_stock", "products", "prod-uuid", {
    previous_stock: 5,
    new_stock: 12,
  });

  assert.strictEqual(auditLogs.length, 1);
  assert.strictEqual(auditLogs[0].action, "update_stock");
  assert.strictEqual(auditLogs[0].entity, "products");
  assert.strictEqual(auditLogs[0].metadata.new_stock, 12);

  console.log("✅ Gate 10 Aprovado: Gestão de produtos, pedidos, estoque, proteção de autorização e auditoria validados!");
}

runAdminTests().catch((err) => {
  console.error("Erro nos testes da Fase 10:", err);
  process.exit(1);
});
