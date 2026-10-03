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

export const updateCategorySchema = z.object({
  id: z.string().uuid("ID da categoria inválido."),
  name: z.string().min(2, "Nome da categoria deve ter pelo menos 2 caracteres."),
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens.")
    .optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.coerce.number().int().optional(),
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

export const adminCreateCustomerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nome completo deve ter pelo menos 3 caracteres.")
    .max(100, "Nome muito longo."),
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Informe um e-mail válido.")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres."),
  phone: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  role: z.enum(["customer", "admin"]).default("customer"),
  // Endereço opcional
  postalCode: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
});

export type AdminCreateCustomerInput = z.infer<typeof adminCreateCustomerSchema>;

export const adminUpdateCustomerSchema = z.object({
  userId: z.string().uuid("ID do cliente inválido."),
  fullName: z
    .string()
    .min(3, "Nome completo deve ter pelo menos 3 caracteres.")
    .max(100, "Nome muito longo."),
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Informe um e-mail válido.")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres.")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  role: z.enum(["customer", "admin"]).default("customer"),
  // Endereço opcional
  postalCode: z.string().optional().or(z.literal("")),
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
});

export type AdminUpdateCustomerInput = z.infer<typeof adminUpdateCustomerSchema>;

export const updateGatewaySchema = z.object({
  id: z.string().uuid("ID do gateway inválido"),
  is_active: z.boolean(),
  is_default: z.boolean().optional(),
  settings: z.record(z.string(), z.any()),
});

export type UpdateGatewayInput = z.infer<typeof updateGatewaySchema>;

export const brandFeatureCardSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Título do card é obrigatório.").max(100),
  description: z.string().max(300).default(""),
  badge_text: z.string().max(60).optional().or(z.literal("")),
  badge_variant: z
    .enum(["default", "success", "warning", "discount"])
    .default("default"),
  icon: z
    .enum([
      "gem",
      "shield",
      "gift",
      "award",
      "sparkles",
      "heart",
      "truck",
      "star",
      "crown",
      "check",
    ])
    .default("gem"),
});

export type BrandFeatureCardInput = z.infer<typeof brandFeatureCardSchema>;

export const updateStoreSettingsSchema = z.object({
  store_name: z
    .string()
    .min(2, "Nome da loja deve ter no mínimo 2 caracteres.")
    .max(100, "Nome da loja muito longo (máximo 100 caracteres)."),
  store_tagline: z.string().max(150).optional().nullable().or(z.literal("")),
  store_description: z.string().max(500).optional().nullable().or(z.literal("")),
  logo_url: z.string().max(500).optional().nullable().or(z.literal("")),
  favicon_url: z.string().max(500).optional().nullable().or(z.literal("")),
  meta_title: z.string().max(100).optional().nullable().or(z.literal("")),
  meta_description: z.string().max(300).optional().nullable().or(z.literal("")),
  seo_keywords: z.string().max(500).optional().nullable().or(z.literal("")),
  og_image_url: z.string().max(500).optional().nullable().or(z.literal("")),
  canonical_url: z.string().max(200).optional().nullable().or(z.literal("")),
  support_email: z.string().email("E-mail de suporte inválido.").optional().nullable().or(z.literal("")),
  support_phone: z.string().max(30).optional().nullable().or(z.literal("")),
  instagram_handle: z.string().max(60).optional().nullable().or(z.literal("")),
  announcement_banner_text: z.string().max(250).optional().nullable().or(z.literal("")),
  announcement_banner_active: z.boolean().default(true),
  free_shipping_threshold_cents: z.number().int().nonnegative().default(19900),
  maintenance_mode: z.boolean().default(false),
  maintenance_message: z.string().max(300).optional().nullable().or(z.literal("")),
  brand_features_badge: z.string().max(100).optional().nullable().or(z.literal("")),
  brand_features_title: z.string().max(150).optional().nullable().or(z.literal("")),
  brand_features_subtitle: z.string().max(500).optional().nullable().or(z.literal("")),
  brand_features_cards: z.array(brandFeatureCardSchema).optional(),
  daily_deals_active: z.boolean().default(true),
  daily_deals_discount_percent: z.number().int().min(1).max(99).default(15),
  daily_deals_product_limit: z.number().int().min(1).max(50).default(15),
  daily_deals_title: z.string().max(100).optional().nullable().or(z.literal("")),
  daily_deals_bg_color: z.string().max(30).optional().nullable().or(z.literal("")),
  cnpj: z.string().max(40).optional().nullable().or(z.literal("")),
  support_hours: z.string().max(200).optional().nullable().or(z.literal("")),
  footer_text: z.string().max(500).optional().nullable().or(z.literal("")),
  // Banner Editorial de Presentes & Cupom
  editorial_banner_active: z.boolean().default(true),
  editorial_banner_badge: z.string().max(100).optional().nullable().or(z.literal("")),
  editorial_banner_title: z.string().max(200).optional().nullable().or(z.literal("")),
  editorial_banner_description: z.string().max(800).optional().nullable().or(z.literal("")),
  editorial_banner_coupon_active: z.boolean().default(true),
  editorial_banner_coupon_code: z.string().max(50).optional().nullable().or(z.literal("")),
  editorial_banner_coupon_text: z.string().max(150).optional().nullable().or(z.literal("")),
  editorial_banner_button_text: z.string().max(100).optional().nullable().or(z.literal("")),
  editorial_banner_button_link: z.string().max(300).optional().nullable().or(z.literal("")),
  editorial_banner_whatsapp_button_text: z.string().max(100).optional().nullable().or(z.literal("")),
  editorial_banner_image_url: z.string().max(2000000).optional().nullable().or(z.literal("")),
  editorial_banner_image_tag: z.string().max(100).optional().nullable().or(z.literal("")),
  editorial_banner_image_title: z.string().max(150).optional().nullable().or(z.literal("")),
  editorial_banner_image_subtitle: z.string().max(200).optional().nullable().or(z.literal("")),
});

export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;

export const updateBrandFeaturesSchema = z.object({
  brand_features_badge: z.string().max(100).optional().nullable().or(z.literal("")),
  brand_features_title: z.string().max(150).optional().nullable().or(z.literal("")),
  brand_features_subtitle: z.string().max(500).optional().nullable().or(z.literal("")),
  brand_features_cards: z.array(brandFeatureCardSchema),
});

export type UpdateBrandFeaturesInput = z.infer<typeof updateBrandFeaturesSchema>;


