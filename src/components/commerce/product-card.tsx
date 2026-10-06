"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";
import { useCart } from "@/features/cart/context/cart-context";

export interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  price: number; // Em centavos (R$ 199,90 = 19990)
  originalPrice?: number; // Preço antigo em centavos
  discountPercent?: number; // Ex: 20 para 20% OFF
  badgeText?: string; // Ex: "Novo", "Mais vendido"
  rating?: number; // Ex: 4.8
  reviewCount?: number; // Ex: 124
  imageUrl: string;
  colors?: string[]; // Hex color dots
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  isWishlisted?: boolean;
  className?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  category,
  price,
  originalPrice,
  discountPercent,
  badgeText,
  rating = 4.9,
  reviewCount = 86,
  imageUrl,
  colors,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  className,
}: ProductCardProps) {
  const [wishlist, setWishlist] = React.useState(isWishlisted);
  const [justAdded, setJustAdded] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isCustomizable = Boolean(category?.toLowerCase().includes("personalizad"));

  let cartCtx: ReturnType<typeof useCart> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    cartCtx = useCart();
  } catch {
    cartCtx = null;
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !wishlist;
    setWishlist(next);
    onToggleWishlist?.(id);
    if (next) {
      toast.success("Adicionado aos favoritos", `${name} foi salvo na sua lista.`);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-borda bg-fundo-card p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primaria-border hover:shadow-md will-change-transform",
        className
      )}
    >
      {/* Imagem + Badges */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-fundo-elevado">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-texto-claro">
            <ShoppingBag className="h-12 w-12 stroke-1" />
          </div>
        )}

        {/* Tag de Desconto / Badge */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
          {discountPercent && (
            <Badge variant="discount" className="shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
          {badgeText && !discountPercent && (
            <Badge variant="primary" className="shadow-sm">
              {badgeText}
            </Badge>
          )}
        </div>

        {/* Botão de Wishlist / Favorito */}
        <button
          onClick={handleWishlist}
          aria-label={wishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-fundo-card/90 border border-borda backdrop-blur-xs text-texto-escuro shadow-xs transition-transform duration-200 hover:scale-110 hover:bg-fundo-card active:scale-95"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wishlist ? "fill-primaria text-primaria" : "text-texto-medio hover:text-primaria"
            )}
          />
        </button>
      </div>

      {/* Conteúdo Informativo */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          {category && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-texto-claro mb-1 block">
              {category}
            </span>
          )}

          <h3 className="font-serif text-base font-bold text-texto-escuro line-clamp-1 group-hover:text-primaria transition-colors">
            {name}
          </h3>

          {/* Avaliações */}
          <div className="mt-1.5 flex items-center gap-1 text-xs text-texto-claro">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
            <span className="font-semibold text-texto-escuro">{rating.toFixed(1)}</span>
            <span>({reviewCount} avaliações)</span>
          </div>

          {/* Cores se houver */}
          {colors && colors.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {colors.map((c, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preços e Ação */}
        <div className="mt-4 pt-3 border-t border-borda-suave">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif text-lg font-bold text-primaria">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-texto-claro line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {isCustomizable ? (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (slug) {
                  router.push(`/produtos/${slug}`);
                }
              }}
              variant="outline"
              className="w-full text-xs font-semibold h-10 gap-1.5 sm:gap-2 border-primaria text-primaria hover:bg-primaria hover:text-white shadow-xs transition-all duration-200 touch-manipulation"
              aria-label={`Personalizar ${name}`}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Personalizar</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 1800);

                // 1. Sempre adiciona ao CartContext real e abre a gaveta do carrinho
                if (cartCtx) {
                  cartCtx.addItem(
                    {
                      id,
                      productId: id,
                      name,
                      price,
                      imageUrl: imageUrl || "/images/logo/logo.jpeg",
                      slug,
                    },
                    1
                  );
                  cartCtx.openCart();
                } else if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("cart:add-item", {
                      detail: {
                        productId: id,
                        productName: name,
                        priceCents: price,
                        imageUrl: imageUrl,
                        slug,
                        quantity: 1,
                      },
                    })
                  );
                }

                toast.success(
                  "Produto adicionado ao carrinho!",
                  `${name} já está na sua sacola.`
                );

                if (onAddToCart) {
                  onAddToCart(id);
                }
              }}
              variant={justAdded ? "default" : "default"}
              className={cn(
                "w-full text-xs font-semibold h-10 gap-1.5 sm:gap-2 shadow-xs transition-all duration-200 touch-manipulation",
                justAdded
                  ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                  : "group-hover:bg-primaria-hover"
              )}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                  <span>Adicionar</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
