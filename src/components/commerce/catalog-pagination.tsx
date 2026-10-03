"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function CatalogPagination({
  currentPage,
  totalPages,
}: CatalogPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12 mb-6"
      aria-label="Paginação de produtos"
    >
      {/* Botão Anterior */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-borda bg-fundo-card text-texto-escuro shadow-xs transition-colors hover:border-primaria hover:text-primaria"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-borda/40 bg-fundo text-texto-claro/40 cursor-not-allowed"
          aria-hidden="true"
        >
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {/* Números de Página */}
      <div className="flex items-center gap-1.5">
        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return isCurrent ? (
            <span
              key={p}
              aria-current="page"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primaria text-white font-semibold text-xs shadow-xs"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={createPageUrl(p)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-borda bg-fundo-card text-texto-escuro text-xs font-medium transition-colors hover:border-primaria hover:text-primaria shadow-xs"
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Botão Próximo */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-borda bg-fundo-card text-texto-escuro shadow-xs transition-colors hover:border-primaria hover:text-primaria"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-borda/40 bg-fundo text-texto-claro/40 cursor-not-allowed"
          aria-hidden="true"
        >
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
