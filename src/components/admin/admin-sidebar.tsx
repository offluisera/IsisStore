"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
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
  PlusCircle,
  BarChart3,
  Boxes,
  Edit3,
  Heart,
  Store,
  X,
  Printer,
  RotateCcw,
  UserPlus,
  Search,
  Sliders,
  Megaphone,
  TicketPercent,
  MessageCircle,
  FileText,
  Lock,
  Sparkles,
  Gift,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  hasSubmenu?: boolean;
  badge?: string;
  subItems?: NavSubItem[];
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
    subItems: [
      {
        label: "Produtos",
        href: "/admin/produtos",
        icon: Package,
      },
      {
        label: "Criar Produtos",
        href: "/admin/produtos/novo",
        icon: PlusCircle,
      },
      {
        label: "Rascunhos",
        href: "/admin/produtos/rascunhos",
        icon: FileText,
      },
      {
        label: "Relatórios",
        href: "/admin/produtos/relatorios",
        icon: BarChart3,
      },
      {
        label: "Estoque",
        href: "/admin/produtos/estoque",
        icon: Boxes,
      },
    ],
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    icon: Layers,
    hasSubmenu: true,
    subItems: [
      {
        label: "Todas as Categorias",
        href: "/admin/categorias",
        icon: Layers,
      },
      {
        label: "Criar Categoria",
        href: "/admin/categorias/novo",
        icon: PlusCircle,
      },
      {
        label: "Editar Categoria",
        href: "/admin/categorias/editar",
        icon: Edit3,
      },
    ],
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    hasSubmenu: true,
    subItems: [
      {
        label: "Todos os Pedidos",
        href: "/admin/pedidos",
        icon: ShoppingBag,
      },
      {
        label: "Categorias",
        href: "/admin/pedidos/categorias",
        icon: Layers,
      },
      {
        label: "Etiquetas",
        href: "/admin/pedidos/etiquetas",
        icon: Printer,
      },
      {
        label: "Reembolsados",
        href: "/admin/pedidos/reembolsados",
        icon: RotateCcw,
      },
    ],
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
    hasSubmenu: true,
    subItems: [
      {
        label: "Todos os Clientes",
        href: "/admin/clientes",
        icon: Users,
      },
      {
        label: "Registrar Cliente",
        href: "/admin/clientes/novo",
        icon: UserPlus,
      },
      {
        label: "Editar Cliente",
        href: "/admin/clientes/editar",
        icon: Edit3,
      },
      {
        label: "Busca Avançada",
        href: "/admin/clientes/busca",
        icon: Search,
      },
    ],
  },
  {
    label: "Cupons",
    href: "/admin/cupons",
    icon: TicketPercent,
    badge: "Promo",
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
    subItems: [
      {
        label: "Geral da Loja",
        href: "/admin/configuracoes?tab=general",
        icon: Store,
      },
      {
        label: "Slides da Home",
        href: "/admin/configuracoes?tab=slides",
        icon: Sliders,
        badge: "Novo",
      },
      {
        label: "Diferenciais da Loja",
        href: "/admin/configuracoes?tab=features",
        icon: Sparkles,
        badge: "Novo",
      },
      {
        label: "Banner de Presentes",
        href: "/admin/configuracoes?tab=editorial",
        icon: Gift,
      },
      {
        label: "SEO & Busca",
        href: "/admin/configuracoes?tab=seo",
        icon: Search,
      },
      {
        label: "Contato & Rodapé",
        href: "/admin/configuracoes?tab=contact",
        icon: Globe,
      },
      {
        label: "Avisos & Operação",
        href: "/admin/configuracoes?tab=operation",
        icon: Megaphone,
      },
      {
        label: "Pág. Contato",
        href: "/admin/configuracoes?tab=contact-page",
        icon: MessageCircle,
      },
      {
        label: "Pág. Termos de Uso",
        href: "/admin/configuracoes?tab=terms-page",
        icon: FileText,
      },
      {
        label: "Pág. Privacidade (LGPD)",
        href: "/admin/configuracoes?tab=privacy-page",
        icon: Lock,
      },
    ],
  },
];

