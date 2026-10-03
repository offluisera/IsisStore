"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const pathname = usePathname();

  const links = [
    {
      label: "Visão Geral",
      href: "/conta",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Meus Pedidos",
      href: "/conta/pedidos",
      icon: Package,
      exact: false,
    },
    {
      label: "Endereços",
      href: "/conta/enderecos",
      icon: MapPin,
      exact: false,
    },
    {
      label: "Dados Cadastrais",
      href: "/conta/dados",
      icon: User,
      exact: false,
    },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#F0E5E7] dark:border-[#38262C] no-scrollbar">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200",
              isActive
                ? "bg-primaria text-white shadow-xs"
                : "bg-fundo-card dark:bg-[#1E1518] text-texto-medio dark:text-[#D1C0C5] hover:text-texto-escuro dark:hover:text-[#F8EFF1] hover:bg-fundo dark:hover:bg-[#251A1E] border border-borda dark:border-[#332228]"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "stroke-[2.2]" : "stroke-[1.8]")} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
