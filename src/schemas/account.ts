import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nome completo deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  phone: z
    .string()
    .regex(
      /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
      "Informe um telefone ou WhatsApp válido no formato (DDD) 99999-9999"
    )
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const addressSchema = z.object({
  recipientName: z
    .string()
    .min(3, "Informe o nome de quem receberá o pedido")
    .max(80, "Nome muito longo"),
  postalCode: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .pipe(z.string().length(8, "CEP deve conter exatamente 8 dígitos numéricos")),
  street: z.string().min(2, "Informe a rua/avenida"),
  number: z.string().min(1, "Informe o número do imóvel"),
  complement: z.string().max(60, "Complemento muito longo").optional().or(z.literal("")),
  neighborhood: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  state: z
    .string()
    .length(2, "Informe a sigla do estado com 2 letras (ex: SP)")
    .transform((val) => val.toUpperCase()),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
