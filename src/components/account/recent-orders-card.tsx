import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecentOrderItemData {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_cents: number;
  items_count: number;
  product_images?: string[];
}

interface RecentOrdersCardProps {
  orders: RecentOrderItemData[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  delivered: {
    label: "Entregue",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-200/60 dark:border-emerald-800/50",
  },
  shipped: {
    label: "Em transporte",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    textClass: "text-rose-700 dark:text-rose-300",
    borderClass: "border-rose-200/60 dark:border-rose-800/50",
  },
  processing: {
    label: "Processando",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-200/60 dark:border-amber-800/50",
  },
  paid: {
    label: "Pago",
    bgClass: "bg-teal-50 dark:bg-teal-950/40",
    textClass: "text-teal-700 dark:text-teal-300",
    borderClass: "border-teal-200/60 dark:border-teal-800/50",
  },
  pending_payment: {
    label: "Pendente",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-200/60 dark:border-amber-800/50",
  },
  cancelled: {
    label: "Cancelado",
    bgClass: "bg-gray-100 dark:bg-gray-800/60",
    textClass: "text-gray-600 dark:text-gray-400",
    borderClass: "border-gray-200 dark:border-gray-700",
  },
};

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
          Últimos pedidos
        </h2>

        <Link
          href="/conta/pedidos"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primaria hover:text-primaria-hover transition-colors group"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-fundo-card dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#332228] p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-primaria-soft dark:bg-[#2C1A20] text-primaria flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Você ainda não fez nenhum pedido
          </h3>
          <p className="text-xs text-texto-claro dark:text-[#A89299] max-w-sm mx-auto mt-1 mb-4">
            Acompanhe aqui o andamento de cada entrega assim que realizar suas compras na loja.
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primaria text-white text-xs font-semibold hover:bg-primaria-hover transition-colors shadow-2xs"
          >
            <span>Explorar produtos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1200px]:grid-cols-4 gap-4">
          {orders.map((ord) => {
            const statusConfig = STATUS_CONFIG[ord.status] || {
              label: ord.status,
              bgClass: "bg-gray-50 dark:bg-gray-800",
              textClass: "text-gray-700 dark:text-gray-300",
              borderClass: "border-gray-200 dark:border-gray-700",
            };

            return (
              <div
                key={ord.id}
                className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Topo: Número do Pedido + Badge */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
                    <span className="font-mono text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      #{ord.order_number}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        statusConfig.bgClass,
                        statusConfig.textClass,
                        statusConfig.borderClass
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Data e Quantidade de Itens */}
                  <p className="text-[11px] text-texto-claro dark:text-[#A89299] mb-3">
                    {formatDate(ord.created_at)} &bull; {ord.items_count}{" "}
                    {ord.items_count === 1 ? "item" : "itens"}
                  </p>

                  {/* Miniaturas de Produtos Comprados */}
                  <div className="flex items-center gap-2 py-2">
                    {ord.product_images && ord.product_images.length > 0 ? (
                      ord.product_images.slice(0, 3).map((img, i) => (
                        <div
                          key={i}
                          className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FFF5F6] dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#332228] shadow-2xs"
                        >
                          <Image
                            src={img}
                            alt="Produto do pedido"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F8] dark:bg-[#251A1E] border border-[#F0E5E7] dark:border-[#332228] flex items-center justify-center text-primaria/40">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Valor Total do Pedido */}
                  <p className="font-serif font-bold text-sm sm:text-base text-texto-escuro dark:text-[#F8EFF1] mt-2">
                    {formatPrice(ord.total_cents)}
                  </p>
                </div>

                {/* Botão Ver Detalhes */}
                <Link
                  href={`/conta/pedidos/${ord.id}`}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-center border border-primaria/30 dark:border-primaria/40 text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23] transition-colors"
                >
                  Ver detalhes
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
