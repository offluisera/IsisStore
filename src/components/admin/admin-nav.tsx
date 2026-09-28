"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Visão Geral",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Produtos",
    href: "/admin/produtos",
    icon: Package,
    exact: false,
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    icon: Layers,
    exact: false,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    exact: false,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
    exact: false,
  },
  {
    label: "Auditoria",
    href: "/admin/auditoria",
    icon: ShieldAlert,
    exact: false,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-borda/70 mb-8">
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
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200",
              isActive
                ? "bg-primaria text-white shadow-xs"
                : "text-texto-medio hover:text-texto-escuro hover:bg-fundo"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
