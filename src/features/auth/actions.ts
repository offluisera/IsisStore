"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Auto-sincroniza initial_address caso exista em metadata e a tabela addresses esteja sem registro
  try {
    const {
      data: { user: loggedInUser },
    } = await supabase.auth.getUser();

    if (loggedInUser?.user_metadata?.initial_address) {
      const addr = loggedInUser.user_metadata.initial_address;
      if (addr.postal_code && addr.street && addr.number) {
        const { count } = await supabase
          .from("addresses")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", loggedInUser.id);

        if (!count || count === 0) {
          await supabase.from("addresses").insert({
            profile_id: loggedInUser.id,
            recipient_name: loggedInUser.user_metadata.full_name || "Principal",
            postal_code: String(addr.postal_code).replace(/\D/g, ""),
            street: addr.street,
            number: addr.number,
            complement: addr.complement || null,
            neighborhood: addr.neighborhood || "",
            city: addr.city || "",
            state: addr.state || "",
            is_default: true,
          });
        }
      }
    }
  } catch (syncErr) {
    console.warn("Aviso na sincronização de endereço pós-login:", syncErr);
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
    postalCode: (formData.get("postalCode") as string)?.trim() || undefined,
    street: (formData.get("street") as string)?.trim() || undefined,
    number: (formData.get("number") as string)?.trim() || undefined,
    complement: (formData.get("complement") as string)?.trim() || undefined,
    neighborhood: (formData.get("neighborhood") as string)?.trim() || undefined,
    city: (formData.get("city") as string)?.trim() || undefined,
    state: (formData.get("state") as string)?.trim() || undefined,
    acceptTerms: formData.get("acceptTerms") === "true" || formData.get("acceptTerms") === "on",
    newsletterOptIn: formData.get("newsletterOptIn") === "true" || formData.get("newsletterOptIn") === "on",
  };

  const next = (formData.get("next") as string) || "/conta";

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
        newsletter_opt_in: Boolean(validation.data.newsletterOptIn),
        initial_address: validation.data.postalCode
          ? {
              postal_code: validation.data.postalCode,
              street: validation.data.street,
              number: validation.data.number,
              complement: validation.data.complement,
              neighborhood: validation.data.neighborhood,
              city: validation.data.city,
              state: validation.data.state,
            }
          : null,
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

  // Se o usuário foi criado e informou endereço, insere na tabela addresses com privilégio de admin para contornar RLS
  if (data.user && validation.data.postalCode && validation.data.street && validation.data.number) {
    try {
      const adminClient = createAdminClient();

      // Garante que o profile existe
      await adminClient.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: validation.data.fullName,
          email: validation.data.email,
          role: "customer",
        },
        { onConflict: "id" }
      );

      // Insere o endereço inicial se ainda não existir (caso trigger já tenha inserido)
      const { count } = await adminClient
        .from("addresses")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", data.user.id);

      if (!count || count === 0) {
        const { error: insertError } = await adminClient.from("addresses").insert({
          profile_id: data.user.id,
          recipient_name: validation.data.fullName,
          postal_code: validation.data.postalCode.replace(/\D/g, ""),
          street: validation.data.street,
          number: validation.data.number,
          complement: validation.data.complement || null,
          neighborhood: validation.data.neighborhood || "",
          city: validation.data.city || "",
          state: validation.data.state || "",
          is_default: true,
        });

        if (insertError) {
          console.error("Erro ao salvar endereço com adminClient:", insertError);
        }
      }
    } catch (addrErr) {
      console.warn("Aviso ao persistir endereço no cadastro:", addrErr);
    }
  }

  // Se o Supabase autenticar imediatamente
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next.startsWith("/") ? next : "/conta");
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
