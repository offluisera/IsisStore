"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Json } from "@/types/database";
import {
  categorySchema,
  updateStockSchema,
  updateProductStatusSchema,
  updateOrderStatusSchema,
  updateUserRoleSchema,
} from "@/schemas/admin";

export type AdminActionResult = {
  success: boolean;
  message: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// 1. Verificador estrito de Sessão e Privilégios de Administrador
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

// 2. Helper de Log de Auditoria Imutável
async function logAdminAudit(
  supabase: SupabaseServerClient,
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  metadata: Json = {}
) {
  try {
    await supabase.from("admin_audit_logs").insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      metadata,
    });
  } catch (err) {
    console.error("Falha ao gravar log de auditoria administrativa:", err);
  }
}

// 3. Atualizar Estoque de Produto
export async function updateProductStockAction(
  productId: string,
  stock: number
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const parsed = updateStockSchema.safeParse({ productId, stock });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Valor de estoque inválido.",
    };
  }

  // Buscar estoque anterior para auditoria
  const { data: currentProduct } = await auth.supabase
    .from("products")
    .select("name, stock, sku")
    .eq("id", productId)
    .single();

  const previousStock = currentProduct?.stock ?? null;

  const { error } = await auth.supabase
    .from("products")
    .update({ stock: parsed.data.stock })
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      message: "Falha ao atualizar estoque do produto.",
    };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "update_stock",
    "products",
    productId,
    {
      product_name: currentProduct?.name,
      sku: currentProduct?.sku,
      previous_stock: previousStock,
      new_stock: parsed.data.stock,
    }
  );

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return {
    success: true,
    message: `Estoque de "${currentProduct?.name || "produto"}" atualizado para ${parsed.data.stock} un.`,
  };
}

// 4. Atualizar Status do Produto (published, draft, archived)
export async function updateProductStatusAction(
  productId: string,
  status: "published" | "draft" | "archived"
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const parsed = updateProductStatusSchema.safeParse({ productId, status });
  if (!parsed.success) {
    return { success: false, message: "Status informado inválido." };
  }

  const { data: currentProduct } = await auth.supabase
    .from("products")
    .select("name, status")
    .eq("id", productId)
    .single();

  const { error } = await auth.supabase
    .from("products")
    .update({ status: parsed.data.status })
    .eq("id", productId);

  if (error) {
    return { success: false, message: "Erro ao atualizar status do produto." };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "update_status",
    "products",
    productId,
    {
      product_name: currentProduct?.name,
      previous_status: currentProduct?.status,
      new_status: parsed.data.status,
    }
  );

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { success: true, message: `Status alterado para "${parsed.data.status}".` };
}

// 5. Excluir / Arquivar Produto
export async function archiveProductAction(
  productId: string
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const { data: currentProduct } = await auth.supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  const { error } = await auth.supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", productId);

  if (error) {
    return { success: false, message: "Erro ao arquivar produto." };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "archive_product",
    "products",
    productId,
    { product_name: currentProduct?.name }
  );

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  return { success: true, message: `Produto arquivado com sucesso.` };
}

// 6. Criar Categoria
export async function createCategoryAction(formData: FormData): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || undefined;

  const baseSlug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

  const parsed = categorySchema.safeParse({ name, slug: baseSlug, description });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Dados de categoria inválidos.",
    };
  }

  const { data: newCat, error } = await auth.supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: baseSlug,
      description: parsed.data.description || null,
      is_active: true,
    })
    .select("id, name, slug")
    .single();

  if (error) {
    return {
      success: false,
      message: error.code === "23505"
        ? "Já existe uma categoria com este nome ou slug."
        : "Erro ao salvar categoria no banco.",
    };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "create_category",
    "categories",
    newCat.id,
    { name: newCat.name, slug: newCat.slug }
  );

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  return { success: true, message: `Categoria "${newCat.name}" criada com sucesso!` };
}

