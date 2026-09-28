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
    <div className="bg-white border border-[#F0E5E7] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between select-none">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#F7EFF1]">
        <div className="w-8 h-8 rounded-xl bg-primaria/10 text-primaria flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro">
            Ações Rápidas
          </h2>
          <p className="text-xs text-texto-claro">
            Atalhos operacionais diretos para o fluxo diário
          </p>
        </div>
      </div>

      {/* Grid de 6 Atalhos Funcionais */}
      <div className="grid grid-cols-2 gap-2.5 pt-4">
        {ACTIONS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`p-3 rounded-xl border border-[#F0E5E7] bg-white hover:bg-[#FFF5F6]/40 ${item.hoverBorder} transition-all duration-200 group flex items-center gap-2.5 text-left shadow-2xs`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border group-hover:scale-105 transition-transform ${item.colorClass}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-texto-escuro group-hover:text-primaria transition-colors leading-tight line-clamp-2">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
