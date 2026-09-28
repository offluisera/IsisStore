import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriasPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order", { ascending: true });

  // Buscar contagem de produtos por categoria
  const { data: products } = await supabase
    .from("products")
    .select("category_id");

  const productCountMap = new Map<string, number>();
  products?.forEach((p) => {
    if (p.category_id) {
      productCountMap.set(
        p.category_id,
        (productCountMap.get(p.category_id) || 0) + 1
      );
    }
  });

  const categoriesWithCount = (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    productCount: productCountMap.get(cat.id) || 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro font-medium">Categorias</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
            Gerenciamento de Categorias
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Organize a hierarquia e departamentos do catálogo da Isis Store.
          </p>
        </div>

        <div>
          <Link
            href="/admin"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>
      </div>

      <CategoryManager initialCategories={categoriesWithCount} />
    </div>
  );
}
