"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  User,
  MapPin,
  Heart,
  Ticket,
  Headphones,
  LogOut,
  LayoutDashboard,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountSidebarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
  isAdmin?: boolean;
  counts?: {
    orders?: number;
    favorites?: number;
    addresses?: number;
    coupons?: number;
  };
}

export function AccountSidebar({
  onCloseMobile,
  isMobile = false,
  isAdmin = false,
  counts,
}: AccountSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      label: "Início",
      href: "/conta",
      icon: Home,
      exact: true,
    },
    {
      label: "Meus pedidos",
      href: "/conta/pedidos",
      icon: ShoppingBag,
      badge: counts?.orders !== undefined && counts.orders > 0 ? String(counts.orders) : undefined,
    },
    {
      label: "Minha conta",
      href: "/conta/dados",
      icon: User,
    },
    {
      label: "Endereços",
      href: "/conta/enderecos",
      icon: MapPin,
      badge: counts?.addresses !== undefined && counts.addresses > 0 ? String(counts.addresses) : undefined,
    },
    {
      label: "Favoritos",
      href: "/conta/favoritos",
      icon: Heart,
      badge: counts?.favorites !== undefined && counts.favorites > 0 ? String(counts.favorites) : undefined,
    },
    {
      label: "Cupons",
      href: "/conta/cupons",
      icon: Ticket,
      badge: counts?.coupons !== undefined && counts.coupons > 0 ? String(counts.coupons) : undefined,
    },
    {
      label: "Suporte",
      href: "/conta/suporte",
      icon: Headphones,
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-[#1A1316] border-r border-[#F0E5E7] dark:border-[#38262C] h-full select-none transition-colors",
        isMobile ? "w-72" : "w-64 xl:w-72"
      )}
    >
      {/* Topo / Marca Isis Store Oficial */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-[#F7EFF1] dark:border-[#302026]">
        <Link
          href="/conta"
          onClick={onCloseMobile}
          className="flex flex-col items-center text-center w-full group transition-transform active:scale-98"
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primaria/25 shadow-xs group-hover:border-primaria transition-colors mb-2">
            <Image
              src="/images/logo/logo.jpeg"
              alt="Isis Store"
              fill
              sizes="64px"
              className="object-cover"
              priority
            />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1] group-hover:text-primaria transition-colors">
            Isis Store
          </span>
          <span className="text-[11px] font-serif italic text-primaria mt-0.5">
            Tudo o que você ama, em um só lugar! ♡
          </span>
        </Link>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-texto-claro hover:text-texto-escuro hover:bg-fundo dark:hover:bg-[#2C1D23] transition-colors"
            aria-label="Fechar navegação"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navegação da Área do Cliente */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-[#FDF2F4] dark:bg-[#352028] text-primaria font-semibold shadow-xs"
                  : "text-[#6B5558] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-primaria"
                      : "text-[#8E787C] dark:text-[#9A8188] group-hover:text-primaria"
                  )}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold",
                    isActive
                      ? "bg-primaria text-white"
                      : "bg-primaria/10 dark:bg-primaria/20 text-primaria"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Link administrativo caso seja admin */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-[#F7EFF1] dark:border-[#302026]">
            <Link
              href="/admin"
              onClick={onCloseMobile}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#8E787C] dark:text-[#A0888F] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-primaria" />
              <span>Painel Admin</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Rodapé da Sidebar: Botão Sair */}
      <div className="p-4 border-t border-[#F7EFF1] dark:border-[#302026]">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-texto-claro dark:text-[#A0888F] hover:text-erro hover:bg-erro/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-erro/80" />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
