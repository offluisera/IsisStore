"use client";

import * as React from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  X,
  Check,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-context";
import { convertBatchToWebP } from "@/lib/images/convert-to-webp";
import {
  uploadProductImagesAction,
  deleteProductImageAction,
  setPrimaryProductImageAction,
} from "@/features/admin/actions";

export interface ProductImageItem {
  id: string;
  public_url: string;
  is_primary?: boolean | null;
  sort_order?: number | null;
  storage_path?: string | null;
}

interface ProductImageManagerProps {
  productId: string;
  productName: string;
  productSlug: string;
  initialImages?: ProductImageItem[];
}

export function ProductImageManager({
  productId,
  productName,
  productSlug,
  initialImages = [],
}: ProductImageManagerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [images, setImages] = React.useState<ProductImageItem[]>(initialImages);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStatus, setProcessingStatus] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const modalFileInputRef = React.useRef<HTMLInputElement>(null);

  // Função centralizada de processamento e upload de fotos
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setIsProcessing(true);

    try {
      // 1. Conversão client-side para .webp
      setProcessingStatus(`Convertendo ${files.length} imagem(ns) para .webp...`);
      const webpFiles = await convertBatchToWebP(files, {
        quality: 0.88,
        maxWidth: 2000,
        maxHeight: 2000,
      });

      // 2. Envio via Server Action
      setProcessingStatus(`Enviando ${webpFiles.length} foto(s) .webp para o catálogo...`);
      const formData = new FormData();
      formData.append("productId", productId);

      for (const webpFile of webpFiles) {
        formData.append("files", webpFile);
      }

      const res = await uploadProductImagesAction(formData);

      if (res.success) {
        toast.success(
          "Fotos adicionadas!",
          `${webpFiles.length} imagem(ns) convertida(s) para .webp e vinculada(s) ao produto.`
        );

        if (res.uploadedUrls) {
          const newItems: ProductImageItem[] = res.uploadedUrls.map((url, i) => ({
            id: `temp-${Date.now()}-${i}`,
            public_url: url,
            is_primary: images.length === 0 && i === 0,
          }));
          setImages((prev) => [...prev, ...newItems]);
        }
      } else {
        toast.error("Erro no upload", res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao converter imagens.";
      toast.error("Falha na conversão", msg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (modalFileInputRef.current) modalFileInputRef.current.value = "";
    }
  };

  // Definir como imagem principal
  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await setPrimaryProductImageAction(imageId, productId);
      if (res.success) {
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          }))
        );
        toast.success("Foto principal atualizada", "A imagem selecionada agora é a capa do produto.");
      } else {
        toast.error("Erro", res.message);
      }
    } catch {
      toast.error("Erro", "Não foi possível definir como imagem principal.");
    }
  };

  // Excluir imagem
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta foto do produto?")) return;

    try {
      const res = await deleteProductImageAction(imageId, productId);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        toast.success("Imagem removida", "A foto foi excluída do produto e do armazenamento.");
      } else {
        toast.error("Erro", res.message);
      }
    } catch {
      toast.error("Erro", "Não foi possível remover a imagem.");
    }
  };

  return (
    <>
      {/* Botões Compactos na Linha da Tabela do Admin */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Input escondido para seleção direta do PC */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
          disabled={isProcessing}
        />

        {/* Botão da Galeria com contagem de fotos */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-medio dark:text-[#D4BFC5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:border-primaria text-xs font-medium transition-colors cursor-pointer"
          title="Ver e gerenciar todas as fotos deste produto"
        >
          <ImageIcon className="w-3.5 h-3.5 text-primaria" />
          <span>{images.length} {images.length === 1 ? "foto" : "fotos"}</span>
        </button>

        {/* Botão rápido: Adicionar do PC (+ icon) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-7 h-7 flex items-center justify-center rounded-xl border border-primaria/40 bg-primaria-soft text-primaria hover:bg-primaria hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
          title="Adicionar novas fotos do computador"
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Modal Completo de Gestão de Imagens */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-texto-escuro/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#38262C] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-borda dark:border-[#38262C] flex items-center justify-between bg-fundo/40 dark:bg-[#151012]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center border border-primaria/20">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-texto-escuro dark:text-[#F8EFF1]">
                    Fotos do Produto
                  </h3>
                  <p className="text-xs text-texto-claro dark:text-[#988087] truncate max-w-sm sm:max-w-md">
                    {productName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-texto-claro dark:text-[#988087] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Status de processamento ativo */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-primaria-soft border border-primaria/20 flex items-center gap-3 text-xs text-primaria font-semibold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{processingStatus}</span>
                </div>
              )}

              {/* Área de Dropzone / Seleção do PC */}
              <div
                onClick={() => modalFileInputRef.current?.click()}
                className="border-2 border-dashed border-borda dark:border-[#38262C] hover:border-primaria bg-fundo/40 dark:bg-[#151012] hover:bg-primaria-soft/20 dark:hover:bg-primaria/10 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
              >
                <input
                  ref={modalFileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  disabled={isProcessing}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#251A1E] border border-borda dark:border-[#38262C] flex items-center justify-center text-primaria group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-texto-escuro dark:text-[#F8EFF1]">
                      Clique para selecionar imagens do seu computador
                    </p>
                    <p className="text-xs text-texto-claro dark:text-[#988087] mt-1">
                      Selecione várias de uma só vez (PNG, JPG, WEBP). Elas serão convertidas automaticamente para <strong>.webp</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de Imagens Existentes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-texto-escuro dark:text-[#F8EFF1]">
                    Imagens Vinculadas ({images.length})
                  </h4>
                  <a
                    href={`/produtos/${productSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primaria hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <span>Ver na Página do Produto</span>
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                </div>

                {images.length === 0 ? (
                  <div className="py-8 text-center text-xs text-texto-claro dark:text-[#988087] bg-fundo dark:bg-[#151012] rounded-2xl border border-borda dark:border-[#38262C]">
                    Nenhuma foto adicionada ainda. Selecione fotos acima para exibir no catálogo.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img, index) => {
                      const isPrimary = img.is_primary || index === 0;
                      return (
                        <div
                          key={img.id}
                          className="relative group rounded-2xl overflow-hidden border border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] shadow-xs flex flex-col"
                        >
                          <div className="relative aspect-square w-full bg-fundo dark:bg-[#251A1E] overflow-hidden">
                            <Image
                              src={img.public_url}
                              alt={`${productName} foto ${index + 1}`}
                              fill
                              className="object-cover"
                            />

                            {/* Badge de Imagem Principal */}
                            {isPrimary && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-primaria text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                <span>Capa</span>
                              </div>
                            )}

                            {/* Formato WebP badge */}
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono font-bold backdrop-blur-xs">
                              WEBP
                            </div>
                          </div>

                          {/* Ações da Foto */}
                          <div className="p-2 flex items-center justify-between gap-1 border-t border-borda/60 dark:border-[#38262C]/60 bg-white dark:bg-[#1E1518]">
                            {!isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(img.id)}
                                className="text-[11px] text-texto-medio dark:text-[#D4BFC5] hover:text-primaria font-medium flex items-center gap-1 px-1.5 py-1 rounded hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors cursor-pointer"
                                title="Definir esta foto como imagem principal"
                              >
                                <Star className="w-3.5 h-3.5" />
                                <span>Definir capa</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-sucesso font-semibold flex items-center gap-1 px-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Foto principal</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="p-1.5 text-texto-claro dark:text-[#988087] hover:text-erro hover:bg-erro/10 rounded-lg transition-colors cursor-pointer"
                              title="Excluir imagem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-borda dark:border-[#38262C] bg-fundo/40 dark:bg-[#151012] flex items-center justify-between">
              <span className="text-xs text-texto-claro dark:text-[#988087]">
                As fotos adicionadas refletem automaticamente na página do produto.
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="font-semibold"
              >
                Concluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
