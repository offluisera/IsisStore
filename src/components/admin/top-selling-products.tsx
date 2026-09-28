import Link from "next/link";
import Image from "next/image";
import { Award, ArrowRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopSellingItem {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  total_sold: number;
  revenue_cents: number;
  percentage: number;
}

interface TopSellingProductsProps {
  products: TopSellingItem[];
}

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  const formatBrl = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="bg-white border border-[#F0E5E7] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full select-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F7EFF1]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro">
              Produtos Mais Vendidos
            </h2>
            <p className="text-xs text-texto-claro">
              Ranking de saída com base em itens de pedidos faturados
            </p>
          </div>
        </div>

        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primaria hover:text-primaria-hover transition-colors group"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Lista de Ranking */}
      <div className="divide-y divide-[#F7EFF1] pt-2 flex-1">
        {products.length === 0 ? (
          <div className="py-12 text-center text-xs text-texto-claro space-y-1">
            <Package className="w-8 h-8 text-primaria/30 mx-auto" />
            <p className="font-semibold text-texto-escuro">
              Nenhum produto vendido ainda
            </p>
            <p className="text-[11px]">
              O ranking dos produtos mais procurados será exibido após os primeiros pedidos.
            </p>
          </div>
        ) : (
          products.map((item, index) => {
            const rank = String(index + 1).padStart(2, "0");
            const isTop1 = index === 0;

            return (
              <div
                key={item.id}
                className="py-3 px-1 sm:px-2 flex items-center gap-3 sm:gap-4 hover:bg-[#FFF5F6]/40 rounded-xl transition-colors group"
              >
                {/* Posição 01, 02... */}
                <span
                  className={cn(
                    "font-mono font-bold text-xs w-6 text-center shrink-0",
                    isTop1
                      ? "text-primaria font-black scale-110"
                      : "text-texto-claro/80"
                  )}
                >
                  {rank}
                </span>

                {/* Miniatura do Produto */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FFF5F6] border border-[#F7EFF1] flex items-center justify-center shrink-0 shadow-2xs relative">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-4 h-4 text-primaria/40" />
                  )}
                </div>

                {/* Nome, Barra de Progresso e Métricas */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-texto-escuro truncate group-hover:text-primaria transition-colors">
                      {item.name}
                    </p>
                    <span className="text-xs font-mono font-bold text-texto-escuro shrink-0">
                      {item.total_sold} <span className="text-[10px] font-normal text-texto-claro">vendidos</span>
                    </span>
                  </div>

                  {/* Barra de Participação Visual */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-1.5 bg-[#F7EFF1] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700 ease-out",
                          isTop1
                            ? "bg-gradient-to-r from-secundaria via-primaria to-primaria"
                            : "bg-primaria/70"
                        )}
                        style={{ width: `${Math.max(item.percentage, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-medium text-texto-claro shrink-0">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Faturamento do Produto */}
                {item.revenue_cents > 0 && (
                  <div className="hidden sm:block text-right shrink-0 pl-2">
                    <p className="text-xs font-mono font-bold text-texto-escuro">
                      {formatBrl(item.revenue_cents)}
                    </p>
                    <p className="text-[10px] text-texto-claro">total</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
