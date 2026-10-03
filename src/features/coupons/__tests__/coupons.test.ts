import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateCouponDiscount } from "@/lib/coupons/coupon-engine";
import { saveCouponSchema, validateCouponSchema } from "@/schemas/coupon";
import type { Coupon } from "@/lib/coupons/types";

describe("Sistema de Cupons de Desconto da Isis Store", () => {
  const baseCoupon: Coupon = {
    id: "coupon-1",
    code: "TESTE10",
    description: "10% de desconto",
    discount_type: "percentage",
    discount_value: 10,
    min_subtotal_cents: 0,
    used_count: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  describe("Validação de Desconto Percentual", () => {
    it("deve calcular corretamente 10% em pedido de R$ 200,00 (20000 centavos)", () => {
      const res = validateCouponDiscount(baseCoupon, 20000);
      assert.equal(res.valid, true);
      assert.equal(res.discountCents, 2000);
      assert.equal(res.subtotalWithDiscountCents, 18000);
      assert.equal(res.coupon?.code, "TESTE10");
    });

    it("deve respeitar teto máximo de desconto quando configurado", () => {
      const couponWithCap: Coupon = {
        ...baseCoupon,
        code: "METADE50",
        discount_value: 50,
        max_discount_cents: 3000, // Máximo R$ 30,00
      };

      // 50% de R$ 100,00 seria R$ 50,00, mas o teto é R$ 30,00
      const res = validateCouponDiscount(couponWithCap, 10000);
      assert.equal(res.valid, true);
      assert.equal(res.discountCents, 3000);
      assert.equal(res.subtotalWithDiscountCents, 7000);
    });
  });

  describe("Validação de Desconto Fixo em Reais", () => {
    const fixedCoupon: Coupon = {
      ...baseCoupon,
      code: "MENOS25",
      discount_type: "fixed",
      discount_value: 2500, // R$ 25,00 em centavos
    };

    it("deve abater valor fixo de R$ 25,00 em pedido de R$ 100,00", () => {
      const res = validateCouponDiscount(fixedCoupon, 10000);
      assert.equal(res.valid, true);
      assert.equal(res.discountCents, 2500);
      assert.equal(res.subtotalWithDiscountCents, 7500);
    });

    it("não deve permitir total negativo se desconto fixo for maior que subtotal", () => {
      const res = validateCouponDiscount(fixedCoupon, 1500); // Pedido de R$ 15,00
      assert.equal(res.valid, true);
      assert.equal(res.discountCents, 1500);
      assert.equal(res.subtotalWithDiscountCents, 0);
    });
  });

  describe("Critérios e Restrições de Uso", () => {
    it("deve rejeitar cupom inativo", () => {
      const inactiveCoupon: Coupon = {
        ...baseCoupon,
        is_active: false,
      };
      const res = validateCouponDiscount(inactiveCoupon, 20000);
      assert.equal(res.valid, false);
      assert.match(res.message, /desativado|inativo/i);
    });

    it("deve rejeitar cupom quando subtotal for inferior ao mínimo exigido", () => {
      const minCoupon: Coupon = {
        ...baseCoupon,
        min_subtotal_cents: 15000, // Mínimo R$ 150,00
      };
      const res = validateCouponDiscount(minCoupon, 10000); // Pedido de R$ 100,00
      assert.equal(res.valid, false);
      assert.match(res.message, /mínimo/i);
    });

    it("deve aceitar cupom quando subtotal atinge ou supera o mínimo exigido", () => {
      const minCoupon: Coupon = {
        ...baseCoupon,
        min_subtotal_cents: 15000,
      };
      const res = validateCouponDiscount(minCoupon, 15000);
      assert.equal(res.valid, true);
      assert.equal(res.discountCents, 1500);
      assert.equal(res.subtotalWithDiscountCents, 13500);
    });

    it("deve rejeitar cupom expirado", () => {
      const expiredCoupon: Coupon = {
        ...baseCoupon,
        expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora no passado
      };
      const res = validateCouponDiscount(expiredCoupon, 20000);
      assert.equal(res.valid, false);
      assert.match(res.message, /expirou/i);
    });

    it("deve rejeitar cupom cuja data de início está no futuro", () => {
      const futureCoupon: Coupon = {
        ...baseCoupon,
        starts_at: new Date(Date.now() + 86400000).toISOString(), // amanhã
      };
      const res = validateCouponDiscount(futureCoupon, 20000);
      assert.equal(res.valid, false);
      assert.match(res.message, /ainda não está ativo/i);
    });

    it("deve rejeitar cupom cujo limite de usos foi atingido", () => {
      const limitedCoupon: Coupon = {
        ...baseCoupon,
        usage_limit: 10,
        used_count: 10,
      };
      const res = validateCouponDiscount(limitedCoupon, 20000);
      assert.equal(res.valid, false);
      assert.match(res.message, /limite de utilizações/i);
    });

    it("deve aceitar cupom quando used_count for inferior ao limite", () => {
      const limitedCoupon: Coupon = {
        ...baseCoupon,
        usage_limit: 10,
        used_count: 9,
      };
      const res = validateCouponDiscount(limitedCoupon, 20000);
      assert.equal(res.valid, true);
    });
  });

  describe("Validação de Schemas Zod", () => {
    it("deve sanitizar e validar código de cupom no validateCouponSchema", () => {
      const valid = validateCouponSchema.safeParse({
        code: "  isis10  ",
        subtotalCents: 5000,
      });
      assert.equal(valid.success, true);
      if (valid.success) {
        assert.equal(valid.data.code, "ISIS10");
        assert.equal(valid.data.subtotalCents, 5000);
      }
    });

    it("deve rejeitar códigos com caracteres inválidos", () => {
      const invalid = validateCouponSchema.safeParse({
        code: "CUPOM@#$",
        subtotalCents: 5000,
      });
      assert.equal(invalid.success, false);
    });

    it("deve validar payload completo em saveCouponSchema", () => {
      const valid = saveCouponSchema.safeParse({
        code: "NOVO2026",
        description: "Desconto de Inauguração",
        discount_type: "percentage",
        discount_value: 15,
        min_subtotal_cents: 0,
        is_active: true,
      });
      assert.equal(valid.success, true);
    });

    it("deve rejeitar desconto percentual acima de 100", () => {
      const invalid = saveCouponSchema.safeParse({
        code: "IMPOSSIVEL",
        description: "150% de desconto",
        discount_type: "percentage",
        discount_value: 150,
        min_subtotal_cents: 0,
        is_active: true,
      });
      assert.equal(invalid.success, false);
    });
  });
});
