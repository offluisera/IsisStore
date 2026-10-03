export type CouponDiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: CouponDiscountType;
  discount_value: number; // Porcentagem (1-100) ou Valor Fixo em centavos
  min_subtotal_cents: number;
  max_discount_cents?: number | null;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  discountCents?: number;
  subtotalWithDiscountCents?: number;
  coupon?: {
    id: string;
    code: string;
    description?: string | null;
    discount_type: CouponDiscountType;
    discount_value: number;
    discount_cents: number;
    min_subtotal_cents: number;
  };
}

export interface CouponFormData {
  id?: string;
  code: string;
  description?: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_subtotal_reais?: string;
  max_discount_reais?: string;
  usage_limit?: number | null;
  is_active: boolean;
  expires_at?: string | null;
}
