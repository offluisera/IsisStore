"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, User, ShoppingBag, Menu, X, Truck, HelpCircle, PhoneCall } from "lucide-react";
import { CartDrawer, type CartItemData } from "@/components/commerce/cart-drawer";
import { useCart } from "@/features/cart/context/cart-context";

export function Header({
  cartCount = 0,
  cartItems = [],
  wishlistCount = 0,
}: {
  cartCount?: number;
  cartItems?: CartItemData[];
  wishlistCount?: number;
}) {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  let cartCtx: ReturnType<typeof useCart> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    cartCtx = useCart();
  } catch {
    cartCtx = null;
  }

  const totalCartItems = cartCount > 0 ? cartCount : (cartCtx?.itemsCount ?? 0);

  const handleOpenCart = () => {
    if (cartCtx) {
      cartCtx.openCart();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-borda-suave shadow-xs">
        {/* Top Announcement Bar */}
        <div className="bg-fundo border-b border-borda-suave text-xs text-texto-medio py-1.5 px-3 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs min-w-0">
              <Truck className="w-3.5 h-3.5 text-primaria shrink-0" />
              <span className="truncate sm:overflow-visible">
                Frete Grátis para todo o Brasil acima de <strong>R$ 199,00</strong>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-5 text-texto-claro text-[11px] shrink-0">
              <Link href="/rastreio" className="hover:text-primaria transition-colors">
                Rastrear Pedido
              </Link>
              <span className="text-borda">|</span>
              <Link href="/ajuda" className="flex items-center gap-1 hover:text-primaria transition-colors">
                <HelpCircle className="w-3 h-3" /> Ajuda
              </Link>
              <span className="text-borda">|</span>
              <Link href="/contato" className="flex items-center gap-1 hover:text-primaria transition-colors">
                <PhoneCall className="w-3 h-3" /> Fale Conosco
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-texto-escuro hover:text-primaria rounded-xl touch-manipulation cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border border-primaria-border shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0">
                <Image
                  src="/images/logo/logo.jpeg"
                  alt="Isis Store Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-texto-escuro group-hover:text-primaria transition-colors leading-none">
                  Isis Store
                </span>
                <span className="text-[10px] text-texto-claro tracking-widest uppercase mt-0.5">
                  Tudo o que você ama
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-texto-escuro">
            <Link href="/" className="hover:text-primaria transition-colors text-primaria font-semibold">
              Início
            </Link>
            <Link href="/produtos" className="hover:text-primaria transition-colors">
              Produtos
            </Link>
            <Link href="/categorias" className="hover:text-primaria transition-colors">
              Categorias
            </Link>
            <Link href="/contato" className="hover:text-primaria transition-colors">
              Contato
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-sm mx-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/produtos?busca=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="relative w-full"
            >
              <input
                type="text"
                placeholder="O que você está procurando?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-borda bg-fundo/50 text-xs text-texto-escuro placeholder:text-texto-claro transition-all outline-none focus:border-primaria focus:bg-white focus:ring-2 focus:ring-primaria/20"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-texto-claro" />
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            {/* Wishlist */}
            <Link
              href="/favoritos"
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-texto-escuro hover:bg-primaria-soft hover:text-primaria transition-colors touch-manipulation"
              aria-label="Meus favoritos"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primaria text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Minha Conta */}
            <Link
              href="/conta"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-texto-escuro hover:bg-primaria-soft hover:text-primaria transition-colors touch-manipulation"
              aria-label="Minha conta"
            >
              <User className="w-5 h-5 stroke-[1.8]" />
            </Link>

            {/* Carrinho */}
            <button
              onClick={handleOpenCart}
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-texto-escuro hover:bg-primaria-soft hover:text-primaria transition-colors touch-manipulation cursor-pointer"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalCartItems > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4.5 w-4.5 rounded-full bg-primaria text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-texto-escuro/40 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-white h-full p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-left">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-borda-suave">
                  <span className="font-serif text-xl font-bold text-texto-escuro">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-texto-claro hover:text-texto-escuro"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-6 flex flex-col gap-4 text-sm font-medium text-texto-escuro">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1 hover:text-primaria"
                  >
                    Início
                  </Link>
                  <Link
                    href="/produtos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1 hover:text-primaria"
                  >
                    Produtos
                  </Link>
                  <Link
                    href="/categorias"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1 hover:text-primaria"
                  >
                    Categorias
                  </Link>
                  <Link
                    href="/contato"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1 hover:text-primaria"
                  >
                    Contato
                  </Link>
                  <Link
                    href="/conta/pedidos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-1 hover:text-primaria"
                  >
                    Meus Pedidos
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-borda-suave text-xs text-texto-claro space-y-2">
                <p>Atendimento: Seg a Sex das 09h às 18h</p>
                <p className="font-serif text-texto-medio font-semibold">Isis Store © 2026</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer Fallback se fora de CartProvider */}
      {!cartCtx && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
        />
      )}
    </>
  );
}
