import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().uuid("ID de produto inválido"),
  quantity: z.number().int().min(1, "Quantidade mínima é 1").max(50, "Quantidade máxima excedida"),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid("Endereço de entrega obrigatório"),
  shippingMethod: z.enum(["pac", "sedex"]),
  paymentMethod: z.enum(["pix", "credit_card", "whatsapp", "infinitepay"]),
  couponCode: z.string().optional().or(z.literal("")),
  notes: z.string().max(250, "Observação muito longa").optional().or(z.literal("")),
  items: z.array(checkoutItemSchema).min(1, "O carrinho está vazio"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
