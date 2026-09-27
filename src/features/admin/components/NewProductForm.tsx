"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Plus } from "lucide-react";
import { createProductAction } from "@/features/admin/product-actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CatalogCategory } from "@/services/catalog.service";

interface NewProductFormProps {
  categories: CatalogCategory[];
}

export function NewProductForm({ categories }: NewProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.message && !state.success && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-xl bg-erro/10 border border-erro/20 text-erro text-xs leading-relaxed animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nome do Produto */}
        <div className="md:col-span-2">
          <Input
            label="Nome do Produto"
            name="name"
            placeholder="Ex: Caneca Cerâmica Ouro Rosado"
            isRequired
            error={state?.fieldErrors?.name?.[0]}
            disabled={isPending}
          />
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            htmlFor="categoryId"
            className="text-xs font-semibold text-texto-escuro flex items-center gap-1 select-none"
          >
            Categoria <span className="text-erro font-bold">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-borda bg-white px-3.5 py-2 text-sm text-texto-escuro outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20"
          >
            <option value="">Selecione uma categoria...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.categoryId?.[0] && (
            <span className="text-xs font-medium text-erro">
              {state.fieldErrors.categoryId[0]}
            </span>
          )}
        </div>

        {/* Estoque */}
        <Input
          label="Estoque Inicial"
          name="stock"
          type="number"
          placeholder="Ex: 20"
          isRequired
          error={state?.fieldErrors?.stock?.[0]}
          disabled={isPending}
        />

        {/* Preço de Venda */}
        <Input
          label="Preço de Venda (R$)"
          name="price"
          placeholder="Ex: 149,90"
          isRequired
          helperText="Informe o valor em Reais com vírgula"
          error={state?.fieldErrors?.price?.[0]}
          disabled={isPending}
        />

        {/* Preço Promocional */}
        <Input
          label="Preço Promocional (R$ - Opcional)"
          name="salePrice"
          placeholder="Ex: 119,90"
          helperText="Deixe em branco se não houver desconto"
          error={state?.fieldErrors?.salePrice?.[0]}
          disabled={isPending}
        />

        {/* URL da Imagem */}
        <div className="md:col-span-2">
          <Input
            label="URL da Imagem Principal"
            name="imageUrl"
            placeholder="Ex: /images/products/headphone-bluetooth-rosa-soft.jpg ou URL externa"
            helperText="Caminho relativo ou link HTTPS da foto do produto"
            error={state?.fieldErrors?.imageUrl?.[0]}
            disabled={isPending}
          />
        </div>

        {/* Resumo / Short Description */}
        <div className="md:col-span-2">
          <Input
            label="Breve Resumo (Máx 160 caracteres)"
            name="shortDescription"
            placeholder="Descrição curta que aparece nos cards e no início da página"
            error={state?.fieldErrors?.shortDescription?.[0]}
            disabled={isPending}
          />
        </div>

        {/* Descrição Detalhada */}
        <div className="md:col-span-2 flex flex-col gap-1.5 text-left">
          <label
            htmlFor="description"
            className="text-xs font-semibold text-texto-escuro select-none"
          >
            Descrição Completa do Produto
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Detalhes sobre materiais, dimensões, cuidados e acabamentos especiais..."
            disabled={isPending}
            className="w-full rounded-xl border border-borda bg-white p-3.5 text-sm text-texto-escuro placeholder:text-texto-claro outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20 resize-y"
          />
        </div>

        {/* Destaque */}
        <div className="md:col-span-2 flex items-center gap-2.5 pt-2">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            className="h-4 w-4 rounded border-borda text-primaria focus:ring-primaria/20 accent-primaria"
          />
          <label htmlFor="featured" className="text-xs font-medium text-texto-escuro select-none">
            Destacar este produto na vitrine principal da loja
          </label>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-borda">
        <Link
          href="/admin/produtos"
          className={buttonVariants({ variant: "white", size: "default" })}
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          variant="default"
          size="default"
          isLoading={isPending}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Produto</span>
        </Button>
      </div>
    </form>
  );
}
