"use server";

import { createClient } from "@/lib/supabase/server";
import { productSchema, updateProductSchema } from "@/schemas/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AdminActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function parseCurrencyToCents(val: string): number {
  const clean = val.replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(clean) * 100);
}

function parseListInput(raw: FormDataEntryValue | null, allValues: FormDataEntryValue[]): string[] {
  if (typeof raw === "string" && raw.trim()) {
    try {
      const json = JSON.parse(raw);
      if (Array.isArray(json)) return json.map(String).map((s) => s.trim()).filter(Boolean);
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return allValues.map(String).map((s) => s.trim()).filter(Boolean);
}

export async function createProductAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const rawSizes = parseListInput(formData.get("sizes"), formData.getAll("sizes"));
  const rawColors = parseListInput(formData.get("colors"), formData.getAll("colors"));

  const rawData = {
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    salePrice: (formData.get("salePrice") as string) || undefined,
    stock: formData.get("stock"),
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    shortDescription: (formData.get("shortDescription") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || "published",
    featured:
      formData.get("featured") === "on" || formData.get("featured") === "true",
    hasSizes:
      formData.get("hasSizes") === "on" || formData.get("hasSizes") === "true",
    sizes: rawSizes,
    hasColors:
      formData.get("hasColors") === "on" || formData.get("hasColors") === "true",
    colors: rawColors,
  };

  const validation = productSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Verifique os dados informados no formulário.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Acesso não autorizado." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      success: false,
      message: "Apenas administradores podem cadastrar produtos.",
    };
  }

  const baseSlug = slugify(validation.data.name);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const slug = `${baseSlug}-${randomSuffix}`;
  const sku = `IS-${Math.floor(10000 + Math.random() * 90000)}`;

  const priceCents = parseCurrencyToCents(validation.data.price);
  const salePriceCents = validation.data.salePrice
    ? parseCurrencyToCents(validation.data.salePrice)
    : null;
  const stock = parseInt(validation.data.stock, 10);
  const productStatus = validation.data.status || "published";

  const { data: newProduct, error: insertError } = await supabase
    .from("products")
    .insert({
      name: validation.data.name,
      slug,
      sku,
      category_id: validation.data.categoryId,
      price_cents: priceCents,
      sale_price_cents: salePriceCents,
      stock,
      short_description: validation.data.shortDescription || null,
      description: validation.data.description || null,
      status: productStatus,
      featured: validation.data.featured,
      has_sizes: validation.data.hasSizes,
      sizes: validation.data.sizes,
      has_colors: validation.data.hasColors,
      colors: validation.data.colors,
    })
    .select()
    .single();

  if (insertError || !newProduct) {
    return {
      success: false,
      message:
        insertError?.message || "Erro ao salvar produto no banco de dados.",
    };
  }

  // Processamento de imagens enviadas do computador (.webp)
  const rawFiles = formData.getAll("files");
  const primaryIndex = parseInt((formData.get("primaryIndex") as string) || "0", 10);
  const files: File[] = [];

  for (const item of rawFiles) {
    if (item instanceof File && item.size > 0) {
      files.push(item);
    }
  }

  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const storagePath = `${newProduct.id}/${timestamp}-${randomSuffix}.webp`;

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(storagePath, buffer, {
            contentType: "image/webp",
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("products")
            .getPublicUrl(storagePath);

          await supabase.from("product_images").insert({
            product_id: newProduct.id,
            storage_path: storagePath,
            public_url: urlData.publicUrl,
            alt_text: newProduct.name,
            is_primary: i === primaryIndex,
            sort_order: i + 1,
          });
        }
      } catch (err) {
        console.error("Erro no upload de foto para novo produto:", err);
      }
    }
  } else if (validation.data.imageUrl) {
    await supabase.from("product_images").insert({
      product_id: newProduct.id,
      public_url: validation.data.imageUrl,
      storage_path: validation.data.imageUrl,
      alt_text: validation.data.name,
      is_primary: true,
      sort_order: 1,
    });
  }

  // Gravar auditoria administrativa
  await supabase.from("admin_audit_logs").insert({
    actor_id: user.id,
    action: "create_product",
    entity: "products",
    entity_id: newProduct.id,
    metadata: {
      name: newProduct.name,
      sku: newProduct.sku,
      price_cents: priceCents,
      stock,
      status: productStatus,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/rascunhos");
  revalidatePath("/admin/produtos/estoque");
  revalidatePath("/admin/produtos/relatorios");

  if (productStatus === "draft") {
    redirect("/admin/produtos/rascunhos?created=1");
  } else {
    redirect("/admin/produtos?created=1");
  }
}

export async function updateProductAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const rawSizes = parseListInput(formData.get("sizes"), formData.getAll("sizes"));
  const rawColors = parseListInput(formData.get("colors"), formData.getAll("colors"));

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    salePrice: (formData.get("salePrice") as string) || undefined,
    stock: formData.get("stock"),
    status: (formData.get("status") as string) || "published",
    shortDescription: (formData.get("shortDescription") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    featured:
      formData.get("featured") === "on" || formData.get("featured") === "true",
    hasSizes:
      formData.get("hasSizes") === "on" || formData.get("hasSizes") === "true",
    sizes: rawSizes,
    hasColors:
      formData.get("hasColors") === "on" || formData.get("hasColors") === "true",
    colors: rawColors,
  };

  const validation = updateProductSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Verifique os dados informados.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Acesso não autorizado." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      success: false,
      message: "Apenas administradores podem editar produtos.",
    };
  }

  const priceCents = parseCurrencyToCents(validation.data.price);
  const salePriceCents = validation.data.salePrice
    ? parseCurrencyToCents(validation.data.salePrice)
    : null;
  const stock = parseInt(validation.data.stock, 10);
  const productStatus = validation.data.status;

  const { data: updatedProduct, error: updateError } = await supabase
    .from("products")
    .update({
      name: validation.data.name,
      category_id: validation.data.categoryId,
      price_cents: priceCents,
      sale_price_cents: salePriceCents,
      stock,
      status: productStatus,
      short_description: validation.data.shortDescription || null,
      description: validation.data.description || null,
      featured: validation.data.featured,
      has_sizes: validation.data.hasSizes,
      sizes: validation.data.sizes,
      has_colors: validation.data.hasColors,
      colors: validation.data.colors,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validation.data.id)
    .select()
    .single();

  if (updateError || !updatedProduct) {
    return {
      success: false,
      message:
        updateError?.message || "Erro ao atualizar produto no banco de dados.",
    };
  }

  // Gravar auditoria administrativa
  await supabase.from("admin_audit_logs").insert({
    actor_id: user.id,
    action: "update_product",
    entity: "products",
    entity_id: updatedProduct.id,
    metadata: {
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      price_cents: priceCents,
      stock,
      status: productStatus,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/rascunhos");
  revalidatePath("/admin/produtos/estoque");
  revalidatePath("/admin/produtos/relatorios");

  return {
    success: true,
    message:
      productStatus === "draft"
        ? `Produto "${updatedProduct.name}" salvo como rascunho e movido para a guia Rascunhos!`
        : `Produto "${updatedProduct.name}" atualizado com sucesso!`,
  };
}

export async function updateProductDirectAction(payload: {
  id: string;
  name: string;
  categoryId: string;
  price: string;
  salePrice?: string;
  stock: string;
  status: "published" | "draft" | "archived";
  shortDescription?: string;
  description?: string;
  featured: boolean;
  hasSizes?: boolean;
  sizes?: string[];
  hasColors?: boolean;
  colors?: string[];
}): Promise<{
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}> {
  const formData = new FormData();
  formData.append("id", payload.id);
  formData.append("name", payload.name);
  formData.append("categoryId", payload.categoryId);
  formData.append("price", payload.price);
  if (payload.salePrice) formData.append("salePrice", payload.salePrice);
  formData.append("stock", payload.stock);
  formData.append("status", payload.status);
  if (payload.shortDescription) formData.append("shortDescription", payload.shortDescription);
  if (payload.description) formData.append("description", payload.description);
  if (payload.featured) formData.append("featured", "true");
  if (payload.hasSizes) formData.append("hasSizes", "true");
  if (payload.sizes) formData.append("sizes", JSON.stringify(payload.sizes));
  if (payload.hasColors) formData.append("hasColors", "true");
  if (payload.colors) formData.append("colors", JSON.stringify(payload.colors));

  const res = await updateProductAction(null, formData);
  return {
    success: res?.success ?? false,
    message: res?.message || (res?.success ? "Produto atualizado com sucesso!" : "Erro ao atualizar produto."),
    fieldErrors: res?.fieldErrors,
  };
}

