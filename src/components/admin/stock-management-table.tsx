"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Loader2,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Sparkles,
} from "lucide-react";
import {
  updateProductStockAction,
  updateProductStatusAction,
} from "@/features/admin/actions";
import { cn } from "@/lib/utils";

export interface StockProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price_cents: number;
  stock: number;
  status: string;
  categoryName: string;
  imageUrl?: string | null;
}

interface StockManagementTableProps {
  initialProducts: StockProductItem[];
}

type FilterTab = "all" | "out" | "low" | "healthy";
type SortOption = "stock-asc" | "stock-desc" | "name-asc" | "price-desc";

export function StockManagementTable({
  initialProducts,
}: StockManagementTableProps) {
  const [products, setProducts] = React.useState<StockProductItem[]>(initialProducts);
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("stock-asc");
  const [loadingIds, setLoadingIds] = React.useState<Record<string, boolean>>({});
  const [feedbackMap, setFeedbackMap] = React.useState<Record<string, string>>({});

  // Atualizar quando initialProducts mudar (ex: revalidação server-side)
  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    const currentProd = products.find((p) => p.id === productId);
    if (!currentProd || currentProd.stock === newStock) return;

    const previousStock = currentProd.stock;

    // Atualização otimista
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    setLoadingIds((prev) => ({ ...prev, [productId]: true }));

    try {
      const res = await updateProductStockAction(productId, newStock);
      if (res.success) {
        setFeedbackMap((prev) => ({ ...prev, [productId]: "Salvo!" }));
        setTimeout(() => {
          setFeedbackMap((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }, 2200);
      } else {
        // Reverte se falhou
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: previousStock } : p))
        );
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: previousStock } : p))
      );
    } finally {
      setLoadingIds((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const handleQuickAdd = (productId: string, amount: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    handleStockUpdate(productId, prod.stock + amount);
  };

  const handleStatusChange = async (
    productId: string,
    newStatus: "published" | "draft" | "archived"
  ) => {
    setLoadingIds((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await updateProductStatusAction(productId, newStatus);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
        );
        setFeedbackMap((prev) => ({ ...prev, [productId]: "Status alterado!" }));
        setTimeout(() => {
          setFeedbackMap((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        }, 2000);
      }
    } finally {
      setLoadingIds((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Contadores para as abas
  const countTotal = products.length;
  const countOut = products.filter((p) => p.stock === 0).length;
  const countLow = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const countHealthy = products.filter((p) => p.stock > 5).length;

  // Filtragem
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        if (activeTab === "out") return p.stock === 0;
        if (activeTab === "low") return p.stock > 0 && p.stock <= 5;
        if (activeTab === "healthy") return p.stock > 5;
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
        if (sortBy === "stock-asc") return a.stock - b.stock;
        if (sortBy === "stock-desc") return b.stock - a.stock;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "price-desc") return b.price_cents - a.price_cents;
        return 0;
      });
  }, [products, activeTab, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros, Abas e Pesquisa */}
      <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Abas por Estado de Estoque */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "all"
                ? "bg-texto-escuro dark:bg-fundo text-white dark:text-texto-escuro shadow-2xs"
                : "bg-fundo dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo/80 dark:hover:bg-[#251A1E]/80"
            )}
          >
            <span>Todos</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "all" ? "bg-white/20 dark:bg-black/20 text-white dark:text-texto-escuro" : "bg-white dark:bg-[#151012] text-texto-claro dark:text-[#988087]"
              )}
            >
              {countTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("out")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "out"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/50"
            )}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Esgotados</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                activeTab === "out" ? "bg-white/25 text-white" : "bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200"
              )}
            >
              {countOut}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("low")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "low"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-950/50"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Estoque Baixo</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                activeTab === "low" ? "bg-white/25 text-white" : "bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200"
              )}
            >
              {countLow}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("healthy")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "healthy"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normal</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                activeTab === "healthy" ? "bg-white/25 text-white" : "bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200"
              )}
            >
              {countHealthy}
            </span>
          </button>
        </div>

        {/* Campo de Busca & Ordenação */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#988087] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por produto, SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-fundo/50 dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl text-xs text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#988087]/70 focus:outline-none focus:ring-1 focus:ring-primaria focus:bg-white dark:focus:bg-[#1E1518] transition-all"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl text-xs font-medium text-texto-escuro dark:text-[#F8EFF1] focus:outline-none focus:ring-1 focus:ring-primaria transition-all"
              aria-label="Ordenar estoque"
            >
              <option value="stock-asc" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Menor Estoque</option>
              <option value="stock-desc" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Maior Estoque</option>
              <option value="name-asc" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Nome (A - Z)</option>
              <option value="price-desc" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Maior Preço</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos com Gestão de Estoque */}
      <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 dark:bg-[#151012] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#988087] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Produto</th>
                <th className="px-5 py-3.5">Categoria</th>
                <th className="px-5 py-3.5">Preço Unit.</th>
                <th className="px-5 py-3.5">Nível de Estoque</th>
                <th className="px-5 py-3.5">Ajuste Rápido (+ / -)</th>
                <th className="px-5 py-3.5">Ações Rápidas</th>
                <th className="px-5 py-3.5 text-right">Vitrine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-texto-escuro dark:text-[#F8EFF1]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => {
                  const isLoading = Boolean(loadingIds[item.id]);
                  const feedback = feedbackMap[item.id];
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock <= 5;

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors",
                        isOutOfStock
                          ? "bg-rose-50/25 dark:bg-rose-950/15 hover:bg-rose-50/40 dark:hover:bg-rose-950/25"
                          : isLowStock
                          ? "bg-amber-50/20 dark:bg-amber-950/15 hover:bg-amber-50/35 dark:hover:bg-amber-950/25"
                          : "hover:bg-fundo/30 dark:hover:bg-[#251A1E]/30"
                      )}
                    >
                      {/* Miniatura + Identificação */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-fundo dark:bg-[#251A1E] border border-borda dark:border-[#38262C] shrink-0 relative flex items-center justify-center">
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
                            <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">{item.name}</p>
                            <p className="text-[11px] text-texto-claro dark:text-[#988087] font-mono">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-5 py-4 text-texto-medio dark:text-[#D4BFC5]">
                        {item.categoryName}
                      </td>

                      {/* Preço Unitário */}
                      <td className="px-5 py-4 font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                        {formatPrice(item.price_cents)}
                      </td>

                      {/* Nível de Estoque com Badge */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight",
                                isOutOfStock
                                  ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50"
                                  : isLowStock
                                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                                  : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                              )}
                            >
                              {isOutOfStock ? (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  <span>Esgotado (0 un.)</span>
                                </>
                              ) : isLowStock ? (
                                <>
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Crítico ({item.stock} un.)</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Normal ({item.stock} un.)</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Valor em inventário deste produto */}
                          <span className="text-[10px] text-texto-claro dark:text-[#988087] font-mono">
                            Valor total: {formatPrice(item.stock * item.price_cents)}
                          </span>
                        </div>
                      </td>

                      {/* Controle Interativo de Estoque (+ / - / input) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-borda dark:border-[#38262C] rounded-xl bg-white dark:bg-[#151012] p-0.5 shadow-2xs">
                            <button
                              type="button"
                              disabled={isLoading || item.stock <= 0}
                              onClick={() => handleStockUpdate(item.id, item.stock - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] disabled:opacity-30 transition-colors"
                              title="Diminuir estoque (-1)"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min={0}
                              disabled={isLoading}
                              value={item.stock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 0) {
                                  setProducts((prev) =>
                                    prev.map((p) =>
                                      p.id === item.id ? { ...p, stock: val } : p
                                    )
                                  );
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 0) {
                                  handleStockUpdate(item.id, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                                  if (!isNaN(val) && val >= 0) {
                                    handleStockUpdate(item.id, val);
                                  }
                                }
                              }}
                              className={cn(
                                "w-12 text-center font-mono font-bold text-xs bg-transparent focus:outline-none focus:bg-fundo/40 dark:focus:bg-[#251A1E] rounded-sm",
                                isOutOfStock
                                  ? "text-rose-600 dark:text-rose-400"
                                  : isLowStock
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-texto-escuro dark:text-[#F8EFF1]"
                              )}
                              aria-label={`Estoque de ${item.name}`}
                            />

                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleStockUpdate(item.id, item.stock + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors"
                              title="Aumentar estoque (+1)"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Botão de Reposição Rápida (+10 un.) */}
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleQuickAdd(item.id, 10)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-primaria/10 text-primaria hover:bg-primaria hover:text-white transition-colors"
                            title="Adicionar lote de 10 unidades"
                          >
                            +10
                          </button>

                          {isLoading && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primaria shrink-0" />
                          )}

                          {feedback && (
                            <span className="text-[10px] text-sucesso font-bold shrink-0 animate-in fade-in">
                              {feedback}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Seletor de Status (Publicado / Rascunho / Arquivado) */}
                      <td className="px-5 py-4">
                        <select
                          value={item.status}
                          disabled={isLoading}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as "published" | "draft" | "archived"
                            )
                          }
                          className="bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-texto-escuro dark:text-[#F8EFF1] focus:outline-none focus:ring-1 focus:ring-primaria transition-all"
                        >
                          <option value="published" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Publicado</option>
                          <option value="draft" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Rascunho</option>
                          <option value="archived" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Arquivado</option>
                        </select>
                      </td>

                      {/* Link para visualização na vitrine */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/produtos/${item.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-primaria hover:underline font-semibold text-[11px]"
                        >
                          <span>Ver</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-texto-claro dark:text-[#988087] space-y-1">
                    <Package className="w-8 h-8 text-primaria/30 mx-auto mb-2" />
                    <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                      Nenhum produto encontrado com os filtros atuais.
                    </p>
                    <p className="text-[11px]">
                      Tente alterar a busca ou trocar a aba de filtro.
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
