import Link from "next/link";
import { ShoppingBag, Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecentOrderItem {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  created_at: string;
  status: string;
  total_cents: number;
}

interface RecentOrdersTableProps {
  orders: RecentOrderItem[];
}

const STATUS_MAP: Record<
  string,
  { label: string; badgeClass: string }
> = {
  paid: {
    label: "Pago",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50",
  },
  shipped: {
    label: "Enviado",
    badgeClass: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/50",
  },
  delivered: {
    label: "Entregue",
    badgeClass: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/50",
  },
  processing: {
    label: "Processando",
    badgeClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50",
  },
  pending_payment: {
    label: "Pendente",
    badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50",
  },
  cancelled: {
    label: "Cancelado",
    badgeClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50",
  },
  refunded: {
    label: "Reembolsado",
    badgeClass: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50",
  },
};

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const formatBrl = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDateTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return (
        date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        " " +
        date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return iso;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "CL";
    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-[#1E1518] border border-[#F0E5E7] dark:border-[#332228] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full select-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
              Pedidos Recentes
            </h2>
            <p className="text-xs text-texto-claro dark:text-[#A89299]">
              Últimas transações registradas no fluxo comercial
            </p>
          </div>
        </div>

        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primaria hover:text-primaria-hover transition-colors group"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Tabela Responsiva com Scroll Suave */}
      <div className="overflow-x-auto w-full pt-3">
        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-texto-claro dark:text-[#A89299] space-y-1">
            <ShoppingBag className="w-8 h-8 text-primaria/30 mx-auto" />
            <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
              Nenhum pedido recente registrado
            </p>
            <p className="text-[11px]">
              Novos pedidos realizados aparecerão instantaneamente nesta lista.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#F7EFF1] dark:border-[#2C1D23] text-[11px] font-semibold text-texto-claro dark:text-[#A89299] uppercase tracking-wider">
                <th className="pb-3 pl-1 font-semibold">ID do Pedido</th>
                <th className="pb-3 px-3 font-semibold">Cliente</th>
                <th className="pb-3 px-3 font-semibold">Data</th>
                <th className="pb-3 px-3 font-semibold">Status</th>
                <th className="pb-3 px-3 font-semibold text-right">Valor</th>
                <th className="pb-3 pr-1 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7EFF1] dark:divide-[#2C1D23]">
              {orders.map((ord) => {
                const statusMeta = STATUS_MAP[ord.status] || {
                  label: ord.status,
                  badgeClass: "bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
                };

                return (
                  <tr
                    key={ord.id}
                    className="hover:bg-[#FFF5F6]/40 dark:hover:bg-[#251A1E] transition-colors group"
                  >
                    {/* ID do Pedido */}
                    <td className="py-3 pl-1">
                      <Link
                        href={`/admin/pedidos/${ord.id}`}
                        className="font-mono text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] group-hover:text-primaria transition-colors"
                      >
                        #{ord.order_number}
                      </Link>
                    </td>

                    {/* Cliente com Avatar Circular */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primaria/25 to-secundaria/35 text-primaria font-serif font-bold text-[10px] flex items-center justify-center flex-shrink-0 border border-primaria/20 shadow-2xs">
                          {getInitials(ord.customer_name)}
                        </div>
                        <span className="font-medium text-texto-escuro dark:text-[#F8EFF1] truncate max-w-[130px]">
                          {ord.customer_name || "Cliente"}
                        </span>
                      </div>
                    </td>

                    {/* Data e Hora */}
                    <td className="py-3 px-3 text-texto-claro dark:text-[#A89299] text-[11px] font-mono">
                      {formatDateTime(ord.created_at)}
                    </td>

                    {/* Status com Pill Colorido */}
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide",
                          statusMeta.badgeClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Valor em BRL */}
                    <td className="py-3 px-3 text-right font-bold text-texto-escuro dark:text-[#F8EFF1] font-mono text-xs">
                      {formatBrl(ord.total_cents)}
                    </td>

                    {/* Ação Rápida */}
                    <td className="py-3 pr-1 text-center">
                      <Link
                        href={`/admin/pedidos/${ord.id}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-texto-claro dark:text-[#A89299] hover:text-primaria hover:bg-primaria/10 transition-colors"
                        title="Visualizar pedido"
                        aria-label={`Visualizar pedido #${ord.order_number}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
