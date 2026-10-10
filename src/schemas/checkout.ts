import { z } from "zod";

export const productCustomizationSchema = z
  .object({
    text: z.string().max(200, "Texto de personalização muito longo").nullish(),
    imageUrl: z
      .string()
      .url("URL de imagem inválida")
      .or(z.literal(""))
      .nullish(),
    notes: z.string().max(300, "Observações muito longas").nullish(),
    size: z.string().max(50, "Tamanho inválido").nullish(),
    color: z.string().max(50, "Cor inválida").nullish(),
  })
  .nullish();

export const checkoutItemSchema = z.object({
  productId: z.string().uuid("ID de produto inválido"),
  quantity: z.number().int().min(1, "Quantidade mínima é 1").max(50, "Quantidade máxima excedida"),
  customization: productCustomizationSchema,
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
