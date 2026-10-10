import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface GetProductsParams {
  categorySlug?: string;
  search?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  price_cents: number;
  sale_price_cents: number | null;
  stock: number;
  status: "draft" | "published" | "archived";
  featured: boolean;
  weight_grams?: number | null;
  has_sizes?: boolean;
  sizes?: string[];
  has_colors?: boolean;
  colors?: string[];
  created_at: string;
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
  product_images: {
    id: string;
    public_url: string;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
  }[];
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
}

export const getCategories = cache(async (): Promise<CatalogCategory[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Erro ao carregar categorias:", error);
    return [];
  }

  return data as CatalogCategory[];
});

export const getCategoryBySlug = cache(async (
  slug: string
): Promise<CatalogCategory | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data as CatalogCategory;
});

export async function getProducts(params: GetProductsParams = {}) {
  const {
    categorySlug,
    search,
    minPriceCents,
    maxPriceCents,
    sort = "newest",
    featured,
    page = 1,
    limit = 12,
  } = params;

  const supabase = await createClient();

  let categoryId: string | null = null;
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      categoryId = category.id;
    }
  }

  let query = supabase
    .from("products")
    .select(
      "*, categories(id, name, slug), product_images(id, public_url, alt_text, is_primary, sort_order)",
      { count: "exact" }
    )
    .eq("status", "published");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  if (minPriceCents !== undefined) {
    query = query.gte("price_cents", minPriceCents);
  }

  if (maxPriceCents !== undefined) {
    query = query.lte("price_cents", maxPriceCents);
  }

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_cents", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    return {
      products: [],
      total: 0,
      page,
      totalPages: 0,
    };
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: (data as unknown) as CatalogProduct[],
    total,
    page,
    totalPages,
  };
}

export const getProductBySlug = cache(async (
  slug: string
): Promise<CatalogProduct | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, categories(id, name, slug), product_images(id, public_url, alt_text, is_primary, sort_order)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return (data as unknown) as CatalogProduct;
});

export const getRelatedProducts = cache(async (
  categoryId: string | null,
  excludeId: string,
  limit = 4
): Promise<CatalogProduct[]> => {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "*, categories(id, name, slug), product_images(id, public_url, alt_text, is_primary, sort_order)"
    )
    .eq("status", "published")
    .neq("id", excludeId)
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  return (data as unknown) as CatalogProduct[];
});
