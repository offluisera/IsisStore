"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";

export interface CategoryShowcaseProduct {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  sale_price_cents?: number | null;
  stock: number;
  featured?: boolean;
  categories?: { name: string } | null;
  product_images?: { public_url: string; is_primary: boolean }[];
}

interface CategoryShowcaseSectionProps {
  categoryName: string;
  categorySlug: string;
  subtitle: string;
  icon: React.ReactNode;
  products: CategoryShowcaseProduct[];
  onAddToCart: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
}

export function CategoryShowcaseSection({
  categoryName,
  categorySlug,
  subtitle,
  icon,
  products,
  onAddToCart,
  onToggleWishlist,
}: CategoryShowcaseSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, products]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 border-t border-borda-suave">
      {/* Header da Vitrine de Categoria */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center shrink-0 shadow-2xs">
              {icon}
            </div>
            <span className="text-xs font-semibold text-primaria uppercase tracking-wider">
              Vitrine Oficial
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-texto-escuro">
            {categoryName}
          </h2>
          <p className="text-xs sm:text-sm text-texto-claro mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/produtos?categoria=${categorySlug}`}
            className="text-xs sm:text-sm font-semibold text-primaria hover:underline inline-flex items-center gap-1 group"
          >
            <span>Ver todos em {categoryName}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {products.length > 2 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label={`Rolar ${categoryName} para esquerda`}
                className="w-8 h-8 rounded-xl border border-borda bg-white hover:bg-fundo text-texto-escuro flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-white shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label={`Rolar ${categoryName} para direita`}
                className="w-8 h-8 rounded-xl border border-borda bg-white hover:bg-fundo text-texto-escuro flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-white shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carrossel Horizontal de até 15 Produtos */}
      {products.length > 0 ? (
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 snap-x snap-mandatory"
          >
            {products.slice(0, 15).map((product) => {
              const primaryImg =
                product.product_images?.find((i) => i.is_primary) ||
                product.product_images?.[0];

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
                  key={product.id}
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
                      category={product.categories?.name || categoryName}
                      price={product.sale_price_cents || product.price_cents}
                      originalPrice={
                        product.sale_price_cents ? product.price_cents : undefined
                      }
                      discountPercent={discount}
                      imageUrl={
                        primaryImg?.public_url || "/images/logo/logo.jpeg"
                      }
                      onAddToCart={() => onAddToCart(product.id)}
                      onToggleWishlist={
                        onToggleWishlist
                          ? () => onToggleWishlist(product.id)
                          : undefined
                      }
                      badgeText={product.featured ? "Destaque" : undefined}
                      className="h-full shadow-xs hover:border-primaria/40"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-fundo-card border border-borda text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-primaria-soft text-primaria flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-texto-escuro">
            Novidades em {categoryName} chegando em breve!
          </p>
          <p className="text-[11px] text-texto-claro mt-1">
            Estamos preparando lançamentos exclusivos nesta categoria.
          </p>
        </div>
      )}
    </section>
  );
}
