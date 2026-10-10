import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FileText,
  Plus,
  CheckCircle2,
  ArrowLeft,
  EyeOff,
  Package,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProductsManagementTable } from "@/components/admin/products-management-table";
import { getCategories } from "@/services/catalog.service";

interface AdminRascunhosProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Produtos em Rascunho — Isis Store Admin",
  description: "Itens não publicados e invisíveis na loja pública. Edição, fotos e publicação rápida.",
};

export default async function AdminRascunhosPage({
  searchParams,
}: AdminRascunhosProps) {
  const supabase = await createClient();
  const resolved = await searchParams;
  const isCreated = resolved.created === "1";

  // Busca de produtos em rascunho, contagem de publicados e categorias
  const [
    { data: draftProducts },
    { count: publishedCount },
    categories,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, slug, sku, category_id, price_cents, sale_price_cents, stock, status, short_description, description, featured, created_at, categories(id, name, slug), product_images(id, public_url, is_primary, sort_order, storage_path)"
      )
      .eq("status", "draft")
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    getCategories(),
  ]);

  const totalDrafts = draftProducts?.length ?? 0;
  const totalPublished = publishedCount ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback de sucesso */}
      {isCreated && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Produto salvo como rascunho com sucesso! Ele está seguro aqui e NÃO está visível para os clientes na loja pública.
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
            <Link
              href="/admin/produtos"
              className="hover:text-primaria transition-colors"
            >
              Produtos
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">
              Rascunhos
            </span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2.5">
            <span>Produtos em Rascunho</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
              {totalDrafts}
            </span>
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Itens privados e em preparação. Não aparecem na busca nem na vitrine da loja.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/produtos"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Ver Publicados</span>
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

      {/* Banner de Isolamento da Loja Pública */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3.5 text-amber-900 dark:text-amber-200 text-xs">
        <EyeOff className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="leading-relaxed">
          <span className="font-bold block text-sm">
            Privacidade Garantida — Não Visível na Loja
          </span>
          <p className="mt-0.5 text-amber-800 dark:text-amber-300">
            Itens em rascunho são protegidos por RLS (Row Level Security) e filtros restritos do catálogo. Nenhum cliente consegue visualizar o produto, adicioná-lo ao carrinho ou comprá-lo. Você pode editar todos os detalhes e, quando estiver tudo pronto, clicar em <strong>Publicar</strong> para colocá-lo no ar imediatamente.
          </p>
        </div>
      </div>

      {/* Tabela de Rascunhos com Guia e Edição Integrada (Contenção overflow-x-auto interna) */}
      <div className="w-full">
        <ProductsManagementTable
          products={(draftProducts as unknown as any) || []}
          categories={categories}
          isDraftView={true}
          publishedCount={totalPublished}
          draftCount={totalDrafts}
        />
      </div>
    </div>
  );
}
