"use client";

import * as React from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = React.useState(initialCategories);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("name", name);
    if (description.trim()) {
      formData.append("description", description);
    }

    try {
      const res = await createCategoryAction(formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setName("");
        setDescription("");
        // O revalidatePath atualiza na próxima navegação, mas adicionamos no estado local para feedback instantâneo
        const tempSlug = name.toLowerCase().replace(/\s+/g, "-");
        setCategories((prev) => [
          ...prev,
          {
            id: `temp_${Date.now()}`,
            name,
            slug: tempSlug,
            description: description || null,
            productCount: 0,
          },
        ]);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Ocorreu uma falha ao cadastrar a categoria.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${catName}"?`)) {
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
      setFeedback({
        type: "error",
        message: "Erro ao excluir categoria.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Formulário de Nova Categoria */}
      <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-borda shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-borda/60">
          <div className="w-8 h-8 rounded-lg bg-primaria-soft text-primaria flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-texto-escuro">
              Nova Categoria
            </h2>
            <p className="text-[11px] text-texto-claro">
              Adicione departamentos ao catálogo
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-sucesso/10 text-sucesso border border-sucesso/20"
                : "bg-erro/10 text-erro border border-erro/20"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-texto-escuro mb-1">
              Nome da Categoria *
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vestidos, Joias, Calçados"
              className="text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-texto-escuro mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da linha de produtos..."
              rows={3}
              className="w-full rounded-xl border border-borda p-3 text-xs bg-white text-texto-escuro focus:outline-none focus:ring-1 focus:ring-primaria resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Categoria</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Lista de Categorias Cadastradas */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-borda shadow-xs overflow-hidden">
        <div className="p-5 border-b border-borda/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primaria" />
            <h2 className="font-serif text-sm font-bold text-texto-escuro">
              Categorias Existentes ({categories.length})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-borda/60 text-xs">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-fundo/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-texto-escuro text-sm">
                      {cat.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      /{cat.slug}
                    </Badge>
                    <span className="text-[11px] text-texto-claro font-medium">
                      ({cat.productCount} {cat.productCount === 1 ? "produto" : "produtos"})
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-texto-claro text-[11px] max-w-lg">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    disabled={deletingId === cat.id || cat.productCount > 0}
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 rounded-xl text-texto-claro hover:text-erro hover:bg-erro/10 disabled:opacity-20 transition-colors"
                    title={
                      cat.productCount > 0
                        ? "Não pode excluir categoria com produtos vinculados"
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
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-texto-claro">
              Nenhuma categoria cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
