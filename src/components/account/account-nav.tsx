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
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-borda/60 no-scrollbar">
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
                : "bg-white text-texto-medio hover:text-texto-escuro hover:bg-fundo border border-borda/60"
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
