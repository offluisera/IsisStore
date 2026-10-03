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
    colorClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-900/40",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700/60",
  },
  {
    label: "Gerenciar Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
    colorClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
  },
  {
    label: "Cadastrar Cliente",
    href: "/admin/clientes/novo",
    icon: UserPlus,
    colorClass: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/40",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700/60",
  },
  {
    label: "Configurar Gateway",
    href: "/admin/gateways",
    icon: CreditCard,
    colorClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-900/40",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700/60",
  },
  {
    label: "Ver Relatórios",
    href: "/admin/auditoria",
    icon: BarChart3,
    colorClass: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-900/40",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700/60",
  },
  {
    label: "Configurações da Loja",
    href: "/admin/configuracoes",
    icon: Settings,
    colorClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700/60",
  },
];

export function QuickActions() {
  return (
    <div className="bg-white dark:bg-[#1E1518] border border-[#F0E5E7] dark:border-[#332228] rounded-2xl p-3 sm:p-4 shadow-xs select-none w-full min-w-0">
      {/* Cabeçalho sutil e limpo */}
      <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center flex-shrink-0">
            <Zap className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-texto-escuro dark:text-[#F8EFF1]">
            Ações Rápidas
          </span>
        </div>
        <span className="text-[10px] text-texto-claro/80 dark:text-[#A89299] font-medium">
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
              className={`px-3 py-2 sm:py-2.5 rounded-xl border border-[#F0E5E7] dark:border-[#332228] bg-white dark:bg-[#251A1E] hover:bg-[#FFF5F6]/60 dark:hover:bg-[#2C1E23] ${item.hoverBorder} transition-all duration-150 group flex items-center gap-2.5 text-left shadow-2xs min-h-[44px] min-w-0`}
              title={item.label}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${item.colorClass}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-texto-escuro dark:text-[#F8EFF1] group-hover:text-primaria transition-colors leading-snug break-words">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
