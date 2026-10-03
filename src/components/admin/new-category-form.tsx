"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Eye,
} from "lucide-react";
import Link from "next/link";

export function NewCategoryForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isManualSlug, setIsManualSlug] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-gerar slug a partir do nome se não for manual
  React.useEffect(() => {
    if (!isManualSlug) {
      const generated = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  }, [name, isManualSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("name", name);
    if (slug.trim()) formData.append("slug", slug);
    if (description.trim()) formData.append("description", description);
    formData.append("sort_order", String(sortOrder));
    formData.append("is_active", String(isActive));

    try {
      const res = await createCategoryAction(formData);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => {
          router.push("/admin/categorias");
        }, 1200);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Formulário Principal */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-borda shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-borda/60">
          <div className="w-10 h-10 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-texto-escuro">
              Dados da Categoria
            </h2>
            <p className="text-xs text-texto-claro">
              Defina o nome, URL amigável e descrição para organizar produtos
            </p>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 font-semibold animate-in fade-in ${
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

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Nome */}
          <div>
            <label className="block font-semibold text-texto-escuro mb-1.5">
              Nome da Categoria *
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vestidos, Joias de Ouro, Calçados"
              className="text-xs h-10"
            />
            <p className="text-[11px] text-texto-claro mt-1">
              Nome público que será exibido no menu e nos filtros da vitrine.
            </p>
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-texto-escuro">
                Slug (URL Amigável) *
              </label>
              <button
                type="button"
                onClick={() => setIsManualSlug(!isManualSlug)}
                className="text-[10px] text-primaria hover:underline font-semibold"
              >
                {isManualSlug ? "Gerar automaticamente" : "Editar manualmente"}
              </button>
            </div>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-fundo border border-r-0 border-borda rounded-l-xl text-xs text-texto-claro font-mono">
                /categoria/
              </span>
              <Input
                type="text"
                required
                disabled={!isManualSlug}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vestidos-elegantes"
                className="text-xs h-10 rounded-l-none font-mono"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-semibold text-texto-escuro mb-1.5">
              Descrição do Departamento (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva esta linha para orientar os clientes e melhorar SEO..."
              rows={3}
              className="w-full rounded-xl border border-borda p-3 text-xs bg-white text-texto-escuro focus:outline-none focus:ring-1 focus:ring-primaria resize-none transition-all"
            />
          </div>

          {/* Ordem de Exibição e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-borda/40">
            <div>
              <label className="block font-semibold text-texto-escuro mb-1.5">
                Ordem de Exibição
              </label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={0}
                className="text-xs h-10 font-mono"
              />
              <p className="text-[10px] text-texto-claro mt-1">
                Menor número aparece primeiro no menu.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="font-semibold text-texto-escuro mb-2">
                Visibilidade
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-borda text-primaria focus:ring-primaria w-4 h-4 accent-primaria"
                />
                <span className="text-xs text-texto-escuro font-medium">
                  Categoria ativa e visível no site
                </span>
              </label>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-borda/60">
            <Link
              href="/admin/categorias"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-texto-medio hover:text-texto-escuro hover:bg-fundo transition-colors"
            >
              Cancelar
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
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Categoria</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Card de Pré-visualização Ao Vivo */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-borda shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borda/60">
            <Eye className="w-4 h-4 text-primaria" />
            <h3 className="font-serif text-sm font-bold text-texto-escuro">
              Pré-visualização na Loja
            </h3>
          </div>

          <p className="text-xs text-texto-claro">
            Veja como esta categoria será apresentada para os clientes da Isis Store:
          </p>

          {/* Demonstração da Pill de Categoria */}
          <div className="p-4 rounded-xl bg-fundo/50 border border-borda/60 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-texto-claro">
              Pill de Navegação
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-secundaria/35 text-texto-escuro font-semibold text-xs shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-primaria" />
              <span>{name.trim() || "Nome da Categoria"}</span>
            </div>
          </div>

          {/* Card Detalhado */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFF5F6] via-[#FDF2F4] to-[#FCEEF1] border border-secundaria/35 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primaria flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Departamento
              </span>
              <span className="text-[10px] font-mono text-texto-claro">
                /{slug || "slug-categoria"}
              </span>
            </div>
            <h4 className="font-serif text-base font-bold text-texto-escuro">
              {name.trim() || "Nova Categoria"}
            </h4>
            <p className="text-xs text-texto-claro/90 italic">
              {description.trim() || "A descrição da categoria será exibida aqui para seus clientes."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
