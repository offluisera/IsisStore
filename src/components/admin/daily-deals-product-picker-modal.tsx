"use client";

import * as React from "react";
import Image from "next/image";
import {
  X,
  Search,
  Check,
  Zap,
  Package,
  Layers,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DailyDealsPickerProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price_cents: number;
  sale_price_cents?: number | null;
  stock: number;
  status: string;
  categories?: { id?: string; name: string; slug?: string } | null;
  product_images?: Array<{
    id?: string;
    public_url: string;
    is_primary?: boolean | null;
  }>;
}

interface DailyDealsProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: DailyDealsPickerProduct[];
  selectedProductIds: string[];
  discountPercent: number;
  onConfirm: (selectedIds: string[]) => void;
}

export function DailyDealsProductPickerModal({
  isOpen,
  onClose,
  products,
  selectedProductIds,
  discountPercent,
  onConfirm,
}: DailyDealsProductPickerModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>(selectedProductIds);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Atualiza a seleção temporária sempre que o modal abre
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds([...selectedProductIds]);
      setSearch("");
      setSelectedCategory("all");
    }
  }, [isOpen, selectedProductIds]);

  // Bloqueio de tecla ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lista de categorias distintas para o filtro
  const categoriesList = React.useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.categories?.name) {
        map.set(p.categories.id || p.categories.name, p.categories.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Filtro de produtos
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        p.categories?.id === selectedCategory ||
        p.categories?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const toggleSelect = (productId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    setSelectedIds((prev) => {
      const set = new Set([...prev, ...visibleIds]);
      return Array.from(set);
    });
  };

  const handleDeselectAllVisible = () => {
    const visibleIds = new Set(filteredProducts.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-deals-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-[#1E1518] rounded-3xl border border-borda dark:border-[#38262C] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800/40">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="modal-deals-picker-title"
                  className="font-serif text-lg sm:text-xl font-bold text-texto-escuro dark:text-[#F8EFF1]"
                >
                  Selecionar Produtos para Ofertas do Dia
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40">
                  {discountPercent}% OFF
                </span>
              </div>
              <p className="text-xs text-texto-claro dark:text-[#988087] mt-0.5">
                Escolha os produtos específicos que serão exibidos com desconto na faixa promocional da home.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-texto-claro dark:text-[#988087] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] transition-colors"
            title="Fechar"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:p-5 border-b border-borda/60 dark:border-[#38262C]/60 bg-fundo/40 dark:bg-[#171012] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-texto-claro dark:text-[#988087] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome ou SKU do produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] text-xs text-texto-escuro dark:text-[#F8EFF1] outline-none focus:border-primaria transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-texto-claro hover:text-texto-escuro"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {categoriesList.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 rounded-xl border border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] text-xs text-texto-escuro dark:text-[#F8EFF1] outline-none focus:border-primaria transition-all"
              >
                <option value="all">Todas as Categorias</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ações rápidas de seleção */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="px-2.5 py-1.5 rounded-lg border border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] text-texto-escuro dark:text-[#F8EFF1] hover:bg-neutral-50 dark:hover:bg-[#251A1E] transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5 text-primaria" />
              <span>Marcar visíveis</span>
            </button>
            <button
              type="button"
              onClick={handleDeselectAllVisible}
              className="px-2.5 py-1.5 rounded-lg border border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] text-texto-claro dark:text-[#988087] hover:bg-neutral-50 dark:hover:bg-[#251A1E] transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Desmarcar</span>
            </button>
          </div>
        </div>

        {/* Lista de Produtos (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-texto-claro dark:text-[#988087] space-y-2">
              <Package className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">Nenhum produto encontrado com estes filtros.</p>
              <p className="text-xs">Tente buscar por outro termo ou selecione todas as categorias.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const primaryImg =
                  p.product_images?.find((img) => img.is_primary)?.public_url ||
                  p.product_images?.[0]?.public_url ||
                  "/images/logo/logo.jpeg";

                const basePrice = (p.sale_price_cents || p.price_cents) / 100;
                const dealPrice = basePrice * (1 - discountPercent / 100);

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                      isSelected
                        ? "bg-orange-50/70 dark:bg-orange-950/20 border-orange-500 dark:border-orange-500/60 shadow-xs ring-1 ring-orange-500/30"
                        : "bg-white dark:bg-[#1E1518] border-borda dark:border-[#38262C] hover:border-orange-300 dark:hover:border-orange-800/40"
                    }`}
                  >
                    {/* Checkbox customizado */}
                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "bg-orange-600 border-orange-600 text-white shadow-xs"
                          : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151012]"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Imagem do Produto */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#151012] border border-borda/60 dark:border-[#38262C]/60 shrink-0 relative">
                      <Image
                        src={primaryImg}
                        alt={p.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {p.categories?.name && (
                          <span className="text-[10px] uppercase font-bold text-primaria tracking-wide truncate max-w-[130px]">
                            {p.categories.name}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-texto-claro dark:text-[#988087]">
                          • {p.sku}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] truncate" title={p.name}>
                        {p.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-texto-claro dark:text-[#988087] line-through">
                          R$ {basePrice.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          R$ {dealPrice.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-[10px] text-texto-claro dark:text-[#988087] ml-auto">
                          Estoque: {p.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé do Modal com Contador e Botões */}
        <div className="p-4 sm:p-6 border-t border-borda dark:border-[#38262C] bg-white dark:bg-[#1E1518] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
            <span className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1]">
              {selectedIds.length} produto{selectedIds.length === 1 ? "" : "s"} selecionado{selectedIds.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              className="text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Seleção ({selectedIds.length})</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
