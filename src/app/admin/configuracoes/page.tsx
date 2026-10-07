import { Suspense } from "react";
import { getStoreSettings } from "@/lib/settings/store-settings";
import { StoreSettingsView } from "@/components/admin/store-settings-view";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_HOME_SLIDES, HomeSlide } from "@/lib/slides/types";

export const metadata = {
  title: "Configurações Gerais da Loja — Isis Store Admin",
  description:
    "Gerencie a identidade visual, slides da home, favicon, metadados SEO, tags de busca, contato e operação da loja.",
};

export default async function AdminConfiguracoesPage() {
  const settings = await getStoreSettings();

  let slides: HomeSlide[] = DEFAULT_HOME_SLIDES;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("home_slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      slides = data as HomeSlide[];
    }
  } catch (err) {
    console.error("Erro ao carregar slides em AdminConfiguracoesPage:", err);
  }

  return (
    <Suspense fallback={null}>
      <StoreSettingsView settings={settings} initialSlides={slides} />
    </Suspense>
  );
}

