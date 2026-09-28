import Link from "next/link";
import {
  Zap,
  PackagePlus,
  ShoppingBag,
  UserPlus,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";

interface ActionItem {
  label: string;
  href: string;
  icon: typeof Zap;
  colorClass: string;
  hoverBorder: string;
}

const ACTIONS: ActionItem[] = [
  {
    label: "Cadastrar Produto",
    href: "/admin/produtos",
    icon: PackagePlus,
    colorClass: "bg-rose-50 text-rose-600 border-rose-100",
    hoverBorder: "hover:border-rose-300",
  },
  {
    label: "Gerenciar Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
  },
  {
    label: "Cadastrar Cliente",
    href: "/admin/clientes",
    icon: UserPlus,
    colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
    hoverBorder: "hover:border-indigo-300",
  },
  {
    label: "Configurar Gateway",
    href: "/admin/gateways",
    icon: CreditCard,
    colorClass: "bg-amber-50 text-amber-600 border-amber-100",
    hoverBorder: "hover:border-amber-300",
  },
  {
    label: "Ver Relatórios",
    href: "/admin/auditoria",
    icon: BarChart3,
    colorClass: "bg-purple-50 text-purple-600 border-purple-100",
    hoverBorder: "hover:border-purple-300",
  },
  {
    label: "Configurações da Loja",
    href: "/admin/configuracoes",
    icon: Settings,
    colorClass: "bg-blue-50 text-blue-600 border-blue-100",
    hoverBorder: "hover:border-blue-300",
  },
];

export function QuickActions() {
  return (
    <div className="bg-white border border-[#F0E5E7] rounded-2xl p-3 sm:p-4 shadow-xs select-none w-full min-w-0">
      {/* Cabeçalho sutil e limpo */}
      <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-[#F7EFF1]">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-primaria/10 text-primaria flex items-center justify-center flex-shrink-0">
            <Zap className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-texto-escuro">
            Ações Rápidas
          </span>
        </div>
        <span className="text-[10px] text-texto-claro/80 font-medium">
          Atalhos operacionais da loja
        </span>
      </div>

      {/* Grid Responsivo de 6 Atalhos: 1 coluna em telas muito estreitas, 2 colunas em mobile/tablet e 3 colunas em desktop */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
        {ACTIONS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-2 sm:py-2.5 rounded-xl border border-[#F0E5E7] bg-white hover:bg-[#FFF5F6]/60 ${item.hoverBorder} transition-all duration-150 group flex items-center gap-2.5 text-left shadow-2xs min-h-[44px] min-w-0`}
              title={item.label}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${item.colorClass}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-texto-escuro group-hover:text-primaria transition-colors leading-snug break-words">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
