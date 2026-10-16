"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogCategory } from "@/services/catalog.service";
import { Button } from "@/components/ui/button";

interface CatalogFiltersProps {
  categories: CatalogCategory[];
  totalProducts: number;
}

export function CatalogFilters({
  categories,
  totalProducts,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("categoria") || "";
  const currentSearch = searchParams.get("busca") || "";
  const currentSort = searchParams.get("ordem") || "newest";

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const activePillRef = React.useRef<HTMLButtonElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollStatus = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const offset = direction === "left" ? -260 : 260;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  React.useEffect(() => {
    updateScrollStatus();
    const handleResize = () => updateScrollStatus();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollStatus, categories]);

  // Rolar horizontalmente com scroll wheel do mouse para conveniência
  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          updateScrollStatus();
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [updateScrollStatus]);

  // Centralizar automaticamente a categoria ativa na inicialização
  React.useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentCategory]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    // Ao filtrar, resetar para a primeira página
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("busca", searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(currentCategory || currentSearch || (currentSort && currentSort !== "newest"));

  return (
    <div className="flex flex-col gap-5 bg-fundo-card p-5 sm:p-6 rounded-2xl border border-borda shadow-xs mb-8 transition-colors">
      {/* Top: Search and Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-24 rounded-xl border border-borda bg-fundo/40 text-xs sm:text-sm text-texto-escuro placeholder:text-texto-claro outline-none focus:border-primaria focus:bg-fundo-card transition-all"
          />
          <Search className="w-4 h-4 text-texto-claro absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Button
            type="submit"
            size="sm"
            variant="default"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs h-8 px-3"
          >
            Buscar
          </Button>
        </form>

        {/* Sort Select */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2 text-xs text-texto-claro">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ordenar:</span>
          </div>
          <select
            value={currentSort}
            onChange={(e) => updateParam("ordem", e.target.value)}
            className="h-10 px-3 pr-8 rounded-xl border border-borda bg-input-fundo text-xs font-medium text-texto-escuro outline-none focus:border-primaria cursor-pointer"
          >
            <option value="newest">Mais recentes</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
            <option value="name_asc">Nome (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Middle: Category Pills com Navegação e Scrollbar de Luxo */}
      <div className="relative group/cats">
        {/* Botão de Rolar para Esquerda */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Rolar categorias para a esquerda"
            className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-fundo-card/95 backdrop-blur-md border border-borda shadow-md text-texto-escuro hover:text-white hover:bg-primaria hover:border-primaria transition-all duration-200 items-center justify-center cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Botão de Rolar para Direita */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Rolar categorias para a direita"
            className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-fundo-card/95 backdrop-blur-md border border-borda shadow-md text-texto-escuro hover:text-white hover:bg-primaria hover:border-primaria transition-all duration-200 items-center justify-center cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Gradientes sutis nas bordas quando há overflow */}
        {canScrollLeft && (
          <div className="hidden sm:block absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-fundo-card to-transparent pointer-events-none z-10 rounded-l-xl" />
        )}
        {canScrollRight && (
          <div className="hidden sm:block absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-fundo-card to-transparent pointer-events-none z-10 rounded-r-xl" />
        )}

        {/* Container de Categorias */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollStatus}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-luxury scroll-smooth"
        >
          <button
            ref={currentCategory === "" ? activePillRef : null}
            type="button"
            onClick={() => updateParam("categoria", null)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
              currentCategory === ""
                ? "bg-primaria text-white border-primaria shadow-xs shadow-primaria/30"
                : "bg-fundo-card text-texto-escuro border-borda hover:border-primaria/50 hover:bg-fundo-elevado"
            }`}
          >
            Todas as Categorias
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                ref={isSelected ? activePillRef : null}
                type="button"
                onClick={() => updateParam("categoria", cat.slug)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? "bg-primaria text-white border-primaria shadow-xs shadow-primaria/30"
                    : "bg-fundo-card text-texto-escuro border-borda hover:border-primaria/50 hover:bg-fundo-elevado"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary & Clear Button */}
      <div className="flex items-center justify-between text-xs text-texto-claro pt-2 border-t border-borda/60">
        <span>
          Exibindo <strong>{totalProducts}</strong> {totalProducts === 1 ? "produto" : "produtos"}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 text-erro hover:underline font-medium cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
}
