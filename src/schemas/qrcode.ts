import { z } from "zod";

export const qrIconStyleSchema = z.enum(["coracao", "estrela", "logo", "nenhum"]);

export const saveQrHomenagemSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  identificacao_pedido: z
    .string()
    .trim()
    .min(2, "Informe a identificação do pedido ou nome do cliente.")
    .max(160, "A identificação do pedido deve ter no máximo 160 caracteres."),
  titulo_homenagem: z
    .string()
    .trim()
    .min(2, "Informe o título da homenagem.")
    .max(120, "O título da homenagem deve ter no máximo 120 caracteres."),
  nome_homenageado: z
    .string()
    .trim()
    .min(1, "Informe o nome do homenageado.")
    .max(100, "O nome do homenageado deve ter no máximo 100 caracteres."),
  mensagem_texto: z
    .string()
    .trim()
    .min(2, "Escreva a mensagem especial da homenagem.")
    .max(5000, "A mensagem deve ter no máximo 5000 caracteres."),
  foto_principal: z.string().trim().nullable().optional(),
  galeria_fotos: z.array(z.string().trim()).max(12, "Máximo de 12 fotos na galeria.").default([]),
  arquivo_video: z.string().trim().nullable().optional(),
  arquivo_audio: z.string().trim().nullable().optional(),
  estilo_icone_qr: qrIconStyleSchema.default("coracao"),
  cor_qr: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Cor hexadecimal inválida.")
    .default("#000000"),
});

export type SaveQrHomenagemSchemaType = z.infer<typeof saveQrHomenagemSchema>;

