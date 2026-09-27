import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Informe um e-mail válido.")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Senha é obrigatória.")
    .min(6, "A senha deve ter no mínimo 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Nome completo é obrigatório.")
      .min(3, "O nome deve ter no mínimo 3 caracteres.")
      .trim(),
    email: z
      .string()
      .min(1, "E-mail é obrigatório.")
      .email("Informe um e-mail válido.")
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(1, "Senha é obrigatória.")
      .min(6, "A senha deve ter no mínimo 6 caracteres.")
      .regex(/[0-9]/, "A senha deve conter ao menos um número."),
    confirmPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória.")
      .min(6, "A confirmação deve ter no mínimo 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Informe um e-mail válido.")
    .trim()
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Nova senha é obrigatória.")
      .min(6, "A nova senha deve ter no mínimo 6 caracteres.")
      .regex(/[0-9]/, "A senha deve conter ao menos um número."),
    confirmPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória.")
      .min(6, "A confirmação deve ter no mínimo 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
