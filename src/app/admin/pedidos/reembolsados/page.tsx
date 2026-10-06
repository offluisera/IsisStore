import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  RotateCcw,
  ArrowLeft,
  Eye,
  ShoppingBag,
  DollarSign,
  Package,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface RefundedOrder {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    subtotal_cents: number;
  }>;
  payments: Array<{
    gateway: string;
    gateway_payment_id: string | null;
    amount_cents: number;
    payment_method: string | null;
  }>;
}

export default async function AdminPedidosReembolsadosPage() {
  const supabase = await createClient();

  // 1. Busca todos os pedidos com status 'refunded'
  const { data: rawOrders } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_cents,
      subtotal_cents,
      shipping_cents,
      notes,
      created_at,
      updated_at,
      profiles (
        full_name,
        email,
        phone
      ),
      order_items (
        id,
        product_name,
        quantity,
        subtotal_cents
      ),
      payments (
        gateway,
        gateway_payment_id,
        amount_cents,
        payment_method
      )
    `)
    .eq("status", "refunded")
    .order("updated_at", { ascending: false });

  const refundedOrders = (rawOrders || []) as unknown as RefundedOrder[];

  // 2. Busca total geral de pedidos para calcular taxa real
  const { count: totalOrdersCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  const totalRefundedCents = refundedOrders.reduce(
    (acc, ord) => acc + ord.total_cents,
    0
  );

  const totalReturnedItems = refundedOrders.reduce((acc, ord) => {
    const itemsCount = ord.order_items?.reduce(
      (sub, it) => sub + it.quantity,
      0
    ) || 0;
    return acc + itemsCount;
  }, 0);

  const refundRate =
    totalOrdersCount && totalOrdersCount > 0
      ? ((refundedOrders.length / totalOrdersCount) * 100).toFixed(1)
      : "0.0";

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
            <span className="text-texto-escuro dark:text-[#F8EFF1] font-medium">Reembolsados</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Pedidos Reembolsados & Devolvidos
          </h1>
          <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
            Histórico consolidado de pedidos estornados e itens retornados ao estoque.
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

      {/* Cards de Métricas Reais de Reembolso */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/40">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Total Estornado</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatPrice(totalRefundedCents)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Pedidos Estornados</p>
            <p className="text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {refundedOrders.length}{" "}
              <span className="text-xs font-normal text-texto-claro dark:text-[#988087]">
                {refundedOrders.length === 1 ? "pedido" : "pedidos"}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/40">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Itens Devolvidos ao Estoque</p>
            <p className="text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {totalReturnedItems}{" "}
              <span className="text-xs font-normal text-texto-claro dark:text-[#988087]">unidades</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-texto-claro dark:text-[#988087] font-medium">Taxa de Reembolso</p>
            <p className="text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {refundRate}%{" "}
              <span className="text-xs font-normal text-texto-claro dark:text-[#988087]">das vendas</span>
            </p>
          </div>
        </div>
      </div>

      {/* Banner Informativo de Reversão Automática */}
      <div className="p-4 bg-primaria-soft/50 dark:bg-primaria-soft/20 rounded-2xl border border-primaria/20 flex items-center gap-3 text-xs text-texto-escuro dark:text-[#F8EFF1]">
        <ShieldCheck className="w-5 h-5 text-primaria shrink-0" />
        <p>
          <span className="font-semibold text-primaria">Garantia de Integridade de Estoque:</span>{" "}
          Quando um pedido é marcado como &quot;Reembolsado&quot; no painel ou via webhook do Mercado Pago,
          as quantidades dos produtos são automaticamente devolvidas ao estoque do catálogo.
        </p>
      </div>

      {/* Tabela de Pedidos Reembolsados */}
      <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 dark:bg-[#251A1E] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#988087] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Pedido</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Itens Devolvidos</th>
                <th className="px-5 py-3.5">Gateway / Pagamento</th>
                <th className="px-5 py-3.5">Valor Reembolsado</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-texto-escuro dark:text-[#F8EFF1]">
              {refundedOrders.length > 0 ? (
                refundedOrders.map((ord) => {
                  const payment = ord.payments?.[0];

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-fundo/30 dark:hover:bg-[#251A1E]/40 transition-colors"
                    >
                      {/* Pedido */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/40">
                            <RotateCcw className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                              #{ord.order_number}
                            </p>
                            <p className="text-[11px] text-texto-claro dark:text-[#988087] font-mono">
                              Estornado em: {formatDate(ord.updated_at || ord.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                          {ord.profiles?.full_name || "Cliente Isis Store"}
                        </p>
                        <p className="text-[11px] text-texto-claro dark:text-[#988087]">
                          {ord.profiles?.email || "Sem e-mail"}
                        </p>
                        {ord.profiles?.phone && (
                          <p className="text-[10px] text-texto-claro dark:text-[#988087] font-mono">
                            {ord.profiles.phone}
                          </p>
                        )}
                      </td>

                      {/* Itens Devolvidos */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 max-w-xs">
                          {ord.order_items && ord.order_items.length > 0 ? (
                            ord.order_items.map((item) => (
                              <span
                                key={item.id}
                                className="text-xs text-texto-escuro dark:text-[#F8EFF1] font-medium"
                              >
                                • {item.product_name}{" "}
                                <span className="text-texto-claro dark:text-[#988087] font-normal">
                                  ({item.quantity}x dev.)
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-texto-claro dark:text-[#988087] italic">Sem itens</span>
                          )}
                        </div>
                      </td>

                      {/* Gateway / Pagamento */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-texto-claro dark:text-[#988087] shrink-0" />
                          <div>
                            <p className="font-medium text-texto-escuro dark:text-[#F8EFF1] uppercase text-[11px]">
                              {payment?.gateway || "Mercado Pago"}
                            </p>
                            <p className="text-[10px] text-texto-claro dark:text-[#988087] font-mono truncate max-w-[140px]">
                              {payment?.gateway_payment_id || "Estorno via sistema"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Valor Total Reembolsado */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                          {formatPrice(ord.total_cents)}
                        </p>
                        <p className="text-[10px] text-texto-claro dark:text-[#988087]">
                          (Produtos: {formatPrice(ord.subtotal_cents)} + Frete:{" "}
                          {formatPrice(ord.shipping_cents)})
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-neutral-100 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700">
                          Reembolsado
                        </span>
                        {ord.notes && (
                          <p className="text-[10px] text-texto-claro dark:text-[#988087] mt-1 line-clamp-1 italic max-w-xs">
                            Motivo: {ord.notes}
                          </p>
                        )}
                      </td>

                      {/* Ação */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/pedidos/${ord.id}`}
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
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-texto-claro dark:text-[#988087]">
                    Nenhum pedido reembolsado registrado até o momento.
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