export function AdminSidebar({ onCloseMobile, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Controle de expansão de submenus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    return {
      Produtos: pathname.startsWith("/admin/produtos"),
      Categorias: pathname.startsWith("/admin/categorias"),
      Pedidos: pathname.startsWith("/admin/pedidos"),
      Clientes: pathname.startsWith("/admin/clientes"),
      Configurações: pathname.startsWith("/admin/configuracoes"),
    };
  });

  // Manter aberto automaticamente quando navega para rotas filhas
  useEffect(() => {
    if (pathname.startsWith("/admin/produtos")) {
      setOpenMenus((prev) => ({ ...prev, Produtos: true }));
    }
    if (pathname.startsWith("/admin/categorias")) {
      setOpenMenus((prev) => ({ ...prev, Categorias: true }));
    }
    if (pathname.startsWith("/admin/pedidos")) {
      setOpenMenus((prev) => ({ ...prev, Pedidos: true }));
    }
    if (pathname.startsWith("/admin/clientes")) {
      setOpenMenus((prev) => ({ ...prev, Clientes: true }));
    }
    if (pathname.startsWith("/admin/configuracoes")) {
      setOpenMenus((prev) => ({ ...prev, Configurações: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-[#1A1316] border-r border-[#F0E5E7] dark:border-[#38262C] h-full select-none transition-colors",
        isMobile ? "w-72" : "w-64 xl:w-72"
      )}
    >
      {/* Topo / Marca Isis Store */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-[#F7EFF1] dark:border-[#302026]">
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
            <span className="font-serif text-lg font-bold tracking-tight text-texto-escuro dark:text-[#F8EFF1] group-hover:text-primaria transition-colors">
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
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-primaria/20">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-texto-claro/70">
          Menu Principal
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
          const isSubmenuOpen = Boolean(openMenus[item.label]);
          const isParentActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (hasSubItems) {
            return (
              <div key={item.label} className="space-y-1">
                {/* Botão que expande/recolhe os submenus sem navegar direto */}
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.label)}
                  aria-expanded={isSubmenuOpen}
                  aria-controls={`submenu-${item.label}`}
                  className={cn(
                    "w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left",
                    isParentActive
                      ? "bg-[#FDF2F4] dark:bg-[#352028] text-primaria font-semibold shadow-xs"
                      : "text-[#6B5558] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isParentActive ? "text-primaria" : "text-[#8E787C] group-hover:text-primaria"
                      )}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                          isParentActive
                            ? "bg-primaria text-white"
                            : "bg-primaria/10 text-primaria"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isSubmenuOpen
                          ? "rotate-90 text-primaria"
                          : "text-[#B8A7AB] group-hover:text-primaria"
                      )}
                    />
                  </div>
                </button>

                {/* Submenus com animação suave e indentação limpa */}
                {isSubmenuOpen && item.subItems && (
                  <div
                    id={`submenu-${item.label}`}
                    className="pl-3 pr-1 py-1 space-y-1 ml-5 border-l-2 border-primaria/25 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = (() => {
                        if (sub.href.includes("?tab=")) {
                          const [base, query] = sub.href.split("?");
                          if (pathname !== base) return false;
                          const targetTab = new URLSearchParams(query).get("tab");
                          const currentTab = searchParams?.get("tab") || "general";
                          return targetTab === currentTab;
                        }
                        return pathname === sub.href;
                      })();

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onCloseMobile}
                          className={cn(
                            "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                            isSubActive
                              ? "bg-primaria text-white font-semibold shadow-2xs"
                              : "text-[#6B5558] dark:text-[#CCAAB2] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23]"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            {SubIcon && (
                              <SubIcon
                                className={cn(
                                  "w-3.5 h-3.5 transition-colors shrink-0",
                                  isSubActive
                                    ? "text-white"
                                    : "text-[#8E787C] group-hover:text-primaria"
                                )}
                              />
                            )}
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.2 rounded-full font-bold",
                                isSubActive
                                  ? "bg-white text-primaria"
                                  : "bg-primaria/10 text-primaria"
                              )}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Itens regulares sem submenus
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isParentActive
                  ? "bg-[#FDF2F4] dark:bg-[#352028] text-primaria font-semibold shadow-xs"
                  : "text-[#6B5558] dark:text-[#D1BFC4] hover:text-primaria hover:bg-[#FFF5F6] dark:hover:bg-[#2C1D23]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isParentActive ? "text-primaria" : "text-[#8E787C] dark:text-[#9A8188] group-hover:text-primaria"
                  )}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                      isParentActive
                        ? "bg-primaria text-white"
                        : "bg-primaria/10 dark:bg-primaria/20 text-primaria"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && (
                  <ChevronRight
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      isParentActive
                        ? "text-primaria rotate-90"
                        : "text-[#B8A7AB] dark:text-[#7A6369] group-hover:text-primaria"
                    )}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Card Promocional Editorial no Rodapé da Sidebar */}
      <div className="p-4 border-t border-[#F7EFF1] dark:border-[#302026]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF5F6] via-[#FDF2F4] to-[#FCEEF1] dark:from-[#24171C] dark:via-[#281A20] dark:to-[#201418] border border-secundaria/35 dark:border-[#422932] p-4 shadow-xs">
          <div className="relative z-10 space-y-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primaria">
              <Heart className="w-3 h-3 fill-primaria text-primaria" />
              Inspiração Diária
            </span>
            <p className="font-serif italic text-xs leading-snug text-texto-escuro/90 dark:text-[#F8EFF1]">
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
      <div className="px-6 py-3 border-t border-[#F7EFF1] dark:border-[#302026] bg-[#FAFAFA] dark:bg-[#140D10] flex items-center justify-between text-[11px] text-[#9E8C90] dark:text-[#7D666D]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sucesso animate-pulse" />
          <span>v1.0.0</span>
        </span>
        <span className="text-[10px] font-medium text-texto-claro/80 dark:text-[#7D666D]">
          Isis Store &bull; Admin
        </span>
      </div>
    </aside>
  );
}
