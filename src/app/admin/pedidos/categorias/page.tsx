import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Layers,
  Eye,
  TrendingUp,
  Tag,
  Package,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface AdminPedidosCategoriasPageProps {
  searchParams: Promise<{ categoria?: string }>;
}

interface OrderItemWithDetails {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  subtotal_cents: number;
  unit_price_cents: number;
  orders: {
    id: string;
    order_number: string;
    status: string;
    total_cents: number;
    created_at: string;
    profiles: {
      full_name: string | null;
      email: string | null;
    } | null;
  } | null;
  products: {
    id: string;
    name: string;
    category_id: string | null;
  } | null;
}

const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  pending_payment: {
    label: "Aguardando Pagamento",
    badgeClass: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
  },
  paid: {
    label: "Pago",
    badgeClass: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
  },
  processing: {
    label: "Em Separação",
    badgeClass: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
  },
  shipped: {
    label: "Enviado",
    badgeClass: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40",
  },
  delivered: {
    label: "Entregue",
    badgeClass: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700/50",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",
  },
  refunded: {
    label: "Reembolsado",
    badgeClass: "bg-neutral-100 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700",
  },
};

export default async function AdminPedidosCategoriasPage({
  searchParams,
}: AdminPedidosCategoriasPageProps) {
  const { categoria: selectedCategorySlug } = await searchParams;
  const supabase = await createClient();

  // 1. Carrega todas as categorias cadastradas
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const categories = rawCategories || [];

  // 2. Carrega todos os itens de pedidos com relação ao pedido e produto
  const { data: rawOrderItems } = await supabase
    .from("order_items")
    .select(`
      id,
      order_id,
      product_id,
      product_name,
      quantity,
      subtotal_cents,
      unit_price_cents,
      orders (
        id,
        order_number,
        status,
        total_cents,
        created_at,
        profiles (
          full_name,
          email
        )
      ),
      products (
        id,
        name,
        category_id
      )
    `);

  const orderItems = (rawOrderItems || []) as unknown as OrderItemWithDetails[];

  // 3. Agrupa pedidos por categoria real
  type CategoryGroup = {
    id: string;
    name: string;
    slug: string;
    totalOrders: number;
    totalItems: number;
    totalRevenueCents: number;
    ordersMap: Map<
      string,
      {
        orderId: string;
        orderNumber: string;
        status: string;
        orderTotalCents: number;
        createdAt: string;
        customerName: string;
        customerEmail: string;
        categoryItems: Array<{
          id: string;
          name: string;
          quantity: number;
          subtotalCents: number;
        }>;
        categorySubtotalCents: number;
      }
    >;
  };

  const categoryGroups = new Map<string, CategoryGroup>();

  for (const cat of categories) {
    categoryGroups.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      totalOrders: 0,
      totalItems: 0,
      totalRevenueCents: 0,
      ordersMap: new Map(),
    });
  }

  // Preenche dados reais
  for (const item of orderItems) {
    const order = item.orders;
    if (!order) continue;

    const catId = item.products?.category_id;
    if (!catId || !categoryGroups.has(catId)) continue;

    const group = categoryGroups.get(catId)!;
    group.totalItems += item.quantity;
    group.totalRevenueCents += item.subtotal_cents;

    if (!group.ordersMap.has(order.id)) {
      group.ordersMap.set(order.id, {
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status,
        orderTotalCents: order.total_cents,
        createdAt: order.created_at,
        customerName: order.profiles?.full_name || "Cliente Isis Store",
        customerEmail: order.profiles?.email || "Sem e-mail",
        categoryItems: [],
        categorySubtotalCents: 0,
      });
    }

    const orderEntry = group.ordersMap.get(order.id)!;
    orderEntry.categoryItems.push({
      id: item.id,
      name: item.product_name,
      quantity: item.quantity,
      subtotalCents: item.subtotal_cents,
    });
    orderEntry.categorySubtotalCents += item.subtotal_cents;
  }

  // Atualiza total de pedidos únicos em cada categoria
  for (const group of categoryGroups.values()) {
    group.totalOrders = group.ordersMap.size;
  }

  const allGroups = Array.from(categoryGroups.values());

  // Métricas de topo reais
  const categoriesWithOrders = allGroups.filter((g) => g.totalOrders > 0);
  const topCategoryByRevenue = [...allGroups].sort(
    (a, b) => b.totalRevenueCents - a.totalRevenueCents
  )[0];

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtragem se selecionada uma categoria específica via query param
  const displayedGroups = selectedCategorySlug
    ? allGroups.filter((g) => g.slug === selectedCategorySlug)
    : allGroups;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E1518] p-6 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-texto-claro dark:text-[#988087] mb-1">
            <Link href="/admin" className="hover:text-primaria transition-colors">
              Painel
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/pedidos"
              className="hover:text-primaria transition-colors"
            >
              Pedidos
            </Link>
            <span>&gt;</span>
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Categorias</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Pedidos por Categoria
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Acompanhe o volume real de pedidos, itens vendidos e faturamento por categoria de produto.
          </p>
        </div>

        <div>
          <Link
            href="/admin/pedidos"
            className={buttonVariants({
              variant: "white",
              size: "sm",
              className: "dark:bg-[#151012] dark:border-[#38262C] dark:text-[#F8EFF1]",
            })}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Ver Todos os Pedidos</span>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primaria-soft dark:bg-primaria-soft/30 text-primaria flex items-center justify-center shrink-0 border border-primaria/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Categorias com Vendas</p>
            <p className="text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {categoriesWithOrders.length}{" "}
              <span className="text-xs font-normal text-texto-claro dark:text-[#988087]">
                de {categories.length} cadastradas
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/40">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Categoria Líder em Receita</p>
            <p className="text-lg font-bold text-texto-escuro dark:text-[#F8EFF1] truncate max-w-[200px]">
              {topCategoryByRevenue && topCategoryByRevenue.totalRevenueCents > 0
                ? topCategoryByRevenue.name
                : "Sem vendas"}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {topCategoryByRevenue && topCategoryByRevenue.totalRevenueCents > 0
                ? formatPrice(topCategoryByRevenue.totalRevenueCents)
                : "R$ 0,00"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/40">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Itens Totais Despachados</p>
            <p className="text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {allGroups.reduce((acc, g) => acc + g.totalItems, 0)}{" "}
              <span className="text-xs font-normal text-texto-claro dark:text-[#988087]">unidades</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filtros em Abas de Categorias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <Tag className="w-4 h-4 text-texto-claro dark:text-[#988087] shrink-0 ml-1 mr-1" />
        <Link
          href="/admin/pedidos/categorias"
          className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors border ${
            !selectedCategorySlug
              ? "bg-primaria text-white border-primaria shadow-2xs"
              : "bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#D4BFC5] border-borda dark:border-[#38262C] hover:border-primaria/40 dark:hover:border-primaria/60"
          }`}
        >
          Todas as Categorias ({categories.length})
        </Link>
        {categories.map((cat) => {
          const isActive = selectedCategorySlug === cat.slug;
          const grp = categoryGroups.get(cat.id);
          const orderCount = grp ? grp.totalOrders : 0;

          return (
            <Link
              key={cat.id}
              href={`/admin/pedidos/categorias?categoria=${cat.slug}`}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                isActive
                  ? "bg-primaria text-white border-primaria shadow-2xs"
                  : "bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#D4BFC5] border-borda dark:border-[#38262C] hover:border-primaria/40 dark:hover:border-primaria/60"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-fundo dark:bg-[#151012] text-texto-claro dark:text-[#988087] border border-borda dark:border-[#38262C]"
                }`}
              >
                {orderCount}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Listagem de Grupos por Categoria */}
      <div className="flex flex-col gap-6">
        {displayedGroups.map((group) => {
          const ordersList = Array.from(group.ordersMap.values());

          return (
            <div
              key={group.id}
              className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden"
            >
              {/* Header do Grupo de Categoria */}
              <div className="p-5 bg-fundo/40 dark:bg-[#251A1E]/40 border-b border-borda dark:border-[#38262C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] flex items-center justify-center text-primaria shrink-0 shadow-2xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      {group.name}
                    </h2>
                    <p className="text-xs text-texto-claro dark:text-[#988087]">
                      {group.totalOrders} {group.totalOrders === 1 ? "pedido registrado" : "pedidos registrados"} •{" "}
                      {group.totalItems} {group.totalItems === 1 ? "unidade vendida" : "unidades vendidas"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="bg-white dark:bg-[#151012] px-3 py-1.5 rounded-xl border border-borda dark:border-[#38262C]">
                    <span className="text-texto-claro dark:text-[#988087] mr-1.5">Receita da Categoria:</span>
                    <span className="font-bold text-primaria">
                      {formatPrice(group.totalRevenueCents)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabela de Pedidos da Categoria */}
              {ordersList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-fundo/20 dark:bg-[#251A1E] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#988087] uppercase font-semibold text-[11px] tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Pedido</th>
                        <th className="px-5 py-3">Cliente</th>
                        <th className="px-5 py-3">Itens desta Categoria</th>
                        <th className="px-5 py-3">Subtotal Categoria</th>
                        <th className="px-5 py-3">Status do Pedido</th>
                        <th className="px-5 py-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-texto-escuro dark:text-[#F8EFF1]">
                      {ordersList.map((ord) => {
                        const statusInfo = STATUS_MAP[ord.status] || {
                          label: ord.status,
                          badgeClass:
                            "bg-neutral-100 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700",
                        };

                        return (
                          <tr
                            key={ord.orderId}
                            className="hover:bg-fundo/30 dark:hover:bg-[#251A1E]/40 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primaria-soft dark:bg-primaria-soft/30 text-primaria flex items-center justify-center shrink-0 border border-primaria/20">
                                  <ShoppingBag className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                                    #{ord.orderNumber}
                                  </p>
                                  <p className="text-[11px] text-texto-claro dark:text-[#988087] font-mono">
                                    {formatDate(ord.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                                {ord.customerName}
                              </p>
                              <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                                {ord.customerEmail}
                              </p>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-1 max-w-xs">
                                {ord.categoryItems.map((item) => (
                                  <span
                                    key={item.id}
                                    className="text-xs text-texto-escuro dark:text-[#F8EFF1] font-medium"
                                  >
                                    • {item.name}{" "}
                                    <span className="text-texto-claro dark:text-[#988087] font-normal">
                                      ({item.quantity}x)
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="px-5 py-3.5 font-bold text-primaria">
                              {formatPrice(ord.categorySubtotalCents)}
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}
                              >
                                {statusInfo.label}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <Link
                                href={`/admin/pedidos/${ord.orderId}`}
                                className={buttonVariants({
                                  variant: "outline",
                                  size: "sm",
                                  className: "text-[11px] h-8 px-3 gap-1 dark:bg-[#151012] dark:border-[#38262C] dark:text-[#F8EFF1] hover:dark:bg-[#251A1E]",
                                })}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Detalhes</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-texto-claro dark:text-[#988087] text-xs">
                  Nenhum pedido contendo produtos desta categoria registrado até o momento.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
