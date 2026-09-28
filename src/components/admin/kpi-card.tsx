import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";
import { MetricSparkline } from "./metric-sparkline";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  iconType?: "sales" | "orders" | "customers" | "products";
  variation?: {
    value: string;
    isPositive?: boolean;
  };
  periodText?: string;
  sparklineData?: number[];
  link?: {
    href: string;
    label: string;
  };
  gradientId?: string;
}

export function KPICard({
  title,
  value,
  icon,
  iconType,
  variation,
  periodText = "em relação ao mês anterior",
  sparklineData = [12, 18, 15, 25, 22, 30, 38],
  link,
  gradientId,
}: KPICardProps) {
  const isPositive = variation ? variation.isPositive ?? true : true;

  // Renderizar ícone por tipo ou elemento JSX
  const renderIcon = () => {
    if (icon) return icon;
    switch (iconType) {
      case "sales":
        return <DollarSign className="w-5 h-5" />;
      case "orders":
        return <ShoppingBag className="w-5 h-5" />;
      case "customers":
        return <Users className="w-5 h-5" />;
      case "products":
        return <Package className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative bg-white border border-[#F0E5E7] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden">
      {/* Topo do Card: Ícone e Link Opcional */}
      <div className="flex items-center justify-between pb-3">
        <div className="w-11 h-11 rounded-xl bg-[#FDF2F4] text-primaria flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 border border-primaria/10">
          {renderIcon()}
        </div>

        {link && (
          <Link
            href={link.href}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primaria hover:text-primaria-hover transition-colors"
          >
            <span>{link.label}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Conteúdo Central: Título e Grande Número */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-texto-claro block">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl font-serif font-bold text-texto-escuro tracking-tight">
          {value}
        </div>
      </div>

      {/* Rodapé do Card: Comparativo e Mini Gráfico Sparkline */}
      <div className="pt-4 mt-2 border-t border-[#F7EFF1] flex items-end justify-between gap-3">
        <div className="flex flex-col">
          {variation && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-bold",
                  isPositive ? "text-sucesso" : "text-alerta"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{variation.value}</span>
              </span>
            </div>
          )}
          <span className="text-[10px] text-texto-claro/80 mt-0.5 leading-tight">
            {periodText}
          </span>
        </div>

        {/* Mini Gráfico Sparkline à Direita */}
        <div className="w-24 sm:w-28 flex-shrink-0">
          <MetricSparkline
            data={sparklineData}
            gradientId={gradientId || `grad-${title.toLowerCase().replace(/\s+/g, "-")}`}
            color="#E08CA3"
            width={100}
            height={40}
          />
        </div>
      </div>

      {/* Brilho decorativo sutil no hover */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primaria/5 blur-2xl group-hover:bg-primaria/10 transition-colors pointer-events-none" />
    </div>
  );
}
