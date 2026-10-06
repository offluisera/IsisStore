"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  TrendingUp,
  Edit3,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Package,
  ShoppingBag,
} from "lucide-react";
import { deleteCategoryAction } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

export interface CategoryWithStats {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  salesCount: number;
  revenueCents: number;
  accessCount: number;
  accessShare: number;
  is_active: boolean;
  sort_order: number;
}

interface CategoriesListViewProps {
  initialCategories: CategoryWithStats[];
  totalRecordedAccesses?: number;
}

type TabFilter = "all" | "most-accessed" | "most-products";

export function CategoriesListView({
  initialCategories,
  totalRecordedAccesses = 0,
}: CategoriesListViewProps) {
  const [categories, setCategories] = React.useState<CategoryWithStats[]>(initialCategories);
  const [activeTab, setActiveTab] = React.useState<TabFilter>("all");
  const [search, setSearch] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    setFeedback(null);

    try {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao excluir categoria." });
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const filteredCategories = React.useMemo(() => {
    return categories
      .filter((cat) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (activeTab === "most-accessed") {
          return b.accessCount - a.accessCount || b.productCount - a.productCount;
        }
        if (activeTab === "most-products") {
          return b.productCount - a.productCount || b.accessCount - a.accessCount;
        }
        return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
      });
  }, [categories, activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Feedback de ação */}
      {feedback && (
        <div
          role="status"
          className={cn(
            "p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in",
            feedback.type === "success"
              ? "bg-sucesso/10 text-sucesso border border-sucesso/20"
              : "bg-erro/10 text-erro border border-erro/20"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Barra de Filtros, Abas e Pesquisa */}
      <div className="bg-white dark:bg-[#1E1518] p-4 sm:p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Abas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "all"
                ? "bg-primaria text-white shadow-2xs"
                : "bg-fundo dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo/80 dark:hover:bg-[#2F2126]"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todas ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("most-accessed")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "most-accessed"
                ? "bg-primaria text-white shadow-2xs"
                : "bg-fundo dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo/80 dark:hover:bg-[#2F2126]"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mais Acessadas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("most-products")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
              activeTab === "most-products"
                ? "bg-primaria text-white shadow-2xs"
                : "bg-fundo dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo/80 dark:hover:bg-[#2F2126]"
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Mais Produtos</span>
          </button>
        </div>

        {/* Campo de Busca & Ação Nova */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#988087] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoria ou slug..."
              className="w-full pl-9 pr-3 py-1.5 bg-fundo/50 dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl text-xs text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#988087] focus:outline-none focus:ring-1 focus:ring-primaria focus:bg-white dark:focus:bg-[#1E1518] transition-all"
            />
          </div>

          <Link
            href="/admin/categorias/novo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primaria text-white hover:bg-primaria-hover rounded-xl text-xs font-semibold transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Criar Categoria</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Categorias com Dados 100% Reais */}
      <div className="bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fundo/60 dark:bg-[#251A1E] border-b border-borda dark:border-[#38262C] text-texto-claro dark:text-[#A89299] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-14 text-center">Pos.</th>
                <th className="px-5 py-3.5">Categoria &amp; Slug</th>
                <th className="px-5 py-3.5">Descrição</th>
                <th className="px-5 py-3.5 text-center">Produtos</th>
                <th className="px-5 py-3.5 text-center">Vendas</th>
                <th className="px-5 py-3.5 text-center">Acessos Reais</th>
                <th className="px-5 py-3.5 w-40 text-center">Participação</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60 dark:divide-[#38262C]/60 text-texto-escuro dark:text-[#F8EFF1]">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, index) => {
                  const rank = index + 1;
                  const isTopAccess =
                    totalRecordedAccesses > 0 &&
                    cat.accessCount > 0 &&
                    rank === 1;

                  return (
                    <tr
                      key={cat.id}
                      className={cn(
                        "transition-colors",
                        isTopAccess
                          ? "bg-amber-50/20 dark:bg-amber-950/20 hover:bg-amber-50/40 dark:hover:bg-amber-950/30"
                          : "hover:bg-fundo/30 dark:hover:bg-[#251A1E]/40"
                      )}
                    >
                      {/* Posição no Ranking */}
                      <td className="px-5 py-4 text-center">
                        <span className="font-mono font-bold text-xs text-texto-claro dark:text-[#A89299]">
                          {rank}
                        </span>
                      </td>

                      {/* Nome e Slug */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center shrink-0 border border-primaria/20 dark:border-primaria/30">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1] text-sm">
                                {cat.name}
                              </p>
                              {isTopAccess && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700/60">
                                  Mais Acessada
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-texto-claro dark:text-[#988087] font-mono">
                              /{cat.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Descrição */}
                      <td className="px-5 py-4 text-texto-medio dark:text-[#D4BFC5] max-w-xs truncate">
                        {cat.description || (
                          <span className="italic text-texto-claro/50 dark:text-[#988087]/50">Sem descrição</span>
                        )}
                      </td>

                      {/* Produtos Vinculados Reais */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold",
                            cat.productCount > 0
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                              : "bg-fundo dark:bg-[#251A1E] text-texto-claro dark:text-[#988087] border border-borda dark:border-[#38262C]"
                          )}
                        >
                          {cat.productCount} {cat.productCount === 1 ? "item" : "itens"}
                        </span>
                      </td>

                      {/* Vendas Reais */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-bold text-xs text-texto-escuro dark:text-[#F8EFF1]">
                            {cat.salesCount} {cat.salesCount === 1 ? "un." : "un."}
                          </span>
                          {cat.revenueCents > 0 && (
                            <span className="text-[10px] text-primaria font-mono font-semibold">
                              {formatPrice(cat.revenueCents)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acessos Reais (Sem estimativas inventadas) */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
                          <Eye className="w-3.5 h-3.5 text-primaria" />
                          <span>{cat.accessCount}</span>
                        </div>
                      </td>

                      {/* Participação Real */}
                      <td className="px-5 py-4 text-center">
                        {totalRecordedAccesses > 0 ? (
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-xs font-mono font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                              {cat.accessShare}%
                            </span>
                            <div className="w-24 h-1.5 bg-fundo dark:bg-[#251A1E] rounded-full overflow-hidden border border-borda/40 dark:border-[#38262C]">
                              <div
                                className="h-full bg-primaria rounded-full"
                                style={{ width: `${Math.max(cat.accessShare, 2)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-texto-claro/60 dark:text-[#988087]/60">0%</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                            cat.is_active
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {cat.is_active ? "Ativa" : "Inativa"}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/categorias/editar?id=${cat.id}`}
                            className="p-1.5 rounded-lg text-texto-medio dark:text-[#D4BFC5] hover:text-primaria hover:bg-primaria/10 dark:hover:bg-primaria/20 transition-colors"
                            title="Editar esta categoria"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/produtos?categoria=${cat.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-texto-medio dark:text-[#D4BFC5] hover:text-primaria hover:bg-primaria/10 dark:hover:bg-primaria/20 transition-colors"
                            title="Ver produtos desta categoria na vitrine"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            disabled={deletingId === cat.id || cat.productCount > 0}
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 rounded-lg text-texto-claro dark:text-[#988087] hover:text-erro hover:bg-erro/10 disabled:opacity-20 transition-colors"
                            title={
                              cat.productCount > 0
                                ? "Não é possível excluir: existem produtos vinculados"
                                : "Excluir categoria"
                            }
                          >
                            {deletingId === cat.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-erro" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-texto-claro dark:text-[#988087] space-y-1">
                    <Layers className="w-8 h-8 text-primaria/30 mx-auto mb-2" />
                    <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
                      Nenhuma categoria encontrada com os filtros atuais.
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
