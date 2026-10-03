import Link from "next/link";
import { ShoppingBag, MapPin, Heart, Ticket, ChevronRight } from "lucide-react";

interface AccountShortcutsProps {
  ordersCount: number;
  addressesCount: number;
  favoritesCount?: number;
  couponsCount?: number;
}

export function AccountShortcuts({
  ordersCount,
  addressesCount,
  favoritesCount = 0,
  couponsCount = 3,
}: AccountShortcutsProps) {
  const ITEMS = [
    {
      title: "Meus pedidos",
      subtitle: `${ordersCount} ${ordersCount === 1 ? "pedido" : "pedidos"}`,
      href: "/conta/pedidos",
      icon: ShoppingBag,
    },
    {
      title: "Endereços",
      subtitle: `${addressesCount} ${addressesCount === 1 ? "cadastrado" : "cadastrados"}`,
      href: "/conta/enderecos",
      icon: MapPin,
    },
    {
      title: "Favoritos",
      subtitle: `${favoritesCount} ${favoritesCount === 1 ? "produto" : "produtos"}`,
      href: "/conta/favoritos",
      icon: Heart,
    },
    {
      title: "Cupons",
      subtitle: `${couponsCount} disponíveis`,
      href: "/conta/cupons",
      icon: Ticket,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {ITEMS.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.title}
            href={item.href}
            className="bg-fundo-card dark:bg-[#1E1518] rounded-2xl border border-borda dark:border-[#332228] p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-primaria/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FDF2F4] dark:bg-[#2C1A20] text-primaria flex items-center justify-center shrink-0 border border-primaria/10 dark:border-primaria/25 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-serif font-bold text-texto-escuro dark:text-[#F8EFF1] group-hover:text-primaria transition-colors truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-texto-claro dark:text-[#A89299] truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-texto-claro/50 dark:text-[#7A6369] group-hover:text-primaria group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </Link>
        );
      })}
    </div>
  );
}
