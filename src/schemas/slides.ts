import { z } from "zod";

export const slideSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(2, "O título deve ter pelo menos 2 caracteres.")
    .max(100, "O título pode ter no máximo 100 caracteres.")
    .trim(),
  title_highlight: z.string().max(100).default("").transform((v) => v || ""),
  subtitle: z.string().max(300).default("").transform((v) => v || ""),
  badge_text: z.string().max(60).default("").transform((v) => v || ""),
  image_url: z
    .string()
    .min(1, "A imagem do slide é obrigatória.")
    .max(500, "URL da imagem muito longa.")
    .trim(),
  slide_type: z.enum(["editorial", "full_banner"]).default("editorial"),
  primary_button_text: z.string().max(50).default("").transform((v) => v || ""),
  primary_button_url: z.string().max(300).default("").transform((v) => v || ""),
  secondary_button_text: z.string().max(50).default("").transform((v) => v || ""),
  secondary_button_url: z.string().max(300).default("").transform((v) => v || ""),
  bg_theme: z
    .enum(["default", "dark_rose", "soft_pink", "gold_luxury", "deep_wine"])
    .default("default"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type SlideSchemaInput = z.infer<typeof slideSchema>;
