"use server";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type ActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const next = (formData.get("next") as string) || "/conta";

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Verifique os dados informados.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return {
        success: false,
        message: "E-mail ou senha incorretos. Tente novamente.",
      };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        message:
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
      };
    }
    return {
      success: false,
      message:
        error.message ||
        "Erro ao realizar login. Tente novamente mais tarde.",
    };
  }

  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/conta");
}

export async function registerAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const headerList = await headers();
  const origin =
    headerList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        full_name: validation.data.fullName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return {
        success: false,
        message:
          "Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.",
      };
    }
    return {
      success: false,
      message: error.message || "Erro ao criar conta. Tente novamente.",
    };
  }

  // Se o Supabase autenticar imediatamente
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/conta");
  }

  return {
    success: true,
    message:
      "Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail.",
  };
}

export async function forgotPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get("email"),
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Informe um e-mail válido.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const headerList = await headers();
  const origin =
    headerList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.data.email,
    {
      redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
    }
  );

  if (error) {
    return {
      success: false,
      message:
        "Não foi possível enviar o link de recuperação. Tente novamente mais tarde.",
    };
  }

  return {
    success: true,
    message:
      "Se o e-mail estiver cadastrado, você receberá um link seguro para redefinir sua senha.",
  };
}

export async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Verifique a nova senha.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return {
      success: false,
      message:
        "Falha ao atualizar a senha. O link de recuperação pode ter expirado.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/conta?message=senha_atualizada");
}
