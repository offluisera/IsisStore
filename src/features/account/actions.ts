"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema, addressSchema, passwordChangeSchema } from "@/schemas/account";

export type ActionState<T = unknown> = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
};

// 1. Atualizar Perfil do Cliente (com suporte a CPF e Telefone)
export async function updateProfileAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    const rawData = {
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      cpf: formData.get("cpf") as string,
    };

    const parsed = profileUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Por favor, corrija os erros no formulário.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        cpf: parsed.data.cpf || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { success: false, message: "Não foi possível salvar os dados. Tente novamente." };
    }

    revalidatePath("/conta");
    revalidatePath("/conta/dados");
    return { success: true, message: "Dados cadastrais atualizados com sucesso!" };
  } catch (err) {
    console.error("Erro inesperado em updateProfileAction:", err);
    return { success: false, message: "Erro no servidor ao processar atualização." };
  }
}

// 1.1 Alterar Senha de Acesso
export async function updatePasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    const rawData = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = passwordChangeSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Por favor, revise os requisitos da senha.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      console.error("Erro ao alterar senha:", error);
      return {
        success: false,
        message: error.message || "Não foi possível alterar sua senha. Tente novamente.",
      };
    }

    return {
      success: true,
      message: "Sua senha foi alterada com sucesso! Utilize a nova senha no próximo acesso.",
    };
  } catch (err) {
    console.error("Erro inesperado em updatePasswordAction:", err);
    return { success: false, message: "Erro ao processar alteração de senha." };
  }
}

// 1.2 Exportar Dados Cadastrais (LGPD)
export async function exportUserDataAction(): Promise<ActionState<string>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    // Buscar Perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Buscar Endereços
    const { data: addresses } = await supabase
      .from("addresses")
      .select("*")
      .eq("profile_id", user.id);

    // Buscar Pedidos
    const { data: orders } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        subtotal_cents,
        shipping_cents,
        discount_cents,
        total_cents,
        created_at,
        order_items (
          product_name,
          quantity,
          unit_price_cents,
          subtotal_cents
        )
      `)
      .eq("customer_id", user.id);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      profile: profile || null,
      addresses: addresses || [],
      orders: orders || [],
    };

    return {
      success: true,
      data: JSON.stringify(exportPayload, null, 2),
      message: "Dados exportados com sucesso!",
    };
  } catch (err) {
    console.error("Erro ao exportar dados LGPD:", err);
    return { success: false, message: "Erro ao gerar arquivo com seus dados." };
  }
}

// 2. Criar Novo Endereço
export async function createAddressAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    const rawData = {
      recipientName: formData.get("recipientName") as string,
      postalCode: formData.get("postalCode") as string,
      street: formData.get("street") as string,
      number: formData.get("number") as string,
      complement: (formData.get("complement") as string) || "",
      neighborhood: formData.get("neighborhood") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      isDefault: formData.get("isDefault") === "on" || formData.get("isDefault") === "true",
    };

    const parsed = addressSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Corrija as inconsistências nos campos do endereço.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    // Se o novo for padrão, remove status de outros endereços do usuário
    if (parsed.data.isDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("profile_id", user.id);
    }

    // Verifica se é o primeiro endereço cadastrado (se for, torna default automaticamente)
    const { count } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);

    const isFirstAddress = count === 0;

    const { error } = await supabase.from("addresses").insert({
      profile_id: user.id,
      recipient_name: parsed.data.recipientName,
      postal_code: parsed.data.postalCode,
      street: parsed.data.street,
      number: parsed.data.number,
      complement: parsed.data.complement || null,
      neighborhood: parsed.data.neighborhood,
      city: parsed.data.city,
      state: parsed.data.state,
      is_default: parsed.data.isDefault || isFirstAddress,
    });

    if (error) {
      console.error("Erro ao cadastrar endereço:", error);
      return { success: false, message: "Erro ao cadastrar endereço. Tente novamente." };
    }

    revalidatePath("/conta/enderecos");
    revalidatePath("/conta");
    return { success: true, message: "Endereço cadastrado com sucesso!" };
  } catch (err) {
    console.error("Erro inesperado em createAddressAction:", err);
    return { success: false, message: "Erro no servidor ao salvar endereço." };
  }
}

// 3. Excluir Endereço
export async function deleteAddressAction(addressId: string): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("profile_id", user.id); // Isolamento RLS explícito

    if (error) {
      console.error("Erro ao remover endereço:", error);
      return { success: false, message: "Não foi possível remover o endereço." };
    }

    revalidatePath("/conta/enderecos");
    revalidatePath("/conta");
    return { success: true, message: "Endereço removido com sucesso!" };
  } catch (err) {
    console.error("Erro em deleteAddressAction:", err);
    return { success: false, message: "Erro no servidor ao remover endereço." };
  }
}

// 4. Definir Endereço como Padrão
export async function setDefaultAddressAction(addressId: string): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Sessão expirada. Faça login novamente." };
    }

    // Desmarcar todos os outros
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("profile_id", user.id);

    // Marcar o selecionado
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("profile_id", user.id);

    if (error) {
      console.error("Erro ao definir endereço padrão:", error);
      return { success: false, message: "Não foi possível atualizar o endereço principal." };
    }

    revalidatePath("/conta/enderecos");
    revalidatePath("/conta");
    return { success: true, message: "Endereço principal atualizado!" };
  } catch (err) {
    console.error("Erro em setDefaultAddressAction:", err);
    return { success: false, message: "Erro no servidor ao definir endereço padrão." };
  }
}
