"use client";

import * as React from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  Check,
  Loader2,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-context";
import { convertBatchToWebP } from "@/lib/images/convert-to-webp";
import {
  uploadProductImagesAction,
  deleteProductImageAction,
  setPrimaryProductImageAction,
} from "@/features/admin/actions";
import type { ProductImageItem } from "@/components/admin/product-image-manager";

interface ProductGalleryEditorProps {
  productId: string;
  productName: string;
  initialImages?: ProductImageItem[];
  onImagesChange?: (images: ProductImageItem[]) => void;
}

export function ProductGalleryEditor({
  productId,
  productName,
  initialImages = [],
  onImagesChange,
}: ProductGalleryEditorProps) {
  const { toast } = useToast();
  const [images, setImages] = React.useState<ProductImageItem[]>(initialImages);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStatus, setProcessingStatus] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  // Upload e conversão automática para .webp
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setIsProcessing(true);

    try {
      setProcessingStatus(`Convertendo ${files.length} foto(s) para .webp...`);
      const webpFiles = await convertBatchToWebP(files, {
        quality: 0.88,
        maxWidth: 2000,
        maxHeight: 2000,
      });

      setProcessingStatus(`Enviando ${webpFiles.length} foto(s) .webp...`);
      const formData = new FormData();
      formData.append("productId", productId);

      for (const webpFile of webpFiles) {
        formData.append("files", webpFile);
      }

      const res = await uploadProductImagesAction(formData);

      if (res.success) {
        toast.success(
          "Fotos adicionadas!",
          `${webpFiles.length} imagem(ns) adicionada(s) à galeria do produto.`
        );

        if (res.uploadedUrls) {
          const newItems: ProductImageItem[] = res.uploadedUrls.map((url, i) => ({
            id: `img-${Date.now()}-${i}`,
            public_url: url,
            is_primary: images.length === 0 && i === 0,
          }));
          const updated = [...images, ...newItems];
          setImages(updated);
          onImagesChange?.(updated);
        }
      } else {
        toast.error("Erro no upload", res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao converter imagens.";
      toast.error("Falha na conversão", msg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Definir foto principal (Capa)
  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await setPrimaryProductImageAction(imageId, productId);
      if (res.success) {
        const updated = images.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }));
        setImages(updated);
        onImagesChange?.(updated);
        toast.success("Capa atualizada", "Foto principal do produto alterada com sucesso.");
      } else {
        toast.error("Erro", res.message);
      }
    } catch {
      toast.error("Erro", "Não foi possível alterar a foto principal.");
    }
  };

  // Excluir foto
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Deseja realmente remover esta foto do produto?")) return;

    try {
      const res = await deleteProductImageAction(imageId, productId);
      if (res.success) {
        const updated = images.filter((img) => img.id !== imageId);
        setImages(updated);
        onImagesChange?.(updated);
        toast.success("Foto removida", "A foto foi excluída do produto.");
      } else {
        toast.error("Erro", res.message);
      }
    } catch {
      toast.error("Erro", "Não foi possível excluir a imagem.");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-fundo/40 dark:bg-[#151012] border border-borda dark:border-[#38262C]">
      {/* Cabeçalho da Seção de Fotos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primaria" />
          <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
            Fotos do Produto (.webp)
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-[#251A1E] text-texto-medio dark:text-[#D4BFC5] border border-borda dark:border-[#38262C]">
            {images.length} {images.length === 1 ? "foto" : "fotos"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primaria text-white text-xs font-semibold hover:bg-primaria-hover transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{processingStatus || "Processando..."}</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Fotos</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
          disabled={isProcessing}
        />
      </div>

      {/* Grid de Fotos Existentes */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {images.map((img) => {
            const isPrimary = Boolean(img.is_primary);
            return (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden border border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] shadow-2xs flex flex-col"
              >
                <div className="relative aspect-square w-full bg-fundo dark:bg-[#251A1E] overflow-hidden">
                  <Image
                    src={img.public_url}
                    alt={productName || "Foto do produto"}
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
                <div className="p-1.5 flex items-center justify-between border-t border-borda/60 dark:border-[#38262C]/60 bg-white dark:bg-[#1E1518]">
                  {!isPrimary ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      className="text-[10px] text-texto-medio dark:text-[#D4BFC5] hover:text-primaria font-medium flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors cursor-pointer"
                      title="Definir esta imagem como capa do produto"
                    >
                      <Star className="w-3 h-3" />
                      <span>Capa</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-sucesso font-semibold flex items-center gap-1 px-1.5 py-0.5">
                      <Check className="w-3 h-3" />
                      <span>Principal</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-1 text-texto-claro dark:text-[#988087] hover:text-erro hover:bg-erro/10 rounded transition-colors cursor-pointer"
                    title="Excluir esta foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-borda dark:border-[#38262C] hover:border-primaria bg-white dark:bg-[#1E1518] hover:bg-primaria-soft/10 rounded-xl p-5 text-center cursor-pointer transition-colors"
        >
          <div className="flex flex-col items-center justify-center gap-1.5">
            <Upload className="w-5 h-5 text-primaria" />
            <p className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1]">
              Nenhuma foto cadastrada ainda
            </p>
            <p className="text-[11px] text-texto-claro dark:text-[#988087]">
              Clique para selecionar fotos do seu computador (conversão automática para .webp)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
