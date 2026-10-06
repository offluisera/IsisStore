"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  updateCategoryAction,
  deleteCategoryAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Save,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditableCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  is_active: boolean;
  sort_order: number;
}

interface EditCategoryViewProps {
  categories: EditableCategory[];
  initialSelectedId?: string;
}

export function EditCategoryView({
  categories: initialCategories,
  initialSelectedId,
}: EditCategoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") || initialSelectedId;

  const [categories, setCategories] = React.useState<EditableCategory[]>(initialCategories);
  const [selectedId, setSelectedId] = React.useState<string>(
    queryId && initialCategories.some((c) => c.id === queryId)
      ? queryId
      : initialCategories[0]?.id || ""
  );

  const [search, setSearch] = React.useState("");

  // Estado do formulário da categoria selecionada
  const selectedCategory = categories.find((c) => c.id === selectedId) || categories[0];

  const [name, setName] = React.useState(selectedCategory?.name || "");
  const [slug, setSlug] = React.useState(selectedCategory?.slug || "");
  const [description, setDescription] = React.useState(selectedCategory?.description || "");
  const [sortOrder, setSortOrder] = React.useState(selectedCategory?.sort_order || 0);
  const [isActive, setIsActive] = React.useState(selectedCategory?.is_active ?? true);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Atualizar campos do formulário quando mudar a categoria selecionada
  React.useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name);
      setSlug(selectedCategory.slug);
      setDescription(selectedCategory.description || "");
      setSortOrder(selectedCategory.sort_order);
      setIsActive(selectedCategory.is_active);
      setFeedback(null);
    }
  }, [selectedCategory?.id]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    router.replace(`/admin/categorias/editar?id=${id}`, { scroll: false });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !name.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("id", selectedCategory.id);
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("sort_order", String(sortOrder));
    formData.append("is_active", String(isActive));

    try {
      const res = await updateCategoryAction(formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategory.id
              ? {
                  ...c,
                  name,
                  slug,
                  description: description || null,
                  sort_order: sortOrder,
                  is_active: isActive,
                }
              : c
          )
        );
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Ocorreu uma falha ao atualizar a categoria.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    if (
      !confirm(
        `Tem certeza que deseja excluir a categoria "${selectedCategory.name}"?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await deleteCategoryAction(selectedCategory.id);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        const remaining = categories.filter((c) => c.id !== selectedCategory.id);
        setCategories(remaining);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
        }
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Erro ao excluir a categoria.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredList = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Coluna Lateral: Seletor de Categorias */}
      <div className="lg:col-span-4 bg-white dark:bg-[#1E1518] p-5 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-4">
        <div>
          <h2 className="font-serif text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
            Selecionar Categoria ({categories.length})
          </h2>
          <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-0.5">
            Clique na categoria que deseja modificar
          </p>
        </div>

        {/* Busca rápida */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-texto-claro dark:text-[#988087] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar categorias..."
            className="w-full pl-8 pr-3 py-1.5 bg-fundo/50 dark:bg-[#151012] border border-borda dark:border-[#38262C] rounded-xl text-xs text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder:text-[#988087]/70 focus:outline-none focus:ring-1 focus:ring-primaria focus:bg-white dark:focus:bg-[#1E1518] transition-all"
          />
        </div>

        {/* Lista de Categorias */}
        <div className="max-h-[500px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-primaria/20 pr-1">
          {filteredList.map((cat) => {
            const isSelected = cat.id === selectedId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center justify-between group",
                  isSelected
                    ? "bg-primaria text-white shadow-2xs font-semibold"
                    : "bg-fundo/40 dark:bg-[#151012] hover:bg-fundo dark:hover:bg-[#251A1E] text-texto-escuro dark:text-[#F8EFF1] border border-borda/60 dark:border-[#38262C]/60"
                )}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs truncate font-medium">{cat.name}</p>
                  <p
                    className={cn(
                      "text-[10px] font-mono",
                      isSelected ? "text-white/80" : "text-texto-claro dark:text-[#988087]"
                    )}
                  >
                    /{cat.slug} &bull; {cat.productCount} un.
                  </p>
                </div>
                <ArrowRight
                  className={cn(
                    "w-3.5 h-3.5 shrink-0 transition-transform",
                    isSelected ? "translate-x-0.5 text-white" : "text-texto-claro/50 dark:text-[#988087]/50"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Coluna Central: Formulário de Edição */}
      <div className="lg:col-span-8 bg-white dark:bg-[#1E1518] p-6 sm:p-8 rounded-2xl border border-borda dark:border-[#38262C] shadow-xs space-y-6">
        {selectedCategory ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borda/60 dark:border-[#38262C]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Editando: {selectedCategory.name}
                  </h3>
                  <p className="text-xs text-texto-claro dark:text-[#988087]">
                    Atualize os dados e configurações do departamento
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-mono">
                  {selectedCategory.productCount} produtos vinculados
                </Badge>
                <Link
                  href={`/produtos?categoria=${selectedCategory.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl text-texto-claro dark:text-[#988087] hover:text-primaria hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors"
                  title="Ver na loja pública"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {feedback && (
              <div
                role="status"
                className={cn(
                  "p-4 rounded-xl text-xs flex items-center gap-2.5 font-semibold animate-in fade-in",
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

            <form onSubmit={handleUpdate} className="space-y-5 text-xs">
              {/* Nome */}
              <div>
                <label className="block font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
                  Nome da Categoria *
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
                  Slug (URL Amigável) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-fundo dark:bg-[#251A1E] border border-r-0 border-borda dark:border-[#38262C] rounded-l-xl text-xs text-texto-claro dark:text-[#988087] font-mono">
                    /categoria/
                  </span>
                  <Input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="text-xs h-10 rounded-l-none font-mono"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
                  Descrição do Departamento
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Descrição da categoria..."
                  className="w-full rounded-xl border border-borda dark:border-[#38262C] p-3 text-xs bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] focus:outline-none focus:ring-1 focus:ring-primaria resize-none transition-all"
                />
              </div>

              {/* Ordem e Visibilidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-borda/40 dark:border-[#38262C]/40">
                <div>
                  <label className="block font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
                    Ordem de Exibição
                  </label>
                  <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    min={0}
                    className="text-xs h-10 font-mono"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <label className="font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-2">
                    Visibilidade
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-borda dark:border-[#38262C] text-primaria focus:ring-primaria w-4 h-4 accent-primaria"
                    />
                    <span className="text-xs text-texto-escuro dark:text-[#F8EFF1] font-medium">
                      Categoria ativa e visível no site
                    </span>
                  </label>
                </div>
              </div>

              {/* Botões Salvar & Excluir */}
              <div className="pt-4 flex items-center justify-between border-t border-borda/60 dark:border-[#38262C]/60">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDeleting || selectedCategory.productCount > 0}
                  onClick={handleDelete}
                  className="text-erro border-erro/30 hover:bg-erro/10 text-xs gap-1.5"
                  title={
                    selectedCategory.productCount > 0
                      ? "Não é possível excluir categoria com produtos vinculados"
                      : "Excluir categoria"
                  }
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Excluir</span>
                </Button>

                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/categorias"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors"
                  >
                    Voltar
                  </Link>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="text-xs font-semibold gap-2 shadow-xs min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="p-12 text-center text-texto-claro dark:text-[#988087] space-y-2">
            <Layers className="w-8 h-8 text-primaria/30 mx-auto" />
            <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">Nenhuma categoria selecionada</p>
            <p className="text-xs">Selecione uma categoria ao lado para editar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
