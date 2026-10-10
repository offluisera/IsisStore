import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Nome do produto é obrigatório.")
    .min(3, "Nome deve ter ao menos 3 caracteres.")
    .trim(),
  categoryId: z.string().min(1, "Selecione uma categoria válida."),
  price: z
    .string()
    .min(1, "Preço é obrigatório.")
    .regex(/^\d+([.,]\d{1,2})?$/, "Informe um valor válido (ex: 99,90)."),
  salePrice: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, "Informe um valor válido (ex: 79,90).")
    .optional()
    .or(z.literal("")),
  stock: z
    .string()
    .min(1, "Estoque é obrigatório.")
    .regex(/^\d+$/, "Estoque deve ser um número inteiro positivo."),
  imageUrl: z
    .string()
    .optional()
    .or(z.literal("")),
  shortDescription: z
    .string()
    .max(160, "Resumo deve ter no máximo 160 caracteres.")
    .optional(),
  description: z.string().optional(),
  status: z
    .enum(["published", "draft", "archived"])
    .optional()
    .default("published"),
  featured: z.boolean().default(false),
  hasSizes: z.boolean().default(false),
  sizes: z.array(z.string()).default([]),
  hasColors: z.boolean().default(false),
  colors: z.array(z.string()).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

export const updateProductSchema = z.object({
  id: z.string().min(1, "ID do produto é obrigatório."),
  name: z
    .string()
    .min(1, "Nome do produto é obrigatório.")
    .min(3, "Nome deve ter ao menos 3 caracteres.")
    .trim(),
  categoryId: z.string().min(1, "Selecione uma categoria válida."),
  price: z
    .string()
    .min(1, "Preço é obrigatório.")
    .regex(/^\d+([.,]\d{1,2})?$/, "Informe um valor válido (ex: 99,90)."),
  salePrice: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, "Informe um valor válido (ex: 79,90).")
    .optional()
    .or(z.literal("")),
  stock: z
    .string()
    .min(1, "Estoque é obrigatório.")
    .regex(/^\d+$/, "Estoque deve ser um número inteiro positivo."),
  status: z.enum(["published", "draft", "archived"]).default("published"),
  imageUrl: z.string().optional().or(z.literal("")),
  shortDescription: z
    .string()
    .max(160, "Resumo deve ter no máximo 160 caracteres.")
    .optional()
    .or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  hasSizes: z.boolean().default(false),
  sizes: z.array(z.string()).default([]),
  hasColors: z.boolean().default(false),
  colors: z.array(z.string()).default([]),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

