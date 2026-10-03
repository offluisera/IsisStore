import type { Coupon, CouponValidationResult } from "./types";

/**
 * Valida regras de negócio do cupom contra o subtotal do carrinho.
 * Garante segurança financeira em centavos.
 */
export function validateCouponDiscount(
  coupon: Coupon,
  subtotalCents: number,
  currentDate: Date = new Date()
): CouponValidationResult {
  if (!coupon.is_active) {
    return {
      valid: false,
      message: "Este cupom está desativado no momento.",
    };
  }

  if (coupon.starts_at && currentDate < new Date(coupon.starts_at)) {
    return {
      valid: false,
      message: "Este cupom ainda não está ativo para utilização.",
    };
  }

  if (coupon.expires_at && currentDate > new Date(coupon.expires_at)) {
    return {
      valid: false,
      message: "Este cupom expirou.",
    };
  }

  if (
    coupon.usage_limit !== null &&
    coupon.usage_limit !== undefined &&
    coupon.usage_limit > 0 &&
    coupon.used_count >= coupon.usage_limit
  ) {
    return {
      valid: false,
      message: "O limite de utilizações deste cupom foi atingido.",
    };
  }

  if (subtotalCents < coupon.min_subtotal_cents) {
    const minFormatted = (coupon.min_subtotal_cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return {
      valid: false,
      message: `Este cupom exige um pedido mínimo de ${minFormatted} em produtos.`,
    };
  }

  let discountCents = 0;

  if (coupon.discount_type === "percentage") {
    // Porcentagem: 1 a 100
    const percent = Math.min(100, Math.max(0, coupon.discount_value));
    discountCents = Math.round((subtotalCents * percent) / 100);

    // Teto de desconto máximo opcional
    if (
      coupon.max_discount_cents !== null &&
      coupon.max_discount_cents !== undefined &&
      coupon.max_discount_cents > 0
    ) {
      discountCents = Math.min(discountCents, coupon.max_discount_cents);
    }
  } else if (coupon.discount_type === "fixed") {
    // Valor fixo em centavos (não pode ultrapassar o subtotal)
    const fixedCents = Math.max(0, Math.round(coupon.discount_value));
    discountCents = Math.min(subtotalCents, fixedCents);
  }

  if (discountCents <= 0) {
    return {
      valid: false,
      message: "O cupom não gerou desconto para este carrinho.",
    };
  }

  const subtotalWithDiscount = Math.max(0, subtotalCents - discountCents);

  return {
    valid: true,
    message: "Cupom aplicado com sucesso!",
    discountCents,
    subtotalWithDiscountCents: subtotalWithDiscount,
    coupon: {
      id: coupon.id,
      code: coupon.code.toUpperCase(),
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_cents: discountCents,
      min_subtotal_cents: coupon.min_subtotal_cents,
    },
  };
}