// 7. Excluir Categoria
export async function deleteCategoryAction(categoryId: string): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  // Verificar se há produtos vinculados
  const { count } = await auth.supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return {
      success: false,
      message: `Não é possível excluir: existem ${count} produto(s) vinculados a esta categoria.`,
    };
  }

  const { data: currentCat } = await auth.supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  const { error } = await auth.supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    return { success: false, message: "Erro ao remover categoria." };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "delete_category",
    "categories",
    categoryId,
    { name: currentCat?.name }
  );

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  return { success: true, message: `Categoria excluída com sucesso.` };
}

// 8. Atualizar Status de Pedido com Rastreamento e Reversão de Estoque
export async function updateOrderStatusAction({
  orderId,
  status,
  notes,
}: {
  orderId: string;
  status:
    | "pending_payment"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  notes?: string;
}): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const parsed = updateOrderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) {
    return { success: false, message: "Status de pedido inválido." };
  }

  const { data: currentOrder } = await auth.supabase
    .from("orders")
    .select("order_number, status, notes")
    .eq("id", orderId)
    .single();

  if (!currentOrder) {
    return { success: false, message: "Pedido não encontrado." };
  }

  const previousStatus = currentOrder.status;

  const updateData: {
    status:
      | "pending_payment"
      | "paid"
      | "processing"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "refunded";
    updated_at: string;
    notes?: string;
  } = {
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const { error } = await auth.supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    return { success: false, message: "Erro ao atualizar status do pedido." };
  }

  // Se o pedido for cancelado ou reembolsado e antes não estava cancelado, reverter estoque
  if (
    (parsed.data.status === "cancelled" || parsed.data.status === "refunded") &&
    previousStatus !== "cancelled" &&
    previousStatus !== "refunded"
  ) {
    const { data: items } = await auth.supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (items) {
      for (const item of items) {
        if (item.product_id) {
          const { data: prod } = await auth.supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();

          if (prod) {
            await auth.supabase
              .from("products")
              .update({ stock: prod.stock + item.quantity })
              .eq("id", item.product_id);
          }
        }
      }
    }
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "update_order_status",
    "orders",
    orderId,
    {
      order_number: currentOrder.order_number,
      previous_status: previousStatus,
      new_status: parsed.data.status,
      notes,
    }
  );

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/conta/pedidos");
  return {
    success: true,
    message: `Pedido #${currentOrder.order_number} atualizado para status "${parsed.data.status}".`,
  };
}

// 9. Alterar Permissão / Role de Usuário (Proteção Anti-Autorebaixamento)
export async function updateUserRoleAction(
  userId: string,
  role: "customer" | "admin"
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const parsed = updateUserRoleSchema.safeParse({ userId, role });
  if (!parsed.success) {
    return { success: false, message: "Papel de usuário inválido." };
  }

  // Proteção contra auto-rebaixamento acidental
  if (userId === auth.user.id && role !== "admin") {
    return {
      success: false,
      message: "Por segurança, você não pode revogar seu próprio acesso de administrador.",
    };
  }

  const { data: targetProfile } = await auth.supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .single();

  const { error } = await auth.supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", userId);

  if (error) {
    return { success: false, message: "Erro ao atualizar privilégios do usuário." };
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "update_user_role",
    "profiles",
    userId,
    {
      user_name: targetProfile?.full_name,
      previous_role: targetProfile?.role,
      new_role: parsed.data.role,
    }
  );

  revalidatePath("/admin/clientes");
  return {
    success: true,
    message: `Permissões de "${targetProfile?.full_name || "usuário"}" alteradas para ${parsed.data.role}.`,
  };
}

