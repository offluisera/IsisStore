"use server";

import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/schemas/product";
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

export async function createProductAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const rawData = {
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    salePrice: (formData.get("salePrice") as string) || undefined,
    stock: formData.get("stock"),
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    shortDescription: (formData.get("shortDescription") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    featured:
      formData.get("featured") === "on" || formData.get("featured") === "true",
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
      status: "published",
      featured: validation.data.featured,
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

  if (validation.data.imageUrl) {
    await supabase.from("product_images").insert({
      product_id: newProduct.id,
      public_url: validation.data.imageUrl,
      storage_path: validation.data.imageUrl,
      alt_text: validation.data.name,
      is_primary: true,
      sort_order: 1,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/produtos");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos?created=1");
}
