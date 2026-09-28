"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/features/cart/context/cart-context";

export function BottomNav({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();
  const cart = useCart();

  const totalCartCount = cartCount > 0 ? cartCount : (cart?.itemsCount ?? 0);

  const links = [
    { label: "Início", href: "/", icon: Home },
    { label: "Categorias", href: "/categorias", icon: Grid },
    { label: "Carrinho", href: "/carrinho", icon: ShoppingBag, badge: totalCartCount },
    { label: "Conta", href: "/conta", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-borda-suave px-2 min-[360px]:px-4 sm:px-6 py-1.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 px-2 sm:px-3 min-h-[44px] min-w-[44px] text-[10px] min-[360px]:text-[11px] font-medium transition-colors relative touch-manipulation",
                isActive
                  ? "text-primaria font-bold"
                  : "text-texto-claro hover:text-texto-escuro"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.2]" : "stroke-[1.6]")} />
                {Boolean(link.badge && link.badge > 0) && (
                  <span
                    key={link.badge}
                    className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primaria text-white text-[9px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200"
                  >
                    {link.badge}
                  </span>
                )}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