// 8. Upload e Vinculação de Imagens de Produtos (.webp)
export async function uploadProductImagesAction(
  formData: FormData
): Promise<AdminActionResult & { uploadedUrls?: string[] }> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const productId = formData.get("productId") as string;
  if (!productId) {
    return { success: false, message: "ID do produto não informado." };
  }

  const rawFiles = formData.getAll("files");
  const files: File[] = [];

  for (const item of rawFiles) {
    if (item instanceof File && item.size > 0) {
      files.push(item);
    }
  }

  if (files.length === 0) {
    return { success: false, message: "Nenhum arquivo de imagem válido foi enviado." };
  }

  // Verifica produto
  const { data: product, error: prodErr } = await auth.supabase
    .from("products")
    .select("id, name, slug")
    .eq("id", productId)
    .single();

  if (prodErr || !product) {
    return { success: false, message: "Produto não encontrado para upload." };
  }

  // Conta quantas imagens o produto já possui
  const { count: existingCount } = await auth.supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  const initialSortOrder = existingCount || 0;
  const uploadedUrls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const storagePath = `${productId}/${timestamp}-${randomSuffix}.webp`;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await auth.supabase.storage
        .from("products")
        .upload(storagePath, buffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        console.error("Erro no upload para storage:", uploadError);
        errors.push(`Falha ao subir ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = auth.supabase.storage
        .from("products")
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;
      const isPrimary = initialSortOrder === 0 && i === 0;

      const { error: insertError } = await auth.supabase
        .from("product_images")
        .insert({
          product_id: productId,
          storage_path: storagePath,
          public_url: publicUrl,
          alt_text: product.name,
          is_primary: isPrimary,
          sort_order: initialSortOrder + i,
        });

      if (insertError) {
        console.error("Erro ao registrar product_image:", insertError);
        errors.push(`Falha ao vincular ${file.name} no banco.`);
      } else {
        uploadedUrls.push(publicUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Erro ao processar ${file.name}: ${msg}`);
    }
  }

  await logAdminAudit(
    auth.supabase,
    auth.user.id,
    "upload_product_images",
    "products",
    productId,
    {
      product_name: product.name,
      uploaded_count: uploadedUrls.length,
      errors_count: errors.length,
    }
  );

  // Revalidação em cascata das páginas afetadas
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  revalidatePath(`/produtos/${product.slug}`);
  revalidatePath("/");

  if (uploadedUrls.length === 0) {
    return {
      success: false,
      message: `Nenhuma imagem pôde ser salva: ${errors.join("; ")}`,
    };
  }

  return {
    success: true,
    message: `${uploadedUrls.length} imagem(ns) adicionada(s) com sucesso em formato .webp!`,
    uploadedUrls,
  };
}

// 9. Excluir Imagem de Produto
export async function deleteProductImageAction(
  imageId: string,
  productId: string
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  const { data: image, error: findErr } = await auth.supabase
    .from("product_images")
    .select("id, storage_path, is_primary, product_id, products(slug)")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (findErr || !image) {
    return { success: false, message: "Imagem não encontrada." };
  }

  // Deleta do bucket se houver storage_path
  if (image.storage_path) {
    try {
      await auth.supabase.storage.from("products").remove([image.storage_path]);
    } catch (err) {
      console.warn("Aviso ao remover do storage:", err);
    }
  }

  // Deleta da tabela
  const { error: delErr } = await auth.supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (delErr) {
    return { success: false, message: "Falha ao remover imagem do banco." };
  }

  // Se a imagem excluída era a principal, promove outra como principal
  if (image.is_primary) {
    const { data: nextImages } = await auth.supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1);

    if (nextImages && nextImages.length > 0) {
      await auth.supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", nextImages[0].id);
    }
  }

  const slug = (image.products as { slug?: string } | null)?.slug;
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  if (slug) revalidatePath(`/produtos/${slug}`);
  revalidatePath("/");

  return { success: true, message: "Imagem removida com sucesso." };
}

// 10. Definir Imagem Principal
export async function setPrimaryProductImageAction(
  imageId: string,
  productId: string
): Promise<AdminActionResult> {
  const auth = await getAdminUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  // Remove primary de todas as imagens do produto
  await auth.supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  // Define a selecionada como primary
  const { error } = await auth.supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) {
    return { success: false, message: "Falha ao atualizar imagem principal." };
  }

  const { data: prod } = await auth.supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();

  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
  if (prod?.slug) revalidatePath(`/produtos/${prod.slug}`);
  revalidatePath("/");

  return { success: true, message: "Imagem principal definida com sucesso!" };
}

