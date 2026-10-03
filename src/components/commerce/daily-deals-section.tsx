"use client";

import * as React from "react";
import Link from "next/link";
import { Zap, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";

export interface DailyDealProduct {
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

interface DailyDealsSectionProps {
  products: DailyDealProduct[];
  discountPercent?: number;
  title?: string;
  bgColor?: string;
  onAddToCart: (productId: string, customPriceCents?: number) => void;
  onToggleWishlist?: (productId: string) => void;
}

export function DailyDealsSection({
  products,
  discountPercent = 15,
  title = "Ofertas do dia",
  bgColor = "#D9480F",
  onAddToCart,
  onToggleWishlist,
}: DailyDealsSectionProps) {
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

  if (!products || products.length === 0) {
    return null;
  }

  const finalBgColor = bgColor || "#D9480F";

  return (
    <section id="ofertas-do-dia" className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Faixa Oficial de Ofertas do Dia com Cor Customizável */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-md border border-white/20 transition-colors"
        style={{
          backgroundColor: finalBgColor,
          backgroundImage: `linear-gradient(135deg, ${finalBgColor} 0%, rgba(0,0,0,0.18) 100%)`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-white">
          {/* Lado Esquerdo: Ícone Raio + Título + Badge de Desconto */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
              <Zap className="w-5 h-5 fill-white text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-xs">
                {title}
              </h2>
              <span
                className="bg-white font-bold text-xs sm:text-sm px-3 py-1 rounded-full shadow-xs uppercase tracking-wide"
                style={{ color: finalBgColor }}
              >
                até {discountPercent}% OFF
              </span>
            </div>
          </div>

          {/* Lado Direito: Link Ver Todas e Controles de Navegação */}
          <div className="flex items-center gap-2">
            <Link
              href="/produtos"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/25 hover:bg-black/40 text-white text-xs sm:text-sm font-semibold transition-all border border-white/20 backdrop-blur-xs shadow-xs"
            >
              <span>Ver todas as ofertas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Setas de navegação do carrossel */}
            <div className="hidden sm:flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Rolar para esquerda"
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Rolar para direita"
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carrossel Horizontal de Cards com Desconto Diário */}
      <div className="relative mt-4">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 snap-x snap-mandatory"
        >
          {products.map((product) => {
            // Calcular o preço diário com desconto
            const finalDiscount = discountPercent;
            const originalPrice = product.price_cents;
            const discountedPrice = Math.round(
              originalPrice * (1 - finalDiscount / 100)
            );

            const primaryImg =
              product.product_images?.find((i) => i.is_primary) ||
              product.product_images?.[0];

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
                    category={product.categories?.name}
                    price={discountedPrice}
                    originalPrice={originalPrice}
                    discountPercent={finalDiscount}
                    imageUrl={primaryImg?.public_url || "/images/logo/logo.jpeg"}
                    onAddToCart={() => onAddToCart(product.id, discountedPrice)}
                    onToggleWishlist={
                      onToggleWishlist ? () => onToggleWishlist(product.id) : undefined
                    }
                    badgeText={`-${finalDiscount}% OFF`}
                    className="h-full border-orange-200/60 hover:border-orange-400/80 shadow-xs"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
