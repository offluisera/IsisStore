"use client";

import * as React from "react";
import {
  Ruler,
  Palette,
  Plus,
  X,
  Check,
  Sparkles,
  HelpCircle,
  Tag,
} from "lucide-react";

interface ProductVariantsManagerProps {
  hasSizes: boolean;
  onHasSizesChange: (val: boolean) => void;
  sizes: string[];
  onSizesChange: (val: string[]) => void;
  hasColors: boolean;
  onHasColorsChange: (val: boolean) => void;
  colors: string[];
  onColorsChange: (val: string[]) => void;
  renderHiddenInputs?: boolean;
}

// Mapeamento de nomes de cores para CSS/Hex aproximado para preview visual
export const COLOR_SWATCH_MAP: Record<string, string> = {
  rosa: "#F472B6",
  "rosa choque": "#EC4899",
  rose: "#FB7185",
  "rosé": "#FB7185",
  dourado: "#EAB308",
  ouro: "#EAB308",
  prata: "#94A3B8",
  preto: "#18181B",
  branco: "#FFFFFF",
  azul: "#3B82F6",
  "azul marinho": "#1E3A8A",
  vermelho: "#EF4444",
  verde: "#10B981",
  "verde esmeralda": "#059669",
  amarelo: "#FBBF24",
  bege: "#F5F5DC",
  nude: "#E2C4B1",
  marrom: "#78350F",
  lilas: "#C084FC",
  "lilás": "#C084FC",
  roxo: "#9333EA",
  laranja: "#F97316",
  cinza: "#64748B",
  bronze: "#CD7F32",
};

export function getColorHex(colorName: string): string {
  const normalized = colorName.trim().toLowerCase();
  return COLOR_SWATCH_MAP[normalized] || "#CBD5E1";
}

