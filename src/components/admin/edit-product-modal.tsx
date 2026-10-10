"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Edit3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  Coins,
  FileText,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-context";
import { updateProductDirectAction } from "@/features/admin/product-actions";
import { ProductGalleryEditor } from "@/components/admin/product-gallery-editor";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import type { CatalogCategory } from "@/services/catalog.service";

export interface EditableProduct {
  id: string;
  name: string;
  sku: string;
  category_id: string | null;
  price_cents: number;
  sale_price_cents: number | null;
  stock: number;
  status: "published" | "draft" | "archived";
  short_description: string | null;
  description: string | null;
  featured: boolean;
  has_sizes?: boolean;
  sizes?: string[];
  has_colors?: boolean;
  colors?: string[];
  categories?: { id?: string; name: string; slug?: string } | null;
  product_images?: Array<{
    id: string;
    public_url: string;
    is_primary?: boolean | null;
    sort_order?: number | null;
    storage_path?: string | null;
  }>;
}

interface EditProductModalProps {
  product: EditableProduct | null;
  isOpen: boolean;
  onClose: () => void;
  categories: CatalogCategory[];
  onSuccess?: () => void;
}

function formatCentsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  const num = cents / 100;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  categories,
  onSuccess,
}: EditProductModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [salePrice, setSalePrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [status, setStatus] = React.useState<"published" | "draft" | "archived">("published");
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [featured, setFeatured] = React.useState(false);
  const [hasSizes, setHasSizes] = React.useState(false);
  const [sizes, setSizes] = React.useState<string[]>([]);
  const [hasColors, setHasColors] = React.useState(false);
  const [colors, setColors] = React.useState<string[]>([]);

  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  // Atualizar valores do formulário quando o produto alvo mudar
  React.useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategoryId(product.category_id || "");
      setPrice(formatCentsToInput(product.price_cents));
      setSalePrice(formatCentsToInput(product.sale_price_cents));
      setStock(String(product.stock ?? 0));
      setStatus(product.status || "published");
      setShortDescription(product.short_description || "");
      setDescription(product.description || "");
      setFeatured(Boolean(product.featured));
      setHasSizes(Boolean(product.has_sizes));
      setSizes(Array.isArray(product.sizes) ? product.sizes : []);
      setHasColors(Boolean(product.has_colors));
      setColors(Array.isArray(product.colors) ? product.colors : []);
      setErrorMsg(null);
      setFieldErrors({});
    }
  }, [product]);

  // Fechar com tecla ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const res = await updateProductDirectAction({
        id: product.id,
        name: name.trim(),
        categoryId,
        price,
        salePrice: salePrice.trim() || undefined,
        stock,
        status,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        featured,
        hasSizes,
        sizes,
        hasColors,
        colors,
      });

      if (!res.success) {
        setErrorMsg(res.message || "Erro ao salvar alterações do produto.");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        toast.error("Falha na validação", res.message || "Verifique os dados informados.");
        return;
      }

      toast.success(
        "Produto atualizado!",
        status === "draft"
          ? `"${name}" foi marcado como rascunho e movido para a guia Rascunhos.`
          : `"${name}" salvo com sucesso.`
      );

      onClose();
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      setErrorMsg("Ocorreu um erro inesperado ao conectar com o servidor.");
      toast.error(
        "Erro no servidor",
        "Não foi possível salvar o produto. Tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#38262C] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="modal-edit-title"
                  className="font-serif text-lg font-semibold text-texto-escuro dark:text-[#F8EFF1]"
                >
                  Editar Produto
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-fundo dark:bg-[#251A1E] text-texto-claro dark:text-[#988087] border border-borda dark:border-[#38262C]">
                  {product.sku}
                </span>
              </div>
              <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
                Altere informações cadastrais, preços, estoque e visibilidade.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-texto-claro dark:text-[#988087] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors disabled:opacity-50"
            title="Fechar"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com scroll vertical suave */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-erro/10 border border-erro/20 text-erro text-xs leading-relaxed animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome do Produto */}
            <div className="sm:col-span-2">
              <Input
                label="Nome do Produto"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Caneca Cerâmica Ouro Rosado"
                isRequired
                error={fieldErrors.name?.[0]}
                disabled={isSaving}
              />
            </div>

            {/* Categoria */}
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="edit-category"
                className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1 select-none"
              >
                Categoria <span className="text-erro font-bold">*</span>
              </label>
              <select
                id="edit-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={isSaving}
                className="h-11 w-full rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] px-3.5 py-2 text-sm text-texto-escuro dark:text-[#F8EFF1] outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20 transition-all"
              >
                <option value="" className="dark:bg-[#151012] dark:text-[#F8EFF1]">
                  Selecione uma categoria...
                </option>
                {categories.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="dark:bg-[#151012] dark:text-[#F8EFF1]"
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId?.[0] && (
                <span className="text-xs font-medium text-erro">
                  {fieldErrors.categoryId[0]}
                </span>
              )}
            </div>

            {/* Estoque */}
            <Input
              label="Estoque Atual"
              name="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Ex: 15"
              isRequired
              error={fieldErrors.stock?.[0]}
              disabled={isSaving}
            />

            {/* Preço de Venda */}
            <Input
              label="Preço de Venda (R$)"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 149,90"
              isRequired
              helperText="Valor de venda principal"
              error={fieldErrors.price?.[0]}
              disabled={isSaving}
            />

            {/* Preço Promocional */}
            <Input
              label="Preço Promocional (R$ - Opcional)"
              name="salePrice"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Ex: 119,90"
              helperText="Deixe em branco para remover promoção"
              error={fieldErrors.salePrice?.[0]}
              disabled={isSaving}
            />

            {/* Visibilidade / Status */}
            <div className="sm:col-span-2 flex flex-col gap-2 p-4 rounded-xl bg-fundo/40 dark:bg-[#151012] border border-borda dark:border-[#38262C]">
              <label className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center justify-between">
                <span>Status &amp; Visibilidade na Loja</span>
                <span className="text-[11px] text-texto-claro dark:text-[#988087] font-normal">
                  Rascunhos vão para a guia de Rascunhos
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  disabled={isSaving}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    status === "published"
                      ? "border-primaria bg-primaria/10 dark:bg-primaria/15 text-texto-escuro dark:text-[#F8EFF1]"
                      : "border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#D4BFC5] hover:border-primaria/60"
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sucesso shrink-0" />
                    <span>Publicado</span>
                  </p>
                  <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-1">
                    Ativo na loja pública
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  disabled={isSaving}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    status === "draft"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-texto-escuro dark:text-[#F8EFF1]"
                      : "border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#D4BFC5] hover:border-amber-400"
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Rascunho</span>
                  </p>
                  <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-1">
                    Privado, guia Rascunhos
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("archived")}
                  disabled={isSaving}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    status === "archived"
                      ? "border-slate-500 bg-slate-100 dark:bg-slate-800/40 text-texto-escuro dark:text-[#F8EFF1]"
                      : "border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] text-texto-medio dark:text-[#D4BFC5] hover:border-slate-400"
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <span>Arquivado</span>
                  </p>
                  <p className="text-[11px] text-texto-claro dark:text-[#988087] mt-1">
                    Inativo e oculto
                  </p>
                </button>
              </div>

              {status === "draft" && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] mt-1 animate-in fade-in">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    Este produto NÃO será visível na loja pública e será listado exclusivamente na <strong>guia de Produtos &gt; Rascunhos</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Edição de Fotos do Produto (.webp) */}
            <div className="sm:col-span-2">
              <ProductGalleryEditor
                productId={product.id}
                productName={name || product.name}
                initialImages={product.product_images || []}
              />
            </div>

            {/* Gerenciamento de Variações: Tamanhos e Cores */}
            <div className="sm:col-span-2">
              <ProductVariantsManager
                hasSizes={hasSizes}
                onHasSizesChange={setHasSizes}
                sizes={sizes}
                onSizesChange={setSizes}
                hasColors={hasColors}
                onHasColorsChange={setHasColors}
                colors={colors}
                onColorsChange={setColors}
                renderHiddenInputs={false}
              />
            </div>

            {/* Resumo curto */}
            <div className="sm:col-span-2">
              <Input
                label="Breve Resumo (Máx 160 caracteres)"
                name="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Descrição curta para prévias e cards"
                error={fieldErrors.shortDescription?.[0]}
                disabled={isSaving}
              />
            </div>

            {/* Descrição Detalhada */}
            <div className="sm:col-span-2 flex flex-col gap-1.5 text-left">
              <label
                htmlFor="edit-description"
                className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] select-none"
              >
                Descrição Completa do Produto
              </label>
              <textarea
                id="edit-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre materiais, dimensões, cuidados e acabamentos especiais..."
                disabled={isSaving}
                className="w-full rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] p-3.5 text-sm text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20 resize-y transition-all"
              />
            </div>

            {/* Destaque */}
            <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="edit-featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-primaria focus:ring-primaria/20 accent-primaria"
              />
              <label
                htmlFor="edit-featured"
                className="text-xs font-medium text-texto-escuro dark:text-[#F8EFF1] select-none cursor-pointer"
              >
                Destacar este produto na vitrine principal da loja
              </label>
            </div>
          </div>

          {/* Footer de Ações */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-borda dark:border-[#38262C]">
            <Button
              type="button"
              variant="white"
              size="default"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="default"
              size="default"
              isLoading={isSaving}
              className="gap-2 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
