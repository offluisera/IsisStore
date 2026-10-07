"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  X,
  Type,
  ImageIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";
import { uploadCustomizationImageAction } from "@/features/products/actions";
import type { ProductCustomization } from "@/features/cart/types";

interface ProductCustomizationBoxProps {
  customization: ProductCustomization;
  onChange: (customization: ProductCustomization) => void;
  hasError?: boolean;
}

export function ProductCustomizationBox({
  customization,
  onChange,
  hasError = false,
}: ProductCustomizationBoxProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...customization,
      text: e.target.value,
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...customization,
      notes: e.target.value,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadCustomizationImageAction(formData);

      if (res.success && res.publicUrl) {
        onChange({
          ...customization,
          imageUrl: res.publicUrl,
        });
      } else {
        setUploadError(res.message || "Erro ao enviar imagem.");
      }
    } catch {
      setUploadError("Falha na comunicação com o servidor.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange({
      ...customization,
      imageUrl: undefined,
    });
    setUploadError(null);
  };

  const hasAnyInput = Boolean(
    (customization.text && customization.text.trim().length > 0) ||
      customization.imageUrl
  );

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        hasError && !hasAnyInput
          ? "border-red-400 bg-red-50/40 dark:bg-red-950/30 dark:border-red-900/60 shadow-xs ring-2 ring-red-300/40 dark:ring-red-900/40"
          : "border-primaria/30 dark:border-primaria/40 bg-gradient-to-b from-[#FFF9FA] to-fundo-card dark:from-[#25181E] dark:to-[#181114] shadow-xs"
      }`}
    >
      {/* Cabeçalho de Personalização */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center shrink-0 border border-primaria/20 dark:border-primaria/30">
            <Sparkles className="w-4 h-4 text-primaria animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-2">
              <span>Personalize seu produto</span>
              <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full bg-primaria text-white font-sans font-semibold">
                Sob Medida
              </span>
            </h3>
            <p className="text-xs text-texto-claro dark:text-[#C5B0B6] mt-0.5">
              Insira o nome, frase ou anexe uma foto/referência para gravação.
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de campo obrigatório se tentou submeter vazio */}
      {hasError && !hasAnyInput && (
        <div className="mb-4 p-3 rounded-xl bg-red-100/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>
            Por favor, <strong>digite um nome/frase</strong> ou{" "}
            <strong>anexe uma imagem</strong> para personalização antes de
            continuar.
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Campo 1: Nome, Frase ou Iniciais */}
        <div>
          <label
            htmlFor="custom-text"
            className="flex items-center justify-between text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5"
          >
            <span className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-primaria" />
              <span>Nome, Frase, Iniciais ou Data para Gravação:</span>
            </span>
            <span className="text-[11px] font-normal text-texto-claro dark:text-[#A8949A] font-mono">
              {(customization.text || "").length}/100
            </span>
          </label>
          <input
            id="custom-text"
            type="text"
            maxLength={100}
            value={customization.text || ""}
            onChange={handleTextChange}
            placeholder="Ex: Maria Clara & Lucas • 14.02.2024 • Amor Eterno"
            className="w-full h-11 px-3.5 rounded-xl border border-borda dark:border-[#3E2931] bg-white dark:bg-[#1E1418] text-xs sm:text-sm text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder-[#8C747C] focus:outline-none focus:ring-2 focus:ring-primaria/30 focus:border-primaria transition-all"
          />
        </div>

        {/* Campo 2: Imagem ou Foto de Referência */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primaria" />
              <span>Foto, Desenho ou Imagem de Referência:</span>
            </span>
            <span className="text-[10px] font-normal text-texto-claro dark:text-[#A8949A]">
              JPG, PNG ou WEBP (máx. 5MB)
            </span>
          </label>

          {customization.imageUrl ? (
            /* Imagem Já Anexada */
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#1E1418] border border-primaria/30 dark:border-primaria/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-borda dark:border-[#3E2931] bg-fundo dark:bg-[#25181E] shrink-0">
                  <Image
                    src={customization.imageUrl}
                    alt="Foto de personalização"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] flex items-center gap-1 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sucesso shrink-0" />
                    <span>Imagem anexada com sucesso</span>
                  </p>
                  <a
                    href={customization.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primaria hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Visualizar imagem original</span>
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg text-texto-claro dark:text-[#A8949A] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Remover imagem"
                aria-label="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Botão de Upload / Dropzone */
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleFileUpload}
                className="hidden"
                id="custom-file-upload"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 px-4 rounded-xl border border-dashed text-xs flex items-center justify-center gap-2.5 transition-all ${
                  isUploading
                    ? "bg-fundo dark:bg-[#1E1418] border-borda dark:border-[#3E2931] text-texto-claro dark:text-[#A8949A] cursor-not-allowed"
                    : "bg-white dark:bg-[#1E1418] hover:bg-primaria-soft/40 dark:hover:bg-[#2A1B22] border-borda dark:border-[#3E2931] hover:border-primaria dark:hover:border-primaria text-texto-medio dark:text-[#D1BFC4] hover:text-primaria cursor-pointer"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primaria" />
                    <span>Enviando e validando imagem...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-primaria shrink-0" />
                    <span>Clique aqui para anexar uma foto ou modelo</span>
                  </>
                )}
              </button>

              {uploadError && (
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Campo 3: Observações Adicionais */}
        <div>
          <label
            htmlFor="custom-notes"
            className="flex items-center gap-1.5 text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] mb-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-texto-claro dark:text-[#A8949A]" />
            <span>Instruções adicionais de gravação (opcional):</span>
          </label>
          <input
            id="custom-notes"
            type="text"
            maxLength={150}
            value={customization.notes || ""}
            onChange={handleNotesChange}
            placeholder="Ex: Letra cursiva, gravação no verso, com desenho de coração"
            className="w-full h-10 px-3.5 rounded-xl border border-borda dark:border-[#3E2931] bg-white dark:bg-[#1E1418] text-xs text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro/70 dark:placeholder-[#8C747C] focus:outline-none focus:ring-2 focus:ring-primaria/30 focus:border-primaria transition-all"
          />
        </div>

        {/* Live Preview da Personalização */}
        {hasAnyInput && (
          <div className="mt-3 p-3.5 rounded-xl bg-white/90 dark:bg-[#1E1418] border border-primaria/20 dark:border-primaria/30 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-primaria mb-1.5 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Prévia da Gravação Solicitada</span>
              </span>
              <span className="text-[10px] text-sucesso font-normal">
                ✓ Pronto para confeccionar
              </span>
            </div>

            <div className="space-y-1 text-xs">
              {customization.text && (
                <p className="text-texto-escuro dark:text-[#F8EFF1] font-serif italic text-sm font-semibold bg-primaria-soft/30 dark:bg-primaria/15 px-2.5 py-1 rounded-lg border border-primaria/10 dark:border-primaria/25">
                  &ldquo;{customization.text}&rdquo;
                </p>
              )}
              {customization.imageUrl && (
                <p className="text-[11px] text-texto-medio dark:text-[#D1BFC4] flex items-center gap-1">
                  <span>📷 Referência:</span>
                  <span className="text-primaria font-medium truncate">
                    Foto anexada para reprodução
                  </span>
                </p>
              )}
              {customization.notes && (
                <p className="text-[11px] text-texto-claro dark:text-[#B59FA6]">
                  <strong>Obs:</strong> {customization.notes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
