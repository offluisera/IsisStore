import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Layers,
  Plus,
  ArrowLeft,
  Eye,
  TrendingUp,
  Package,
  ShoppingBag,
  Edit3,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  CategoriesListView,
  CategoryWithStats,
} from "@/components/admin/categories-list-view";

export const metadata = {
  title: "Categorias da Loja — Isis Store Admin",
  description: "Gerenciamento de departamentos, contagem real de produtos vinculados, vendas e acessos registrados.",
};

export default async function AdminCategoriasPage() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: products },
    { data: orderItems },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, description, sort_order, is_active, access_count")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, category_id, name, price_cents, stock"),
    supabase
      .from("order_items")
      .select("product_id, quantity, subtotal_cents"),
  ]);

  // Contagem real de produtos por categoria
  const productCountMap = new Map<string, number>();
  const productToCategoryMap = new Map<string, string>();

  products?.forEach((p) => {
    if (p.category_id) {
      productToCategoryMap.set(p.id, p.category_id);
      productCountMap.set(
        p.category_id,
        (productCountMap.get(p.category_id) || 0) + 1
      );
    }
  });

  // Vendas reais faturadas por categoria
  const categorySalesMap = new Map<string, { units: number; revenue: number }>();
  orderItems?.forEach((item) => {
    if (!item.product_id) return;
    const catId = productToCategoryMap.get(item.product_id);
    if (!catId) return;
    const cur = categorySalesMap.get(catId) || { units: 0, revenue: 0 };
    cur.units += item.quantity || 0;
    cur.revenue += item.subtotal_cents || 0;
    categorySalesMap.set(catId, cur);
  });

  // Total real de acessos registrados no banco
  const catList = categories || [];
  const totalRecordedAccesses = catList.reduce(
    (acc, c) => acc + (c.access_count || 0),
    0
  );

  // Mapear dados 100% reais sem fórmulas artificiais
  const categoriesWithStats: CategoryWithStats[] = catList
    .map((cat) => {
      const prodCount = productCountMap.get(cat.id) || 0;
      const sales = categorySalesMap.get(cat.id) || { units: 0, revenue: 0 };
      const realAccesses = cat.access_count || 0;

      const share =
        totalRecordedAccesses > 0
          ? Math.round((realAccesses / totalRecordedAccesses) * 100)
          : 0;

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        productCount: prodCount,
        salesCount: sales.units,
        revenueCents: sales.revenue,
        accessCount: realAccesses,
        accessShare: share,
        is_active: cat.is_active ?? true,
        sort_order: cat.sort_order ?? 0,
      };
    })
    .sort((a, b) => {
      // Ordena por acessos reais, depois por produtos cadastrados
      return b.accessCount - a.accessCount || b.productCount - a.productCount;
    });

  // Identificar categoria com mais acessos ou mais produtos reais
  const topCategoryByAccess =
    totalRecordedAccesses > 0 ? categoriesWithStats[0] : null;
  const topCategoryByProducts =
    [...categoriesWithStats].sort((a, b) => b.productCount - a.productCount)[0] ||
    null;

  const totalProducts = products?.length || 0;
  const activeCount = categoriesWithStats.filter((c) => c.is_active).length;

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
            <span className="text-texto-escuro font-medium">Categorias</span>
          </div>

          <h1 className="font-serif text-2xl font-semibold text-texto-escuro flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-primaria" />
            <span>Categorias da Loja</span>
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Gerencie departamentos, produtos vinculados e acompanhe acessos reais contabilizados na vitrine.
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
            href="/admin/categorias/editar"
            className={buttonVariants({ variant: "white", size: "sm" })}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1 text-primaria" />
            <span>Editar Categoria</span>
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

      {/* Grid de KPIs Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Categorias */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro uppercase tracking-wider">
              Total de Categorias
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro mt-0.5">
              {categoriesWithStats.length}
            </p>
            <p className="text-[11px] text-texto-claro">
              {activeCount} ativas no catálogo
            </p>
          </div>
        </div>

        {/* Categoria em Destaque */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              {topCategoryByAccess ? "Mais Acessada" : "Maior Catálogo"}
            </p>
            {topCategoryByAccess ? (
              <>
                <p className="font-semibold text-sm text-texto-escuro truncate mt-0.5" title={topCategoryByAccess.name}>
                  {topCategoryByAccess.name}
                </p>
                <p className="text-[11px] text-texto-claro font-mono">
                  {topCategoryByAccess.accessCount} acessos reais ({topCategoryByAccess.accessShare}%)
                </p>
              </>
            ) : topCategoryByProducts && topCategoryByProducts.productCount > 0 ? (
              <>
                <p className="font-semibold text-sm text-texto-escuro truncate mt-0.5" title={topCategoryByProducts.name}>
                  {topCategoryByProducts.name}
                </p>
                <p className="text-[11px] text-texto-claro font-mono">
                  {topCategoryByProducts.productCount} produto(s) vinculados
                </p>
              </>
            ) : (
              <p className="text-xs text-texto-claro mt-1">Aguardando produtos e visitas</p>
            )}
          </div>
        </div>

        {/* Produtos Vinculados */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro uppercase tracking-wider">
              Produtos no Catálogo
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro mt-0.5">
              {totalProducts}
            </p>
            <p className="text-[11px] text-texto-claro">
              Total de itens vinculados
            </p>
          </div>
        </div>

        {/* Acessos Registrados Reais */}
        <div className="bg-white p-5 rounded-2xl border border-borda shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-texto-claro uppercase tracking-wider">
              Acessos Registrados
            </p>
            <p className="font-mono text-2xl font-bold text-texto-escuro mt-0.5">
              {totalRecordedAccesses}
            </p>
            <p className="text-[11px] text-texto-claro">
              {totalRecordedAccesses === 0
                ? "Contabilizados via vitrine pública"
                : "Total de visitas reais registradas"}
            </p>
          </div>
        </div>
      </div>

      {/* Lista e Tabela de Categorias com Dados Reais */}
      <CategoriesListView
        initialCategories={categoriesWithStats}
        totalRecordedAccesses={totalRecordedAccesses}
      />
    </div>
  );
}
