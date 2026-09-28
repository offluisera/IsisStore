import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Eye, Filter } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface AdminPedidosPageProps {
  searchParams: Promise<{ status?: string }>;
}

interface OrderListItem {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
  order_items?: Array<{ id: string }> | null;
}

const VALID_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

type ValidOrderStatus = (typeof VALID_STATUSES)[number];

const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  pending_payment: {
    label: "Aguardando Pagamento",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  paid: {
    label: "Pago",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  processing: {
    label: "Em Separação",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  shipped: {
    label: "Enviado",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  delivered: {
    label: "Entregue",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
  },
  refunded: {
    label: "Reembolsado",
    badgeClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
  },
};

export default async function AdminPedidosPage({
  searchParams,
}: AdminPedidosPageProps) {
  const { status: currentStatus } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_cents,
      created_at,
      profiles (
        full_name,
        email
      ),
      order_items (
        id
      )
    `)
    .order("created_at", { ascending: false });

  if (currentStatus && VALID_STATUSES.includes(currentStatus as ValidOrderStatus)) {
    query = query.eq("status", currentStatus as ValidOrderStatus);
  }

  const { data: orders } = await query;

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

  const FILTER_TABS = [
    { label: "Todos", value: "all" },
    { label: "Aguardando Pagamento", value: "pending_payment" },
    { label: "Pagos", value: "paid" },
    { label: "Em Separação", value: "processing" },
    { label: "Enviados", value: "shipped" },
    { label: "Entregues", value: "delivered" },
    { label: "Cancelados", value: "cancelled" },
  ];

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
            <span className="text-texto-escuro font-medium">Pedidos</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro">
            Gerenciamento de Pedidos
          </h1>
          <p className="text-xs text-texto-claro mt-0.5">
            Visualize vendas, despache mercadorias e gerencie o fluxo de entrega.
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

      {/* Filtros de Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <Filter className="w-4 h-4 text-texto-claro shrink-0 ml-1 mr-1" />
        {FILTER_TABS.map((tab) => {
          const isActive =
            (!currentStatus && tab.value === "all") ||
            currentStatus === tab.value;

          return (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/admin/pedidos"
                  : `/admin/pedidos?status=${tab.value}`
              }
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors border ${
                isActive
                  ? "bg-primaria text-white border-primaria shadow-2xs"
                  : "bg-white text-texto-medio border-borda hover:border-primaria/40"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 border-b border-borda text-texto-claro uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Pedido</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Itens</th>
                <th className="px-5 py-3.5">Valor Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 text-texto-escuro">
              {orders && orders.length > 0 ? (
                (orders as unknown as OrderListItem[]).map((ord) => {
                  const statusInfo = STATUS_MAP[ord.status] || {
                    label: ord.status,
                    badgeClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
                  };

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-fundo/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria/20">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-texto-escuro">
                              #{ord.order_number}
                            </p>
                            <p className="text-[11px] text-texto-claro font-mono">
                              {formatDate(ord.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-texto-escuro">
                          {ord.profiles?.full_name || "Cliente Isis Store"}
                        </p>
                        <p className="text-[11px] text-texto-claro">
                          {ord.profiles?.email || "Sem e-mail"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-texto-medio">
                        {ord.order_items?.length ?? 0} {ord.order_items?.length === 1 ? "item" : "itens"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-primaria">
                        {formatPrice(ord.total_cents)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/pedidos/${ord.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "text-[11px] h-8 px-3 gap-1",
                          })}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-texto-claro">
                    Nenhum pedido encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
