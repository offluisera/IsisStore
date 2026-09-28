"use client";

import * as React from "react";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Plus,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { createProductAction } from "@/features/admin/product-actions";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { convertBatchToWebP } from "@/lib/images/convert-to-webp";
import type { CatalogCategory } from "@/services/catalog.service";

interface NewProductFormProps {
  categories: CatalogCategory[];
}

interface ConvertedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}

export function NewProductForm({ categories }: NewProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    null
  );

  const [convertedImages, setConvertedImages] = React.useState<ConvertedFileItem[]>([]);
  const [primaryIndex, setPrimaryIndex] = React.useState<number>(0);
  const [isConverting, setIsConverting] = React.useState(false);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Manipular seleção e conversão client-side para .webp
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const rawFiles = Array.from(fileList);
    setIsConverting(true);

    try {
      const webpFiles = await convertBatchToWebP(rawFiles, {
        quality: 0.88,
        maxWidth: 2000,
        maxHeight: 2000,
      });

      const newItems: ConvertedFileItem[] = webpFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }));

      setConvertedImages((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error("Erro ao converter imagens:", err);
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setConvertedImages((prev) => {
      const item = prev[indexToRemove];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== indexToRemove);
    });

    if (primaryIndex === indexToRemove) {
      setPrimaryIndex(0);
    } else if (primaryIndex > indexToRemove) {
      setPrimaryIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = (formData: FormData) => {
    // Adiciona arquivos convertidos para .webp
    formData.delete("files");
    for (const item of convertedImages) {
      formData.append("files", item.file);
    }
    formData.append("primaryIndex", String(primaryIndex));

    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
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

        {/* Upload de Fotos do PC com conversão .webp */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <label className="text-xs font-semibold text-texto-escuro flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-primaria" />
              <span>Fotos do Produto (Upload do Computador)</span>
            </span>
            <span className="text-[11px] text-texto-claro font-normal">
              Conversão automática para <strong>.webp</strong>
            </span>
          </label>

          {/* Área Dropzone / Botão de Seleção */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-borda hover:border-primaria bg-fundo/40 hover:bg-primaria-soft/20 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
              disabled={isPending || isConverting}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white border border-borda flex items-center justify-center text-primaria group-hover:scale-110 transition-transform shadow-xs">
                {isConverting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-texto-escuro">
                  {isConverting
                    ? "Convertendo imagens para .webp..."
                    : "Clique para selecionar fotos do seu computador"}
                </p>
                <p className="text-xs text-texto-claro mt-1">
                  Você pode selecionar várias fotos de uma só vez (PNG, JPG, WEBP, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Prévia das Imagens Convertidas */}
          {convertedImages.length > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs text-texto-medio">
                <span>{convertedImages.length} foto(s) pronta(s) para o produto:</span>
                <span className="text-[11px] text-texto-claro">
                  A foto marcada com estrela será a capa
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {convertedImages.map((img, index) => {
                  const isPrimary = index === primaryIndex;
                  return (
                    <div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden border border-borda bg-white shadow-xs flex flex-col"
                    >
                      <div className="relative aspect-square w-full bg-fundo overflow-hidden">
                        <Image
                          src={img.previewUrl}
                          alt={img.name}
                          fill
                          className="object-cover"
                        />

                        {/* Badge de Capa */}
                        {isPrimary && (
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-primaria text-white text-[9px] font-bold shadow-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Capa</span>
                          </div>
                        )}

                        <div className="absolute bottom-1.5 left-1.5 px-1 py-0.5 rounded bg-black/60 text-white text-[8px] font-mono font-bold">
                          WEBP
                        </div>
                      </div>

                      {/* Ações da Foto */}
                      <div className="p-1.5 flex items-center justify-between border-t border-borda/60 bg-white">
                        {!isPrimary ? (
                          <button
                            type="button"
                            onClick={() => setPrimaryIndex(index)}
                            className="text-[10px] text-texto-medio hover:text-primaria font-medium flex items-center gap-1 px-1 py-0.5 rounded hover:bg-fundo transition-colors cursor-pointer"
                            title="Definir esta foto como imagem principal"
                          >
                            <Star className="w-3 h-3" />
                            <span>Capa</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-sucesso font-semibold flex items-center gap-1 px-1">
                            <Check className="w-3 h-3" />
                            <span>Principal</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1 text-texto-claro hover:text-erro hover:bg-erro/10 rounded transition-colors cursor-pointer"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toggle para URL Externa (Alternativa) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-primaria hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ou informar URL / link externo de imagem</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showUrlInput ? "rotate-180" : ""}`}
              />
            </button>

            {showUrlInput && (
              <div className="mt-2 animate-in fade-in">
                <Input
                  label="URL da Imagem Externa"
                  name="imageUrl"
                  placeholder="Ex: https://i.imgur.com/... ou link de imagem"
                  helperText="Utilize caso a imagem já esteja hospedada em um servidor remoto"
                  error={state?.fieldErrors?.imageUrl?.[0]}
                  disabled={isPending}
                />
              </div>
            )}
          </div>
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
          isLoading={isPending || isConverting}
          className="gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Produto</span>
        </Button>
      </div>
    </form>
  );
}