export function ProductVariantsManager({
  hasSizes,
  onHasSizesChange,
  sizes,
  onSizesChange,
  hasColors,
  onHasColorsChange,
  colors,
  onColorsChange,
  renderHiddenInputs = true,
}: ProductVariantsManagerProps) {
  const [newSizeInput, setNewSizeInput] = React.useState("");
  const [newColorInput, setNewColorInput] = React.useState("");

  // Presets de tamanhos
  const sizePresets = [
    { label: "Roupas (P, M, G, GG)", items: ["P", "M", "G", "GG"] },
    { label: "Calçados (34 ao 39)", items: ["34", "35", "36", "37", "38", "39"] },
    { label: "Bebê (RN, P, M, G)", items: ["RN", "P", "M", "G"] },
    { label: "Tamanho Único", items: ["Único"] },
  ];

  // Presets de cores populares na loja
  const colorPresets = [
    "Dourado",
    "Prata",
    "Rosa",
    "Rosé",
    "Preto",
    "Branco",
    "Azul",
    "Vermelho",
    "Nude",
  ];

  const handleAddSize = (val?: string) => {
    const toAdd = (val ?? newSizeInput).trim();
    if (!toAdd) return;
    if (!sizes.includes(toAdd)) {
      onSizesChange([...sizes, toAdd]);
    }
    setNewSizeInput("");
  };

  const handleRemoveSize = (toRemove: string) => {
    onSizesChange(sizes.filter((s) => s !== toRemove));
  };

  const handleApplySizePreset = (presetItems: string[]) => {
    const merged = Array.from(new Set([...sizes, ...presetItems]));
    onSizesChange(merged);
  };

  const handleAddColor = (val?: string) => {
    const toAdd = (val ?? newColorInput).trim();
    if (!toAdd) return;
    // Normalizar capitalização inicial
    const formatted = toAdd.charAt(0).toUpperCase() + toAdd.slice(1);
    if (!colors.includes(formatted)) {
      onColorsChange([...colors, formatted]);
    }
    setNewColorInput("");
  };

  const handleRemoveColor = (toRemove: string) => {
    onColorsChange(colors.filter((c) => c !== toRemove));
  };

  return (
    <div className="space-y-6">
      {/* Inputs Hidden para submissão direta via formulário */}
      {renderHiddenInputs && (
        <>
          <input
            type="hidden"
            name="hasSizes"
            value={hasSizes ? "true" : "false"}
          />
          <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
          <input
            type="hidden"
            name="hasColors"
            value={hasColors ? "true" : "false"}
          />
          <input type="hidden" name="colors" value={JSON.stringify(colors)} />
        </>
      )}

      {/* SEÇÃO 1: TAMANHOS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1518] border border-borda dark:border-[#38262C] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primaria-soft dark:bg-[#251A1E] text-primaria flex items-center justify-center border border-primaria/20 shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
                Possui tamanhos variados?
              </h3>
              <p className="text-xs text-texto-claro dark:text-[#988087]">
                Ative se o produto puder ser comprado em tamanhos diferentes (ex: P, M, G ou 34, 36).
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={hasSizes}
            onClick={() => onHasSizesChange(!hasSizes)}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              hasSizes ? "bg-primaria" : "bg-borda dark:bg-[#38262C]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                hasSizes ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Painel expandido de tamanhos */}
        {hasSizes && (
          <div className="pt-4 border-t border-borda/60 dark:border-[#38262C]/60 space-y-4 animate-in fade-in duration-200">
            {/* Presets Rápidos */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-texto-claro dark:text-[#988087] block mb-2">
                Atalhos Rápidos:
              </span>
              <div className="flex flex-wrap gap-2">
                {sizePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySizePreset(preset.items)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-fundo/70 dark:bg-[#151012] border border-borda dark:border-[#38262C] text-texto-medio dark:text-[#D4BFC5] hover:border-primaria hover:text-primaria transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input para adicionar tamanho livre */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSize();
                  }
                }}
                placeholder="Ex: GG, 40, Único..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] outline-none focus:border-primaria"
              />
              <button
                type="button"
                onClick={() => handleAddSize()}
                className="px-4 py-2 rounded-xl bg-primaria text-white text-xs font-bold hover:bg-primaria-hover transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Chips de tamanhos ativos */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-texto-claro dark:text-[#988087] block mb-2">
                Tamanhos Adicionados ({sizes.length}):
              </span>
              {sizes.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                  Nenhum tamanho adicionado ainda. Insira pelo menos um tamanho para que os clientes possam selecionar na loja.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sz) => (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primaria/10 text-primaria border border-primaria/30 text-xs font-bold shadow-2xs animate-in zoom-in-95"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{sz}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(sz)}
                        className="hover:bg-primaria/20 rounded-full p-0.5 transition-colors cursor-pointer text-primaria ml-0.5"
                        title={`Remover tamanho ${sz}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SEÇÃO 2: CORES */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1518] border border-borda dark:border-[#38262C] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primaria-soft dark:bg-[#251A1E] text-primaria flex items-center justify-center border border-primaria/20 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-texto-escuro dark:text-[#F8EFF1]">
                Possui cores diferentes?
              </h3>
              <p className="text-xs text-texto-claro dark:text-[#988087]">
                Ative se o produto estiver disponível em cores variadas (estilo Mercado Livre).
              </p>
            </div>
          </div>

          {/* Switch Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={hasColors}
            onClick={() => onHasColorsChange(!hasColors)}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              hasColors ? "bg-primaria" : "bg-borda dark:border-[#38262C]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                hasColors ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Painel expandido de cores */}
        {hasColors && (
          <div className="pt-4 border-t border-borda/60 dark:border-[#38262C]/60 space-y-4 animate-in fade-in duration-200">
            {/* Presets Rápidos de Cores */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-texto-claro dark:text-[#988087] block mb-2">
                Cores Populares:
              </span>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((colorName) => {
                  const hex = getColorHex(colorName);
                  const isAlreadyAdded = colors.includes(colorName);
                  return (
                    <button
                      key={colorName}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleAddColor(colorName)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isAlreadyAdded
                          ? "opacity-40 border-borda dark:border-[#38262C] bg-fundo/40 cursor-not-allowed"
                          : "bg-fundo/70 dark:bg-[#151012] border-borda dark:border-[#38262C] text-texto-medio dark:text-[#D4BFC5] hover:border-primaria hover:text-primaria"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input para adicionar cor livre */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
                placeholder="Ex: Marsala, Verde Oliva, Grafite..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#151012] border border-borda dark:border-[#38262C] text-texto-escuro dark:text-[#F8EFF1] placeholder:text-texto-claro dark:placeholder:text-[#988087] outline-none focus:border-primaria"
              />
              <button
                type="button"
                onClick={() => handleAddColor()}
                className="px-4 py-2 rounded-xl bg-primaria text-white text-xs font-bold hover:bg-primaria-hover transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Chips de cores ativas */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-texto-claro dark:text-[#988087] block mb-2">
                Cores Adicionadas ({colors.length}):
              </span>
              {colors.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                  Nenhuma cor adicionada ainda. Insira pelo menos uma cor para que os clientes possam selecionar na loja.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {colors.map((cl) => {
                    const hex = getColorHex(cl);
                    return (
                      <span
                        key={cl}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#151012] text-texto-escuro dark:text-[#F8EFF1] border border-borda dark:border-[#38262C] text-xs font-semibold shadow-2xs animate-in zoom-in-95"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span>{cl}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(cl)}
                          className="hover:bg-erro/10 hover:text-erro rounded-full p-0.5 transition-colors cursor-pointer text-texto-claro dark:text-[#988087] ml-0.5"
                          title={`Remover cor ${cl}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
