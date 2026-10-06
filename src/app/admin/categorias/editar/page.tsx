import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Edit3, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  EditCategoryView,
  EditableCategory,
} from "@/components/admin/edit-category-view";

export const metadata = {
  title: "Editar Categoria — Isis Store Admin",
  description: "Modifique departamentos, nomes, URLs amigáveis e descrições do catálogo.",
};

interface AdminEditarCategoriaPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminEditarCategoriaPage({
  searchParams,
}: AdminEditarCategoriaPageProps) {
  const supabase = await createClient();
  const resolved = await searchParams;
  const initialSelectedId = typeof resolved.id === "string" ? resolved.id : undefined;

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, description, sort_order, is_active")
      .order("sort_order", { ascending: true }),
    supabase.from("products").select("category_id"),
  ]);

  const productCountMap = new Map<string, number>();
  products?.forEach((p) => {
    if (p.category_id) {
      productCountMap.set(
        p.category_id,
        (productCountMap.get(p.category_id) || 0) + 1
      );
    }
  });

  const editableCategories: EditableCategory[] = (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    productCount: productCountMap.get(cat.id) || 0,
    is_active: cat.is_active ?? true,
    sort_order: cat.sort_order ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/categorias"
              className="hover:text-primaria transition-colors"
            >
              Categorias
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Editar</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2.5">
            <Edit3 className="w-6 h-6 text-primaria" />
            <span>Editar Categoria</span>
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Altere nomes, slugs, visibilidade e departamentos do catálogo da Isis Store.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/categorias"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar</span>
          </Link>
          <Link
            href="/admin/categorias/novo"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "flex items-center gap-1.5",
            })}
          >
            <Plus className="w-4 h-4" />
            <span>Criar Categoria</span>
          </Link>
        </div>
      </div>

      {/* View de Edição com Seletor e Formulário */}
      <EditCategoryView
        categories={editableCategories}
        initialSelectedId={initialSelectedId}
      />
    </div>
  );
}
