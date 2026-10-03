"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  favoritesCount?: number;
  ordersCount?: number;
}

export function MobileBottomNav({ favoritesCount = 0, ordersCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      label: "Início",
      href: "/conta",
      icon: Home,
      exact: true,
    },
    {
      label: "Pedidos",
      href: "/conta/pedidos",
      icon: ShoppingBag,
      badge: ordersCount > 0 ? String(ordersCount) : undefined,
    },
    {
      label: "Favoritos",
      href: "/conta/favoritos",
      icon: Heart,
      badge: favoritesCount > 0 ? String(favoritesCount) : undefined,
    },
    {
      label: "Conta",
      href: "/conta/dados",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Navegação mobile da conta"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1A1316]/95 backdrop-blur-md border-t border-[#F0E5E7] dark:border-[#38262C] safe-area-bottom select-none transition-colors"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors relative py-1",
                isActive
                  ? "text-primaria font-bold"
                  : "text-texto-claro dark:text-[#9E858C] hover:text-primaria"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-primaria text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#1A1316]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primaria" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
