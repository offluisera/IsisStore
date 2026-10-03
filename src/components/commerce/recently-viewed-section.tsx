"use client";

import * as React from "react";
import Link from "next/link";
import {
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sparkles,
  ArrowDown,
} from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  RECENTLY_VIEWED_EVENT_NAME,
  RecentlyViewedProduct,
} from "@/lib/storage/recently-viewed";

interface RecentlyViewedSectionProps {
  onAddToCart: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
}

export function RecentlyViewedSection({
  onAddToCart,
  onToggleWishlist,
}: RecentlyViewedSectionProps) {
  const [items, setItems] = React.useState<RecentlyViewedProduct[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  React.useEffect(() => {
    // Carregar itens do localStorage no client-side
    const current = getRecentlyViewed();
    setItems(current);
    setIsLoaded(true);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RecentlyViewedProduct[]>;
      if (customEvent.detail) {
        setItems(customEvent.detail);
      } else {
        setItems(getRecentlyViewed());
      }
    };

    window.addEventListener(RECENTLY_VIEWED_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(RECENTLY_VIEWED_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, items]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
  };

  const scrollToDeals = () => {
    const dealsElem = document.getElementById("ofertas-do-dia");
    if (dealsElem) {
      dealsElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Prevenir layout shift durante SSR
  if (!isLoaded) {
    return null;
  }

  return (
    <section
      id="historico-visualizacao"
      className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-4"
    >
      {/* Header da Seção de Histórico */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 shadow-2xs border border-primaria-border/40">
              <History className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-primaria uppercase tracking-wider">
              Histórico de Navegação
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro">
            Visto recentemente
          </h2>
          <p className="text-xs sm:text-sm text-texto-claro mt-1">
            Reencontre com facilidade os produtos que você explorou por último
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-texto-claro hover:text-red-500 transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borda hover:border-red-200 hover:bg-red-50/50"
              title="Limpar histórico de visualização"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar histórico</span>
            </button>
          )}

          {items.length > 2 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Rolar histórico para esquerda"
                className="w-8 h-8 rounded-xl border border-borda bg-fundo-card hover:bg-primaria-soft/40 text-texto-escuro flex items-center justify-center transition-all disabled:opacity-30 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Rolar histórico para direita"
                className="w-8 h-8 rounded-xl border border-borda bg-fundo-card hover:bg-primaria-soft/40 text-texto-escuro flex items-center justify-center transition-all disabled:opacity-30 shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo: Lista de Produtos ou Estado Vazio Informativo */}
      {items.length > 0 ? (
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 snap-x snap-mandatory"
          >
            {items.map((product, index) => {
              const discount =
                product.sale_price_cents &&
                product.sale_price_cents < product.price_cents
                  ? Math.round(
                      ((product.price_cents - product.sale_price_cents) /
                        product.price_cents) *
                        100
                    )
                  : undefined;

              return (
                <div
                  key={`${product.id}-${index}`}
                  className="w-[240px] sm:w-[260px] shrink-0 snap-start flex flex-col h-full"
                >
                  <Link
                    href={`/produtos/${product.slug}`}
                    className="block h-full group"
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      category={product.category_name || "Visto recentemente"}
                      price={product.sale_price_cents || product.price_cents}
                      originalPrice={
                        product.sale_price_cents
                          ? product.price_cents
                          : undefined
                      }
                      discountPercent={discount}
                      imageUrl={
                        product.image_url || "/images/logo/logo.jpeg"
                      }
                      onAddToCart={() => onAddToCart(product.id)}
                      onToggleWishlist={
                        onToggleWishlist
                          ? () => onToggleWishlist(product.id)
                          : undefined
                      }
                      badgeText={index === 0 ? "Último visto" : undefined}
                      className="h-full shadow-xs hover:border-primaria/40"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-fundo-card/80 border border-dashed border-borda flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 border border-primaria-border/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-texto-escuro">
                Seu histórico pessoal está pronto para começar
              </h3>
              <p className="text-xs text-texto-claro mt-0.5 max-w-lg">
                Assim que você abrir qualquer semijoia ou presente da loja, ele será guardado automaticamente aqui para você não perder de vista.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToDeals}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-primaria text-white shadow-xs hover:bg-primaria-hover transition-all shrink-0 active:scale-95"
          >
            <span>Conhecer Ofertas do Dia</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
