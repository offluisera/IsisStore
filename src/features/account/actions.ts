"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema, addressSchema } from "@/schemas/account";

export type ActionState<T = unknown> = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
};

// 1. Atualizar Perfil do Cliente
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
