"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { slideSchema } from "@/schemas/slides";
import type { HomeSlide } from "@/lib/slides/types";
import { DEFAULT_HOME_SLIDES } from "@/lib/slides/types";

export type SlideActionResult = {
  success: boolean;
  message: string;
  slide?: HomeSlide;
  slides?: HomeSlide[];
};

async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada ou não autenticado." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Acesso negado: privilégio de administrador obrigatório." };
  }

  return { supabase, user, profile };
}

export async function getAdminSlidesAction(): Promise<{
  success: boolean;
  message?: string;
  slides: HomeSlide[];
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erro ao buscar slides no Supabase:", error);
      return {
        success: true,
        slides: DEFAULT_HOME_SLIDES,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        slides: DEFAULT_HOME_SLIDES,
      };
    }

    return {
      success: true,
      slides: (data as unknown as HomeSlide[]) || DEFAULT_HOME_SLIDES,
    };
  } catch (err) {
    console.error("Exceção ao carregar slides admin:", err);
    return {
      success: false,
      message: "Falha interna ao carregar slides.",
      slides: DEFAULT_HOME_SLIDES,
    };
  }
}

export async function saveSlideAction(
  rawData: unknown
): Promise<SlideActionResult> {
  const auth = await getAdminUser();
  if ("error" in auth || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const parsed = slideSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dados do slide inválidos.",
    };
  }

  const slideData = parsed.data;

  try {
    if (slideData.id) {
      // Atualizar slide existente
      const { data, error } = await auth.supabase
        .from("home_slides")
        .update({
          title: slideData.title,
          title_highlight: slideData.title_highlight,
          subtitle: slideData.subtitle,
          badge_text: slideData.badge_text,
          image_url: slideData.image_url,
          slide_type: slideData.slide_type,
          primary_button_text: slideData.primary_button_text,
          primary_button_url: slideData.primary_button_url,
          secondary_button_text: slideData.secondary_button_text,
          secondary_button_url: slideData.secondary_button_url,
          bg_theme: slideData.bg_theme,
          is_active: slideData.is_active,
          sort_order: slideData.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", slideData.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await auth.supabase.from("admin_audit_logs").insert({
        actor_id: auth.user.id,
        action: "update_home_slide",
        entity: "home_slides",
        entity_id: slideData.id,
        metadata: { title: slideData.title },
      });

      revalidatePath("/", "page");
      revalidatePath("/admin/configuracoes");

      return {
        success: true,
        message: "Slide atualizado com sucesso!",
        slide: data as unknown as HomeSlide,
      };
    } else {
      // Criar novo slide
      const { data, error } = await auth.supabase
        .from("home_slides")
        .insert({
          title: slideData.title,
          title_highlight: slideData.title_highlight,
          subtitle: slideData.subtitle,
          badge_text: slideData.badge_text,
          image_url: slideData.image_url,
          slide_type: slideData.slide_type,
          primary_button_text: slideData.primary_button_text,
          primary_button_url: slideData.primary_button_url,
          secondary_button_text: slideData.secondary_button_text,
          secondary_button_url: slideData.secondary_button_url,
          bg_theme: slideData.bg_theme,
          is_active: slideData.is_active,
          sort_order: slideData.sort_order,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await auth.supabase.from("admin_audit_logs").insert({
        actor_id: auth.user.id,
        action: "create_home_slide",
        entity: "home_slides",
        entity_id: data.id,
        metadata: { title: slideData.title },
      });

      revalidatePath("/", "page");
      revalidatePath("/admin/configuracoes");

      return {
        success: true,
        message: "Novo slide adicionado com sucesso!",
        slide: data as unknown as HomeSlide,
      };
    }
  } catch (err: unknown) {
    console.error("Erro ao salvar slide:", err);
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Erro desconhecido ao salvar slide.",
    };
  }
}

export async function deleteSlideAction(
  slideId: string
): Promise<SlideActionResult> {
  const auth = await getAdminUser();
  if ("error" in auth || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  try {
    const { error } = await auth.supabase
      .from("home_slides")
      .delete()
      .eq("id", slideId);

    if (error) {
      throw error;
    }

    await auth.supabase.from("admin_audit_logs").insert({
      actor_id: auth.user.id,
      action: "delete_home_slide",
      entity: "home_slides",
      entity_id: slideId,
      metadata: { deleted_id: slideId },
    });

    revalidatePath("/", "page");
    revalidatePath("/admin/configuracoes");

    return {
      success: true,
      message: "Slide excluído com sucesso!",
    };
  } catch (err: unknown) {
    console.error("Erro ao excluir slide:", err);
    return {
      success: false,
      message: "Não foi possível excluir o slide.",
    };
  }
}

export async function toggleSlideActiveAction(
  slideId: string,
  isActive: boolean
): Promise<SlideActionResult> {
  const auth = await getAdminUser();
  if ("error" in auth || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  try {
    const { error } = await auth.supabase
      .from("home_slides")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slideId);

    if (error) {
      throw error;
    }

    revalidatePath("/", "page");
    revalidatePath("/admin/configuracoes");

    return {
      success: true,
      message: isActive ? "Slide ativado na loja!" : "Slide desativado!",
    };
  } catch (err: unknown) {
    console.error("Erro ao alterar status do slide:", err);
    return {
      success: false,
      message: "Erro ao atualizar status do slide.",
    };
  }
}

export async function reorderSlidesAction(
  orderedIds: string[]
): Promise<SlideActionResult> {
  const auth = await getAdminUser();
  if ("error" in auth || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await auth.supabase
        .from("home_slides")
        .update({
          sort_order: i + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderedIds[i]);
    }

    revalidatePath("/", "page");
    revalidatePath("/admin/configuracoes");

    return {
      success: true,
      message: "Ordem dos slides atualizada!",
    };
  } catch (err: unknown) {
    console.error("Erro ao reordenar slides:", err);
    return {
      success: false,
      message: "Erro ao reordenar slides.",
    };
  }
}
