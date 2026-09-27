"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, ArrowUpDown } from "lucide-react";
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
    <div className="flex flex-col gap-5 bg-white p-5 sm:p-6 rounded-2xl border border-borda shadow-xs mb-8">
      {/* Top: Search and Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-24 rounded-xl border border-borda bg-fundo/40 text-xs sm:text-sm text-texto-escuro placeholder:text-texto-claro outline-none focus:border-primaria focus:bg-white transition-all"
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
            className="h-10 px-3 pr-8 rounded-xl border border-borda bg-white text-xs font-medium text-texto-escuro outline-none focus:border-primaria cursor-pointer"
          >
            <option value="newest">Mais recentes</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
            <option value="name_asc">Nome (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Middle: Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => updateParam("categoria", null)}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
            currentCategory === ""
              ? "bg-primaria text-white border-primaria shadow-xs"
              : "bg-white text-texto-escuro border-borda hover:border-primaria/50"
          }`}
        >
          Todas as Categorias
        </button>

        {categories.map((cat) => {
          const isSelected = currentCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam("categoria", cat.slug)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                isSelected
                  ? "bg-primaria text-white border-primaria shadow-xs"
                  : "bg-white text-texto-escuro border-borda hover:border-primaria/50"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
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
