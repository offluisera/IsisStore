"use client";

import * as React from "react";
import { Check, AlertCircle } from "lucide-react";
import { getColorHex } from "@/components/admin/product-variants-manager";

interface ProductVariantSelectorProps {
  hasSizes?: boolean;
  sizes?: string[];
  selectedSize?: string;
  onSelectSize: (size: string) => void;
  hasColors?: boolean;
  colors?: string[];
  selectedColor?: string;
  onSelectColor: (color: string) => void;
  sizeError?: boolean;
  colorError?: boolean;
}

export function ProductVariantSelector({
  hasSizes = false,
  sizes = [],
  selectedSize,
  onSelectSize,
  hasColors = false,
  colors = [],
  selectedColor,
  onSelectColor,
  sizeError = false,
  colorError = false,
}: ProductVariantSelectorProps) {
  const showSizes = hasSizes && sizes.length > 0;
  const showColors = hasColors && colors.length > 0;

  if (!showSizes && !showColors) return null;

  return (
    <div className="space-y-5 p-4 sm:p-5 rounded-2xl bg-fundo-card/90 dark:bg-[#1E1518] border border-borda dark:border-[#38262C] shadow-2xs">
      {/* SELETOR DE TAMANHO — ESTILO MERCADO LIVRE */}
      {showSizes && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-texto-medio dark:text-[#D4BFC5]">
              Tamanho:{" "}
              {selectedSize ? (
                <strong className="text-texto-escuro dark:text-[#F8EFF1] font-bold">
                  {selectedSize}
                </strong>
              ) : (
                <span className="text-texto-claro dark:text-[#988087] italic">
                  (Escolha uma opção)
                </span>
              )}
            </span>
            {sizeError && (
              <span className="text-[11px] font-semibold text-erro flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="w-3 h-3" />
                <span>Selecione o tamanho</span>
              </span>
            )}
          </div>

          <div
            className={`flex flex-wrap gap-2 p-1.5 rounded-xl transition-all ${
              sizeError
                ? "ring-2 ring-erro/40 bg-erro/5"
                : ""
            }`}
          >
            {sizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onSelectSize(sz)}
                  aria-pressed={isSelected}
                  className={`min-w-11 h-10 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? "border-primaria bg-primaria text-white shadow-xs scale-102"
                      : "border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] hover:border-primaria/70 hover:bg-fundo dark:hover:bg-[#251A1E]"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  <span>{sz}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SELETOR DE COR — ESTILO MERCADO LIVRE */}
      {showColors && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-texto-medio dark:text-[#D4BFC5]">
              Cor:{" "}
              {selectedColor ? (
                <strong className="text-texto-escuro dark:text-[#F8EFF1] font-bold">
                  {selectedColor}
                </strong>
              ) : (
                <span className="text-texto-claro dark:text-[#988087] italic">
                  (Escolha uma opção)
                </span>
              )}
            </span>
            {colorError && (
              <span className="text-[11px] font-semibold text-erro flex items-center gap-1 animate-in fade-in">
                <AlertCircle className="w-3 h-3" />
                <span>Selecione a cor</span>
              </span>
            )}
          </div>

          <div
            className={`flex flex-wrap gap-2 p-1.5 rounded-xl transition-all ${
              colorError
                ? "ring-2 ring-erro/40 bg-erro/5"
                : ""
            }`}
          >
            {colors.map((cl) => {
              const isSelected = selectedColor === cl;
              const hex = getColorHex(cl);
              return (
                <button
                  key={cl}
                  type="button"
                  onClick={() => onSelectColor(cl)}
                  aria-pressed={isSelected}
                  className={`h-10 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? "border-primaria bg-primaria-soft/60 dark:bg-primaria/20 text-primaria font-bold ring-2 ring-primaria/30 scale-102"
                      : "border-borda dark:border-[#38262C] bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] hover:border-primaria/70 hover:bg-fundo dark:hover:bg-[#251A1E]"
                  }`}
                >
                  {/* Swatch de cor */}
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shadow-2xs shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                    )}
                  </span>
                  <span>{cl}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
