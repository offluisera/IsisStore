import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  Award,
  ArrowLeft,
  Boxes,
  Plus,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  ProductsReportView,
  ProductReportItem,
} from "@/components/admin/products-report-view";

export const metadata = {
  title: "Relatórios de Produtos & Vendas — Isis Store Admin",
  description: "Análise de produtos mais vendidos, volume de saída, receita e participação no catálogo.",
};

export default async function AdminProdutosRelatoriosPage() {
  const supabase = await createClient();

  // Buscar produtos e itens de pedidos em paralelo
  const [{ data: products }, { data: orderItems }] = await Promise.all([
    supabase
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
      `),
    supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        product_name,
        sku,
        quantity,
        unit_price_cents,
        subtotal_cents,
        orders (
          status
        )
      `),
  ]);

  // Filtrar apenas pedidos válidos (excluir cancelados e estornados)
  const validItems =
    orderItems?.filter((item) => {
      const ord = item.orders as { status?: string } | null;
      return !ord?.status || !["cancelled", "refunded"].includes(ord.status);
    }) || [];

  // Mapear vendas acumuladas por product_id e por SKU/nome como fallback
  const salesByProductId = new Map<
    string,
    { units: number; revenueCents: number; count: number }
  >();

  for (const item of validItems) {
    const key = item.product_id || item.sku || item.product_name;
    const current = salesByProductId.get(key) || {
      units: 0,
      revenueCents: 0,
      count: 0,
    };
    current.units += item.quantity || 0;
    current.revenueCents += item.subtotal_cents || 0;
    current.count += 1;
    salesByProductId.set(key, current);
  }

  // Totais gerais
  let totalRevenueCents = 0;
  let totalUnitsSold = 0;

  for (const stats of salesByProductId.values()) {
    totalRevenueCents += stats.revenueCents;
    totalUnitsSold += stats.units;
  }

  // Montar lista de relatórios
  const reportProducts: ProductReportItem[] =
    products?.map((prod) => {
      const primaryImg =
        prod.product_images?.find((img) => img.is_primary) ||
        prod.product_images?.[0];

      const categoryName = Array.isArray(prod.categories)
        ? prod.categories[0]?.name || "Sem categoria"
        : (prod.categories as { name: string } | null)?.name || "Sem categoria";

      const stats =
        salesByProductId.get(prod.id) ||
        salesByProductId.get(prod.sku) ||
        salesByProductId.get(prod.name) || {
          units: 0,
          revenueCents: 0,
          count: 0,
        };

      const percentageUnits =
        totalUnitsSold > 0
          ? Math.round((stats.units / totalUnitsSold) * 100)
          : 0;

      const percentageRevenue =
        totalRevenueCents > 0
          ? Math.round((stats.revenueCents / totalRevenueCents) * 100)
          : 0;

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        categoryName,
        price_cents: prod.price_cents,
        stock: prod.stock,
        imageUrl: primaryImg?.public_url || null,
        unitsSold: stats.units,
        revenueCents: stats.revenueCents,
        ordersCount: stats.count,
        percentageUnits,
        percentageRevenue,
      };
    }) || [];

  // Ordenar para identificar o Top 1
  const sortedBySales = [...reportProducts].sort(
    (a, b) => b.unitsSold - a.unitsSold || b.revenueCents - a.revenueCents
  );
  const topProduct = sortedBySales[0]?.unitsSold > 0 ? sortedBySales[0] : null;

  const averageItemTicketCents =
    totalUnitsSold > 0 ? Math.round(totalRevenueCents / totalUnitsSold) : 0;

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header com Breadcrumb e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-borda shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro mb-1">
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
            <span className="text-texto-escuro font-medium">Relatórios</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-primaria" />
            <span>Relatórios de Desempenho &amp; Mais Vendidos</span>
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Acompanhe o volume de vendas, faturamento por produto e descubra os destaques de saída da loja.
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

      {/* Grid de KPIs de Desempenho */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento em Produtos */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro uppercase tracking-wider">
              Receita em Produtos
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro mt-0.5">
              {formatPrice(totalRevenueCents)}
            </p>
            <p className="text-[11px] text-texto-claro">
              Total faturado em itens de pedidos
            </p>
          </div>
        </div>

        {/* Peças Vendidas */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro uppercase tracking-wider">
              Peças Vendidas
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro mt-0.5">
              {totalUnitsSold.toLocaleString("pt-BR")} <span className="text-sm font-normal text-texto-claro">un.</span>
            </p>
            <p className="text-[11px] text-texto-claro">
              Volume total de produtos entregues
            </p>
          </div>
        </div>

        {/* Ticket Médio por Item */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro uppercase tracking-wider">
              Preço Médio por Item
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro mt-0.5">
              {formatPrice(averageItemTicketCents)}
            </p>
            <p className="text-[11px] text-texto-claro">
              Média de valor por unidade vendida
            </p>
          </div>
        </div>

        {/* Produto Campeão */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <span>Top 1 em Vendas</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </p>
            {topProduct ? (
              <>
                <p className="font-semibold text-sm text-texto-escuro truncate mt-0.5" title={topProduct.name}>
                  {topProduct.name}
                </p>
                <p className="text-[11px] text-texto-claro font-mono">
                  {topProduct.unitsSold} un. vendidas ({formatPrice(topProduct.revenueCents)})
                </p>
              </>
            ) : (
              <p className="text-xs text-texto-claro mt-1">Aguardando primeiras vendas</p>
            )}
          </div>
        </div>
      </div>

      {/* Visualização Completa e Tabela do Relatório */}
      <ProductsReportView
        products={reportProducts}
        totalRevenueCents={totalRevenueCents}
        totalUnitsSold={totalUnitsSold}
      />
    </div>
  );
}
