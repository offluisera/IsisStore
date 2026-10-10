import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Package,
  Plus,
  CheckCircle2,
  ArrowLeft,
  TrendingUp,
  Boxes,
  FileText,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProductsManagementTable } from "@/components/admin/products-management-table";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { getCategories } from "@/services/catalog.service";

interface AdminProdutosProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Produtos do Catálogo — Isis Store Admin",
  description: "Gerenciamento de produtos publicados, estoque, fotos e edição completa.",
};

export default async function AdminProdutosPage({
  searchParams,
}: AdminProdutosProps) {
  const supabase = await createClient();
  const resolved = await searchParams;
  const isCreated = resolved.created === "1";

  // Busca paralela: produtos publicados, contagem de rascunhos e categorias
  const [
    { data: publishedProducts },
    { count: draftCount },
    categories,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, slug, sku, category_id, price_cents, sale_price_cents, stock, status, short_description, description, featured, created_at, categories(id, name, slug), product_images(id, public_url, is_primary, sort_order, storage_path)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
    getCategories(),
  ]);

  const totalPublished = publishedProducts?.length ?? 0;
  const totalDrafts = draftCount ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback de sucesso */}
      {isCreated && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-sucesso/10 border border-sucesso/20 flex items-center gap-3 text-sucesso text-xs font-semibold animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>
            Produto cadastrado com sucesso! Ele já está disponível no catálogo e na vitrine da loja.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Produtos</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Gerenciamento de Produtos
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Total de {totalPublished} produto{totalPublished === 1 ? "" : "s"} publicado{totalPublished === 1 ? "" : "s"} no catálogo da loja.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar</span>
          </Link>
          <Link
            href="/admin/produtos/rascunhos"
            className={buttonVariants({
              variant: "white",
              size: "sm",
              className: "relative",
            })}
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
            <span>Rascunhos</span>
            {totalDrafts > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {totalDrafts}
              </span>
            )}
          </Link>
          <Link
            href="/admin/produtos/relatorios"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-primaria" />
            <span>Relatórios</span>
          </Link>
          <Link
            href="/admin/produtos/estoque"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <Boxes className="w-3.5 h-3.5 mr-1 text-primaria" />
            <span>Estoque</span>
          </Link>
          <Link
            href="/admin/produtos/novo"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "flex items-center gap-1.5",
            })}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Produtos com Guia e Edição Integrada (Contenção overflow-x-auto interna) */}
      <div className="w-full">
        <ProductsManagementTable
          products={(publishedProducts as unknown as any) || []}
          categories={categories}
          isDraftView={false}
          publishedCount={totalPublished}
          draftCount={totalDrafts}
        />
      </div>
    </div>
  );
}
