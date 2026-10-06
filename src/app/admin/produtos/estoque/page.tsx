import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Boxes,
  Plus,
  ArrowLeft,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  StockManagementTable,
  StockProductItem,
} from "@/components/admin/stock-management-table";

export const metadata = {
  title: "Gestão de Estoque — Isis Store Admin",
  description: "Controle em tempo real de inventário, reposição e alertas de produtos.",
};

export default async function AdminEstoquePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      sku,
      price_cents,
      stock,
      status,
      categories (name),
      product_images (public_url, is_primary)
    `)
    .order("stock", { ascending: true });

  const formattedProducts: StockProductItem[] =
    products?.map((item) => {
      const primaryImg =
        item.product_images?.find((img) => img.is_primary) ||
        item.product_images?.[0];

      const categoryName = Array.isArray(item.categories)
        ? item.categories[0]?.name || "Sem categoria"
        : (item.categories as { name: string } | null)?.name || "Sem categoria";

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        price_cents: item.price_cents,
        stock: item.stock,
        status: item.status,
        categoryName,
        imageUrl: primaryImg?.public_url || null,
      };
    }) || [];

  // Cálculos de inventário
  const totalPhysicalUnits = formattedProducts.reduce(
    (acc, p) => acc + (p.stock || 0),
    0
  );

  const totalInventoryValueCents = formattedProducts.reduce(
    (acc, p) => acc + (p.stock || 0) * (p.price_cents || 0),
    0
  );

  const outOfStockCount = formattedProducts.filter((p) => p.stock === 0).length;
  const lowStockCount = formattedProducts.filter(
    (p) => p.stock > 0 && p.stock <= 5
  ).length;
  const healthyStockCount = formattedProducts.filter((p) => p.stock > 5).length;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header com Breadcrumb e Ações */}
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
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Estoque</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-primaria" />
            <span>Controle &amp; Gestão de Estoque</span>
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Monitore a disponibilidade física, valores de inventário e ajuste quantidades em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/produtos"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Voltar</span>
          </Link>
          <Link
            href="/admin/produtos/relatorios"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-primaria" />
            <span>Relatórios</span>
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

      {/* Grid de KPIs de Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Itens */}
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro dark:text-[#988087] uppercase tracking-wider">
              Unidades em Estoque
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] mt-0.5">
              {totalPhysicalUnits.toLocaleString("pt-BR")}
            </p>
            <p className="text-[11px] text-texto-claro dark:text-[#988087]">
              Total em {formattedProducts.length} itens do catálogo
            </p>
          </div>
        </div>

        {/* Valor do Inventário */}
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro dark:text-[#988087] uppercase tracking-wider">
              Patrimônio em Inventário
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro dark:text-[#F8EFF1] mt-0.5">
              {formatPrice(totalInventoryValueCents)}
            </p>
            <p className="text-[11px] text-texto-claro dark:text-[#988087]">
              Preço de tabela acumulado
            </p>
          </div>
        </div>

        {/* Estoque Crítico */}
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Estoque Crítico (≤ 5)
            </p>
            <p className="font-mono text-2xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {lowStockCount}
            </p>
            <p className="text-[11px] text-texto-claro dark:text-[#988087]">
              Produtos precisando de reposição
            </p>
          </div>
        </div>

        {/* Produtos Esgotados */}
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Esgotados (0 un.)
            </p>
            <p className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {outOfStockCount}
            </p>
            <p className="text-[11px] text-texto-claro dark:text-[#988087]">
              Indisponíveis para compra no site
            </p>
          </div>
        </div>
      </div>

      {/* Tabela Interativa de Gestão */}
      <StockManagementTable initialProducts={formattedProducts} />
    </div>
  );
}
