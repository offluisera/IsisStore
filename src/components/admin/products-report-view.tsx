"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Search,
  ArrowUpDown,
  Printer,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  Boxes,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductReportItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryName: string;
  price_cents: number;
  stock: number;
  imageUrl?: string | null;
  unitsSold: number;
  revenueCents: number;
  ordersCount: number;
  percentageUnits: number;
  percentageRevenue: number;
}

interface ProductsReportViewProps {
  products: ProductReportItem[];
  totalRevenueCents: number;
  totalUnitsSold: number;
}

type ReportFilterTab = "ranking" | "revenue" | "all" | "zero";

export function ProductsReportView({
  products,
  totalRevenueCents,
  totalUnitsSold,
}: ProductsReportViewProps) {
  const [activeTab, setActiveTab] = React.useState<ReportFilterTab>("ranking");
  const [search, setSearch] = React.useState("");

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtragem e ordenação
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        if (activeTab === "ranking") return p.unitsSold > 0;
        if (activeTab === "revenue") return p.revenueCents > 0;
        if (activeTab === "zero") return p.unitsSold === 0;
        return true;
      })
      .filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (activeTab === "revenue") {
          return b.revenueCents - a.revenueCents;
        }
        if (activeTab === "zero") {
          return a.name.localeCompare(b.name);
        }
        // Default: mais unidades vendidas
        return b.unitsSold - a.unitsSold || b.revenueCents - a.revenueCents;
      });
  }, [products, activeTab, search]);

  const countSoldProducts = products.filter((p) => p.unitsSold > 0).length;
  const countZeroProducts = products.filter((p) => p.unitsSold === 0).length;

  return (
    <div className="space-y-6">
      {/* Barra de Filtros, Abas e Ações */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-borda shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Abas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("ranking")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "ranking"
                ? "bg-primaria text-white shadow-2xs"
                : "bg-fundo text-texto-medio hover:text-texto-escuro hover:bg-fundo/80"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mais Vendidos (Unidades)</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "ranking" ? "bg-white/20 text-white" : "bg-white text-texto-claro"
              )}
            >
              {countSoldProducts}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("revenue")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "revenue"
                ? "bg-primaria text-white shadow-2xs"
                : "bg-fundo text-texto-medio hover:text-texto-escuro hover:bg-fundo/80"
            )}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Maior Faturamento (R$)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "all"
                ? "bg-primaria text-white shadow-2xs"
                : "bg-fundo text-texto-medio hover:text-texto-escuro hover:bg-fundo/80"
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Todos os Itens</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "all" ? "bg-white/20 text-white" : "bg-white text-texto-claro"
              )}
            >
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("zero")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "zero"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100/70"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sem Saída (0 vendas)</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                activeTab === "zero" ? "bg-white/25 text-white" : "bg-amber-200/80 text-amber-900"
              )}
            >
              {countZeroProducts}
            </span>
          </button>
        </div>

        {/* Busca e Botão de Imprimir */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nome, SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-fundo/50 border border-borda rounded-xl text-xs text-texto-escuro placeholder:text-texto-claro/70 focus:outline-none focus:ring-1 focus:ring-primaria focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-borda hover:bg-fundo rounded-xl text-xs font-medium text-texto-escuro transition-colors shadow-2xs shrink-0"
            title="Imprimir ou exportar relatório em PDF"
          >
            <Printer className="w-3.5 h-3.5 text-texto-claro" />
            <span className="hidden sm:inline">Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Tabela do Relatório de Vendas */}
      <div className="bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 border-b border-borda text-texto-claro uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-14 text-center">Pos.</th>
                <th className="px-5 py-3.5">Produto &amp; SKU</th>
                <th className="px-5 py-3.5">Categoria</th>
                <th className="px-5 py-3.5">Preço Unit.</th>
                <th className="px-5 py-3.5 text-center">Unid. Vendidas</th>
                <th className="px-5 py-3.5 text-right">Faturamento Total</th>
                <th className="px-5 py-3.5 w-44">Participação</th>
                <th className="px-5 py-3.5 text-center">Estoque Atual</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 text-texto-escuro">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item, index) => {
                  const rank = index + 1;
                  const isTop1 = rank === 1 && item.unitsSold > 0;
                  const isTop2 = rank === 2 && item.unitsSold > 0;
                  const isTop3 = rank === 3 && item.unitsSold > 0;
                  const isZeroSales = item.unitsSold === 0;

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors",
                        isTop1
                          ? "bg-amber-50/20 hover:bg-amber-50/40"
                          : "hover:bg-fundo/30"
                      )}
                    >
                      {/* Posição no Ranking */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center font-mono font-bold text-xs rounded-full",
                            isTop1
                              ? "w-6 h-6 bg-amber-400 text-amber-950 font-black shadow-2xs"
                              : isTop2
                              ? "w-6 h-6 bg-slate-300 text-slate-800 font-bold shadow-2xs"
                              : isTop3
                              ? "w-6 h-6 bg-amber-600/30 text-amber-900 font-bold"
                              : "text-texto-claro"
                          )}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Miniatura + Nome */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-fundo border border-borda shrink-0 relative flex items-center justify-center">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-primaria" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-texto-escuro">{item.name}</p>
                              {isTop1 && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Top 1
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-texto-claro font-mono">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-5 py-4 text-texto-medio">
                        {item.categoryName}
                      </td>

                      {/* Preço Unitário */}
                      <td className="px-5 py-4 font-mono text-texto-medio">
                        {formatPrice(item.price_cents)}
                      </td>

                      {/* Unidades Vendidas */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            "font-mono font-bold text-sm",
                            isZeroSales ? "text-texto-claro/60" : "text-texto-escuro"
                          )}
                        >
                          {item.unitsSold.toLocaleString("pt-BR")}{" "}
                          <span className="text-[11px] font-normal text-texto-claro">un.</span>
                        </span>
                      </td>

                      {/* Faturamento Total */}
                      <td className="px-5 py-4 text-right">
                        <span
                          className={cn(
                            "font-mono font-bold text-xs",
                            item.revenueCents > 0
                              ? "text-primaria"
                              : "text-texto-claro/60"
                          )}
                        >
                          {formatPrice(item.revenueCents)}
                        </span>
                      </td>

                      {/* Barra de Participação Visual */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] text-texto-claro">
                            <span>{item.percentageRevenue}% faturamento</span>
                            <span>{item.percentageUnits}% volume</span>
                          </div>
                          <div className="w-full h-1.5 bg-fundo rounded-full overflow-hidden border border-borda/40">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isTop1
                                  ? "bg-gradient-to-r from-amber-400 to-primaria"
                                  : "bg-primaria"
                              )}
                              style={{
                                width: `${Math.max(
                                  Math.min(item.percentageRevenue, 100),
                                  item.revenueCents > 0 ? 3 : 0
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Estoque Atual */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                            item.stock === 0
                              ? "bg-rose-100 text-rose-700"
                              : item.stock <= 5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          )}
                        >
                          {item.stock} un.
                        </span>
                      </td>

                      {/* Ações Rápidas */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href="/admin/produtos/estoque"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-texto-medio hover:text-primaria transition-colors"
                            title="Ajustar estoque deste item"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Estoque</span>
                          </Link>
                          <Link
                            href={`/produtos/${item.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primaria hover:underline"
                            title="Ver produto na loja"
                          >
                            <span>Ver</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-texto-claro space-y-1">
                    <Package className="w-8 h-8 text-primaria/30 mx-auto mb-2" />
                    <p className="font-semibold text-texto-escuro">
                      Nenhum produto atende aos filtros selecionados.
                    </p>
                    <p className="text-[11px]">
                      Altere as abas ou o texto da busca para visualizar outros itens.
                    </p>
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
