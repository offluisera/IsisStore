"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-context";
import { updateProductDirectAction } from "@/features/admin/product-actions";
import { ProductGalleryEditor } from "@/components/admin/product-gallery-editor";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import type { EditableProduct } from "@/components/admin/edit-product-modal";
import type { CatalogCategory } from "@/services/catalog.service";

interface EditProductFormProps {
  product: EditableProduct;
  categories: CatalogCategory[];
}

function formatCentsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  const num = cents / 100;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function EditProductForm({
  product,
  categories,
}: EditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = React.useState(product.name || "");
  const [categoryId, setCategoryId] = React.useState(product.category_id || "");
  const [price, setPrice] = React.useState(formatCentsToInput(product.price_cents));
  const [salePrice, setSalePrice] = React.useState(formatCentsToInput(product.sale_price_cents));
  const [stock, setStock] = React.useState(String(product.stock ?? 0));
  const [status, setStatus] = React.useState<"published" | "draft" | "archived">(
    product.status || "published"
  );
  const [shortDescription, setShortDescription] = React.useState(
    product.short_description || ""
  );
  const [description, setDescription] = React.useState(product.description || "");
  const [featured, setFeatured] = React.useState(Boolean(product.featured));
  const [hasSizes, setHasSizes] = React.useState(Boolean(product.has_sizes));
  const [sizes, setSizes] = React.useState<string[]>(
    Array.isArray(product.sizes) ? product.sizes : []
  );
  const [hasColors, setHasColors] = React.useState(Boolean(product.has_colors));
  const [colors, setColors] = React.useState<string[]>(
    Array.isArray(product.colors) ? product.colors : []
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

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
        setErrorMsg(res.message || "Erro ao salvar alterações.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        toast.error("Falha na validação", res.message || "Verifique os dados informados.");
        return;
      }

      toast.success(
        "Produto salvo com sucesso!",
        status === "draft"
          ? `"${name}" foi salvo como rascunho e movido para a guia Rascunhos.`
          : `"${name}" atualizado e disponível na loja pública.`
      );

      if (status === "draft") {
        router.push("/admin/produtos/rascunhos");
      } else {
        router.push("/admin/produtos");
      }
      router.refresh();
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
      setErrorMsg("Ocorreu um erro inesperado ao conectar com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-xl bg-erro/10 border border-erro/20 text-erro text-xs leading-relaxed animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nome do Produto */}
        <div className="md:col-span-2">
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
            htmlFor="categoryId"
            className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1 select-none"
          >
            Categoria <span className="text-erro font-bold">*</span>
          </label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={isSaving}
            className="h-11 w-full rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] px-3.5 py-2 text-sm text-texto-escuro dark:text-[#F8EFF1] outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20"
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
          placeholder="Ex: 20"
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
          helperText="Informe o valor em Reais com vírgula"
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
          helperText="Deixe em branco se não houver desconto"
          error={fieldErrors.salePrice?.[0]}
          disabled={isSaving}
        />

        {/* Status e Visibilidade */}
        <div className="md:col-span-2 flex flex-col gap-2.5 p-4 rounded-2xl bg-fundo/40 dark:bg-[#151012] border border-borda dark:border-[#38262C]">
          <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Visibilidade e Status do Produto
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                status === "published"
                  ? "border-primaria bg-primaria/5 dark:bg-primaria/10"
                  : "border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518]"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={() => setStatus("published")}
                className="mt-0.5 text-primaria accent-primaria"
              />
              <div className="text-xs">
                <span className="font-semibold text-texto-escuro dark:text-[#F8EFF1] block">
                  Publicado
                </span>
                <span className="text-texto-claro dark:text-[#988087] text-[11px] leading-tight block mt-0.5">
                  Ativo e visível para compra na loja pública.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                status === "draft"
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                  : "border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518]"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={() => setStatus("draft")}
                className="mt-0.5 text-amber-600 accent-amber-600"
              />
              <div className="text-xs">
                <span className="font-semibold text-amber-800 dark:text-amber-300 block">
                  Rascunho
                </span>
                <span className="text-texto-claro dark:text-[#988087] text-[11px] leading-tight block mt-0.5">
                  Privado na guia Rascunhos. Não visível na loja.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                status === "archived"
                  ? "border-slate-500 bg-slate-100 dark:bg-slate-800/30"
                  : "border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518]"
              }`}
            >
              <input
                type="radio"
                name="status"
                value="archived"
                checked={status === "archived"}
                onChange={() => setStatus("archived")}
                className="mt-0.5 text-slate-600 accent-slate-600"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Arquivado
                </span>
                <span className="text-texto-claro dark:text-[#988087] text-[11px] leading-tight block mt-0.5">
                  Desativado do catálogo e fora de circulação.
                </span>
              </div>
            </label>
          </div>

          {status === "draft" && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] animate-in fade-in">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Este item será salvo na <strong>guia de Produtos &gt; Rascunhos</strong> e não poderá ser visto por clientes.
              </span>
            </div>
          )}
        </div>

        {/* Galeria de Fotos */}
        <div className="md:col-span-2">
          <ProductGalleryEditor
            productId={product.id}
            productName={name || product.name}
            initialImages={product.product_images || []}
          />
        </div>

        {/* Gerenciamento de Variações: Tamanhos e Cores */}
        <div className="md:col-span-2">
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

        {/* Resumo */}
        <div className="md:col-span-2">
          <Input
            label="Breve Resumo (Máx 160 caracteres)"
            name="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Descrição curta que aparece nos cards e no início da página"
            error={fieldErrors.shortDescription?.[0]}
            disabled={isSaving}
          />
        </div>

        {/* Descrição Detalhada */}
        <div className="md:col-span-2 flex flex-col gap-1.5 text-left">
          <label
            htmlFor="description"
            className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] select-none"
          >
            Descrição Completa do Produto
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes sobre materiais, dimensões, cuidados e acabamentos especiais..."
            disabled={isSaving}
            className="w-full rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] p-3.5 text-sm text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20 resize-y"
          />
        </div>

        {/* Destaque */}
        <div className="md:col-span-2 flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            disabled={isSaving}
            className="h-4 w-4 rounded border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-primaria focus:ring-primaria/20 accent-primaria"
          />
          <label
            htmlFor="featured"
            className="text-xs font-medium text-texto-escuro dark:text-[#F8EFF1] select-none cursor-pointer"
          >
            Destacar este produto na vitrine principal da loja
          </label>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-borda dark:border-[#38262C]">
        <Link
          href={product.status === "draft" ? "/admin/produtos/rascunhos" : "/admin/produtos"}
          className={buttonVariants({ variant: "white", size: "default" })}
        >
          Cancelar
        </Link>
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
  );
}
