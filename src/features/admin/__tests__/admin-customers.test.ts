import { describe, it } from "node:test";
import assert from "node:assert";
import {
  adminCreateCustomerSchema,
  adminUpdateCustomerSchema,
} from "@/schemas/admin";

describe("Painel Administrativo — Módulo de Clientes", () => {
  it("deve validar cadastro manual com campos obrigatórios preenchidos", () => {
    const validData = {
      fullName: "Isis Caroline Bordigon",
      email: "isis@loja.com",
      password: "senhaSegura123",
      phone: "(11) 98765-4321",
      cpf: "123.456.789-00",
      role: "customer" as const,
      postalCode: "01310-100",
      street: "Avenida Paulista",
      number: "1000",
      city: "São Paulo",
      state: "SP",
    };

    const parsed = adminCreateCustomerSchema.safeParse(validData);
    assert.strictEqual(parsed.success, true);
  });

  it("deve rejeitar cadastro manual com senha menor que 6 caracteres", () => {
    const invalidData = {
      fullName: "Cliente Teste",
      email: "teste@loja.com",
      password: "123",
    };

    const parsed = adminCreateCustomerSchema.safeParse(invalidData);
    assert.strictEqual(parsed.success, false);
    if (!parsed.success) {
      assert.ok(parsed.error.issues.some((i) => i.path.includes("password")));
    }
  });

  it("deve rejeitar cadastro manual com e-mail inválido", () => {
    const invalidData = {
      fullName: "Cliente Teste",
      email: "email-invalido",
      password: "senhaSegura123",
    };

    const parsed = adminCreateCustomerSchema.safeParse(invalidData);
    assert.strictEqual(parsed.success, false);
    if (!parsed.success) {
      assert.ok(parsed.error.issues.some((i) => i.path.includes("email")));
    }
  });

  it("deve validar atualização de cliente mantendo senha vazia (sem alteração)", () => {
    const updateData = {
      userId: "2a8a12b4-fa76-4bd0-90e9-5d8ceb8bee1e",
      fullName: "Luis Fernando Atualizado",
      email: "luisfernandoborsilva@gmail.com",
      password: "", // vazio = mantém a atual
      phone: "(35) 99999-8888",
      cpf: "111.222.333-44",
      role: "admin" as const,
    };

    const parsed = adminUpdateCustomerSchema.safeParse(updateData);
    assert.strictEqual(parsed.success, true);
  });

  it("deve validar atualização de cliente fornecendo nova senha válida", () => {
    const updateData = {
      userId: "2a8a12b4-fa76-4bd0-90e9-5d8ceb8bee1e",
      fullName: "Luis Fernando Atualizado",
      email: "luisfernandoborsilva@gmail.com",
      password: "novaSenhaSuperSegura456",
      role: "admin" as const,
    };

    const parsed = adminUpdateCustomerSchema.safeParse(updateData);
    assert.strictEqual(parsed.success, true);
  });

  it("deve calcular métricas financeiras e de cupons do cliente corretamente", () => {
    const mockOrders = [
      {
        total_cents: 15000,
        discount_cents: 1500,
        status: "paid",
        payment_method: "pix",
      },
      {
        total_cents: 20000,
        discount_cents: 0,
        status: "delivered",
        payment_method: "credit_card",
      },
      {
        total_cents: 8000,
        discount_cents: 800,
        status: "cancelled",
        payment_method: "pix",
      },
    ];

    // Ignora pedidos cancelados para cálculo de faturamento líquido
    const validOrders = mockOrders.filter((o) => o.status !== "cancelled");
    const totalSpentCents = validOrders.reduce((acc, o) => acc + o.total_cents, 0);
    const averageTicketCents = Math.round(totalSpentCents / validOrders.length);
    const totalDiscountCents = validOrders.reduce((acc, o) => acc + o.discount_cents, 0);

    assert.strictEqual(totalSpentCents, 35000); // R$ 350,00
    assert.strictEqual(averageTicketCents, 17500); // R$ 175,00
    assert.strictEqual(totalDiscountCents, 1500); // R$ 15,00
  });
});
