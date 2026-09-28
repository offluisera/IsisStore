"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  ChevronRight,
  Heart,
  Store,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  hasSubmenu?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Produtos",
    href: "/admin/produtos",
    icon: Package,
    hasSubmenu: true,
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    icon: Layers,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    hasSubmenu: true,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
    hasSubmenu: true,
  },
  {
    label: "Gateways",
    href: "/admin/gateways",
    icon: CreditCard,
  },
  {
    label: "Auditoria",
    href: "/admin/auditoria",
    icon: ShieldCheck,
    badge: "Seguro",
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
    hasSubmenu: true,
  },
];

export function AdminSidebar({ onCloseMobile, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-[#F0E5E7] h-full select-none",
        isMobile ? "w-72" : "w-64 xl:w-72"
      )}
    >
      {/* Topo / Marca Isis Store */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-[#F7EFF1]">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group transition-transform active:scale-98"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primaria/25 shadow-xs group-hover:border-primaria transition-colors">
            <Image
              src="/images/logo/logo.jpeg"
              alt="Isis Store"
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-texto-escuro group-hover:text-primaria transition-colors">
              Isis Store
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-primaria">
              Painel Admin
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-texto-claro hover:text-texto-escuro hover:bg-fundo transition-colors"
            aria-label="Fechar navegação"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primaria/20">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-texto-claro/70">
          Menu Principal
        </div>

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
                  ? "bg-[#FDF2F4] text-primaria font-semibold shadow-xs"
                  : "text-[#6B5558] hover:text-primaria hover:bg-[#FFF5F6]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-primaria" : "text-[#8E787C] group-hover:text-primaria"
                  )}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      isActive
                        ? "bg-primaria text-white"
                        : "bg-primaria/10 text-primaria"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && (
                  <ChevronRight
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      isActive
                        ? "text-primaria rotate-90"
                        : "text-[#B8A7AB] group-hover:text-primaria"
                    )}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Card Promocional Editorial no Rodapé da Sidebar */}
      <div className="p-4 border-t border-[#F7EFF1]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF5F6] via-[#FDF2F4] to-[#FCEEF1] border border-secundaria/35 p-4 shadow-xs">
          <div className="relative z-10 space-y-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primaria">
              <Heart className="w-3 h-3 fill-primaria text-primaria" />
              Inspiração Diária
            </span>
            <p className="font-serif italic text-xs leading-snug text-texto-escuro/90">
              &ldquo;Grandes conquistas começam com boas escolhas! ♡&rdquo;
            </p>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primaria hover:text-primaria-hover transition-colors pt-1"
            >
              <Store className="w-3 h-3" />
              <span>Acessar vitrine pública</span>
            </Link>
          </div>

          {/* Efeito decorativo sutil de fundo */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-primaria/10 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="px-6 py-3 border-t border-[#F7EFF1] bg-[#FAFAFA] flex items-center justify-between text-[11px] text-[#9E8C90]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sucesso animate-pulse" />
          <span>v1.0.0</span>
        </span>
        <span className="text-[10px] font-medium text-texto-claro/80">
          Isis Store &bull; Admin
        </span>
      </div>
    </aside>
  );
}
