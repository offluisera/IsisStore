import { z } from "zod";

export const validateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Informe o código do cupom.")
    .max(50, "Código muito longo.")
    .regex(/^[A-Za-z0-9_-]+$/, "Código de cupom contém caracteres inválidos.")
    .transform((val) => val.toUpperCase()),
  subtotalCents: z.number().int().nonnegative("Subtotal inválido."),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

export const saveCouponSchema = z
  .object({
    id: z.string().uuid().optional(),
    code: z
      .string()
      .min(2, "O código do cupom deve ter pelo menos 2 caracteres.")
      .max(30, "Código muito longo (máximo 30 caracteres).")
      .regex(/^[A-Za-z0-9_-]+$/, "O código deve conter apenas letras, números e hífens.")
      .trim()
      .transform((val) => val.toUpperCase()),
    description: z.string().max(300, "Descrição muito longa.").optional().or(z.literal("")),
    discount_type: z.enum(["percentage", "fixed"], {
      message: "Selecione 'percentage' (%) ou 'fixed' (R$).",
    }),
    discount_value: z.number().positive("O valor do desconto deve ser maior que zero."),
    min_subtotal_cents: z.number().int().nonnegative().default(0),
    max_discount_cents: z.number().int().positive().optional().nullable(),
    usage_limit: z.number().int().positive().optional().nullable(),
    is_active: z.boolean().default(true),
    starts_at: z.string().optional().nullable().or(z.literal("")),
    expires_at: z.string().optional().nullable().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.discount_type === "percentage" && data.discount_value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Desconto em porcentagem não pode ultrapassar 100%.",
      path: ["discount_value"],
    }
  );

export type SaveCouponInput = z.infer<typeof saveCouponSchema>;
