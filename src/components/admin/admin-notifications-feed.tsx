import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Package,
  ShoppingBag,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationFeedItem {
  id: string;
  type: "order" | "payment" | "stock" | "customer" | "audit";
  title: string;
  description: string;
  timestamp: string;
  href: string;
}

interface AdminNotificationsFeedProps {
  notifications: NotificationFeedItem[];
}

export function AdminNotificationsFeed({
  notifications,
}: AdminNotificationsFeedProps) {
  const getIconMeta = (type: NotificationFeedItem["type"]) => {
    switch (type) {
      case "order":
        return {
          icon: ShoppingBag,
          bgClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
        };
      case "payment":
        return {
          icon: CheckCircle2,
          bgClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40",
        };
      case "stock":
        return {
          icon: AlertTriangle,
          bgClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-900/40",
        };
      case "customer":
        return {
          icon: UserCheck,
          bgClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-900/40",
        };
      case "audit":
        return {
          icon: ShieldCheck,
          bgClass: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-900/40",
        };
      default:
        return {
          icon: Package,
          bgClass: "bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-800",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E1518] border border-[#F0E5E7] dark:border-[#332228] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full select-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primaria/10 dark:bg-primaria/20 text-primaria flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
              Notificações
            </h2>
            <p className="text-xs text-texto-claro dark:text-[#A89299]">
              Feed de eventos, pedidos e auditoria em tempo real
            </p>
          </div>
        </div>

        <Link
          href="/admin/auditoria"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primaria hover:text-primaria-hover transition-colors group"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Lista de Notificações */}
      <div className="divide-y divide-[#F7EFF1] dark:divide-[#2C1D23] pt-2 flex-1 overflow-y-auto max-h-[360px]">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-texto-claro dark:text-[#A89299] space-y-1">
            <Bell className="w-8 h-8 text-primaria/30 mx-auto" />
            <p className="font-semibold text-texto-escuro dark:text-[#F8EFF1]">
              Sem novas notificações
            </p>
            <p className="text-[11px]">
              Alertas de pedidos, estoque e auditoria serão listados aqui.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const { icon: Icon, bgClass } = getIconMeta(item.type);

            return (
              <Link
                key={item.id}
                href={item.href}
                className="py-3 px-2 flex items-start gap-3 rounded-xl hover:bg-[#FFF5F6]/50 dark:hover:bg-[#251A1E] transition-colors group -mx-2"
              >
                {/* Ícone Contextual */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs mt-0.5 group-hover:scale-105 transition-transform",
                    bgClass
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Conteúdo da Notificação */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-texto-escuro dark:text-[#F8EFF1] truncate group-hover:text-primaria transition-colors">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-texto-claro/80 dark:text-[#A89299] flex-shrink-0 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-texto-claro dark:text-[#A89299] truncate mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Seta indicativa de clique */}
                <ChevronRight className="w-4 h-4 text-texto-claro/40 dark:text-[#A89299]/50 group-hover:text-primaria group-hover:translate-x-0.5 transition-all self-center shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
