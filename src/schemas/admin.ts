import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nome da categoria deve ter pelo menos 2 caracteres."),
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens.")
    .optional(),
  description: z.string().optional(),
});

export const updateStockSchema = z.object({
  productId: z.string().uuid("ID do produto inválido."),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo."),
});

export const updateProductStatusSchema = z.object({
  productId: z.string().uuid("ID do produto inválido."),
  status: z.enum(["draft", "published", "archived"], {
    message: "Status de produto inválido.",
  }),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("ID do pedido inválido."),
  status: z.enum(
    [
      "pending_payment",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
    {
      message: "Status de pedido inválido.",
    }
  ),
  trackingCode: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
  role: z.enum(["customer", "admin"], {
    message: "Papel de usuário inválido.",
  }),
});
