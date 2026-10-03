"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser, logAdminAudit, type AdminActionResult } from "@/features/admin/actions";
import { validateCouponDiscount } from "@/lib/coupons/coupon-engine";
import { saveCouponSchema, validateCouponSchema } from "@/schemas/coupon";
import type { Coupon, CouponValidationResult } from "@/lib/coupons/types";

/**
 * Validação de cupom no carrinho e checkout.
 * Acessível tanto para clientes logados quanto anônimos.
 */
export async function validateCouponAction(
  code: string,
  subtotalCents: number
): Promise<CouponValidationResult> {
  const parsed = validateCouponSchema.safeParse({ code, subtotalCents });
  if (!parsed.success) {
    return {
      valid: false,
      message: parsed.error.issues[0]?.message || "Código de cupom inválido.",
    };
  }

  const supabase = await createClient();
  const upperCode = parsed.data.code;

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", upperCode)
    .maybeSingle();

  if (error || !coupon) {
    // Compatibilidade histórica com ISIS10 se não cadastrado
    if (upperCode === "ISIS10") {
      const virtualCoupon: Coupon = {
        id: "virtual-isis10",
        code: "ISIS10",
        description: "Cupom Oficial de Boas-Vindas 10% OFF",
        discount_type: "percentage",
        discount_value: 10,
        min_subtotal_cents: 0,
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return validateCouponDiscount(virtualCoupon, subtotalCents);
    }

    return {
      valid: false,
      message: "Cupom não encontrado ou inválido.",
    };
  }

  return validateCouponDiscount(coupon as unknown as Coupon, subtotalCents);
}

/**
 * Listagem de cupons para o painel administrativo.
 */
export async function adminListCouponsAction(): Promise<Coupon[]> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase) {
    return [];
  }

  const { data, error } = await auth.supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as unknown as Coupon[];
}

/**
 * Criação ou edição de cupom no painel administrativo.
 */
export async function adminSaveCouponAction(
  formData: FormData
): Promise<AdminActionResult & { coupon?: Coupon }> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const discountType = String(formData.get("discount_type") || "percentage");

  // Valor do desconto:
  // Se porcentagem: número direto (ex: 15 para 15%)
  // Se fixo: converter reais para centavos (ex: 20 -> 2000)
  const rawDiscountValue = parseFloat(
    String(formData.get("discount_value") || "0").replace(",", ".")
  );
  const discountValue =
    discountType === "fixed"
      ? Math.round(rawDiscountValue * 100)
      : rawDiscountValue;

  const rawMinSubtotal = parseFloat(
    String(formData.get("min_subtotal_reais") || "0").replace(",", ".")
  );
  const minSubtotalCents = Math.round(rawMinSubtotal * 100);

  const rawMaxDiscount = formData.get("max_discount_reais")
    ? parseFloat(String(formData.get("max_discount_reais")).replace(",", "."))
    : null;
  const maxDiscountCents =
    rawMaxDiscount && rawMaxDiscount > 0
      ? Math.round(rawMaxDiscount * 100)
      : null;

  const rawUsageLimit = formData.get("usage_limit")
    ? parseInt(String(formData.get("usage_limit")), 10)
    : null;
  const usageLimit = rawUsageLimit && rawUsageLimit > 0 ? rawUsageLimit : null;

  const isActive = formData.has("is_active")
    ? formData.get("is_active") === "true"
    : true;
  const expiresAt = formData.get("expires_at")
    ? String(formData.get("expires_at"))
    : null;

  const rawPayload = {
    id,
    code,
    description,
    discount_type: discountType,
    discount_value: discountValue,
    min_subtotal_cents: minSubtotalCents,
    max_discount_cents: maxDiscountCents,
    usage_limit: usageLimit,
    is_active: isActive,
    expires_at: expiresAt || null,
  };

  const parsed = saveCouponSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dados de cupom inválidos.",
    };
  }

  const couponData = parsed.data;

  try {
    if (couponData.id) {
      // Atualizar cupom existente
      const { data: updated, error: updateError } = await auth.supabase
        .from("coupons")
        .update({
          code: couponData.code,
          description: couponData.description || null,
          discount_type: couponData.discount_type,
          discount_value: couponData.discount_value,
          min_subtotal_cents: couponData.min_subtotal_cents,
          max_discount_cents: couponData.max_discount_cents,
          usage_limit: couponData.usage_limit,
          is_active: couponData.is_active,
          expires_at: couponData.expires_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", couponData.id)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === "23505") {
          return { success: false, message: "Já existe outro cupom com este código." };
        }
        throw updateError;
      }

      await logAdminAudit(
        auth.supabase,
        auth.user.id,
        "update_coupon",
        "coupons",
        couponData.id,
        { code: couponData.code }
      );

      revalidatePath("/admin/cupons");
      revalidatePath("/checkout");

      return {
        success: true,
        message: `Cupom ${couponData.code} atualizado com sucesso!`,
        coupon: updated as unknown as Coupon,
      };
    } else {
      // Criar novo cupom
      const { data: created, error: insertError } = await auth.supabase
        .from("coupons")
        .insert({
          code: couponData.code,
          description: couponData.description || null,
          discount_type: couponData.discount_type,
          discount_value: couponData.discount_value,
          min_subtotal_cents: couponData.min_subtotal_cents,
          max_discount_cents: couponData.max_discount_cents,
          usage_limit: couponData.usage_limit,
          is_active: couponData.is_active,
          expires_at: couponData.expires_at || null,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          return { success: false, message: "Já existe um cupom cadastrado com este código." };
        }
        throw insertError;
      }

      await logAdminAudit(
        auth.supabase,
        auth.user.id,
        "create_coupon",
        "coupons",
        created.id,
        { code: couponData.code }
      );

      revalidatePath("/admin/cupons");
      revalidatePath("/checkout");

      return {
        success: true,
        message: `Cupom ${couponData.code} criado com sucesso!`,
        coupon: created as unknown as Coupon,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Erro ao salvar cupom: ${msg}` };
  }
}

/**
 * Ativa ou desativa um cupom instantaneamente.
 */
export async function adminToggleCouponAction(
  id: string,
  isActive: boolean
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const { error } = await auth.supabase
    .from("coupons")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, message: "Falha ao alterar status do cupom." };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "toggle_coupon_status",
    "coupons",
    id,
    { is_active: isActive }
  );

  revalidatePath("/admin/cupons");
  revalidatePath("/checkout");

  return {
    success: true,
    message: isActive ? "Cupom ativado!" : "Cupom desativado!",
  };
}

/**
 * Exclui um cupom.
 */
export async function adminDeleteCouponAction(id: string): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const { error } = await auth.supabase.from("coupons").delete().eq("id", id);

  if (error) {
    return { success: false, message: "Falha ao excluir cupom." };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "delete_coupon",
    "coupons",
    id,
    {}
  );

  revalidatePath("/admin/cupons");
  revalidatePath("/checkout");

  return { success: true, message: "Cupom excluído com sucesso." };
}
