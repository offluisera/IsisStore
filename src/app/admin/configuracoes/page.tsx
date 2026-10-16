import { Suspense } from "react";
import { getStoreSettings } from "@/lib/settings/store-settings";
import { StoreSettingsView } from "@/components/admin/store-settings-view";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_HOME_SLIDES, HomeSlide } from "@/lib/slides/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configurações Gerais da Loja — Isis Store Admin",
  description:
    "Gerencie a identidade visual, slides da home, favicon, metadados SEO, tags de busca, contato e operação da loja.",
};

export default async function AdminConfiguracoesPage() {
  const settings = await getStoreSettings();

  let slides: HomeSlide[] = DEFAULT_HOME_SLIDES;
  let products: any[] = [];
  try {
    const supabase = await createClient();
    const [slidesRes, productsRes] = await Promise.all([
      supabase
        .from("home_slides")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select(
          "id, name, slug, sku, category_id, price_cents, sale_price_cents, stock, status, categories(id, name, slug), product_images(id, public_url, is_primary)"
        )
        .eq("status", "published")
        .order("name", { ascending: true }),
    ]);

    if (slidesRes.data && slidesRes.data.length > 0) {
      slides = slidesRes.data as HomeSlide[];
    }
    if (productsRes.data && productsRes.data.length > 0) {
      products = productsRes.data;
    }
  } catch (err) {
    console.error("Erro ao carregar slides e produtos em AdminConfiguracoesPage:", err);
  }

  return (
    <Suspense fallback={null}>
      <StoreSettingsView
        settings={settings}
        initialSlides={slides}
        initialProducts={products}
      />
    </Suspense>
  );
}

