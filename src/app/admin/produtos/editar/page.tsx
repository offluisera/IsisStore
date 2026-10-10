import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Edit3, Package } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCategories } from "@/services/catalog.service";
import { EditProductForm } from "@/components/admin/edit-product-form";

export const metadata = {
  title: "Editar Produto — Isis Store Admin",
  description: "Modifique preços, estoque, descrição, fotos e visibilidade do produto.",
};

interface AdminEditarProdutoPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminEditarProdutoPage({
  searchParams,
}: AdminEditarProdutoPageProps) {
  const resolved = await searchParams;
  const productId = typeof resolved.id === "string" ? resolved.id : undefined;

  if (!productId) {
    redirect("/admin/produtos");
  }

  const supabase = await createClient();

  const [
    { data: product, error },
    categories,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, slug, sku, category_id, price_cents, sale_price_cents, stock, status, short_description, description, featured, categories(id, name, slug)"
      )
      .eq("id", productId)
      .single(),
    getCategories(),
  ]);

  if (error || !product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/produtos"
              className="hover:text-primaria transition-colors"
            >
              Produtos
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">
              Editar
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
              Editar Produto
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-fundo dark:bg-[#251A1E] text-texto-claro dark:text-[#988087] border border-borda dark:border-[#38262C]">
              {product.sku}
            </span>
          </div>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Atualize os dados e a visibilidade de <strong>{product.name}</strong>.
          </p>
        </div>

        <Link
          href={product.status === "draft" ? "/admin/produtos/rascunhos" : "/admin/produtos"}
          className={buttonVariants({ variant: "white", size: "sm" })}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Formulário Completo de Edição */}
      <div className="bg-white dark:bg-[#1E1518] p-6 sm:p-8 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <EditProductForm
          product={product as any}
          categories={categories}
        />
      </div>
    </div>
  );
}
