"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface OrdersDistributionDonutProps {
  items?: StatusDistributionItem[];
  totalOrders?: number;
}

const DEFAULT_DISTRIBUTION: StatusDistributionItem[] = [
  { status: "paid", label: "Pago / Enviado", count: 87, percentage: 68, color: "#E08CA3" },
  { status: "pending", label: "Pendente", count: 15, percentage: 12, color: "#F59E0B" },
  { status: "processing", label: "Processando", count: 10, percentage: 8, color: "#3B82F6" },
  { status: "cancelled", label: "Cancelado", count: 8, percentage: 6, color: "#EF4444" },
  { status: "refunded", label: "Reembolso", count: 8, percentage: 6, color: "#9333EA" },
];

export function OrdersDistributionDonut({
  items = DEFAULT_DISTRIBUTION,
  totalOrders,
}: OrdersDistributionDonutProps) {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const dataItems = items && items.length > 0 ? items : DEFAULT_DISTRIBUTION;
  const calculatedTotal = totalOrders ?? dataItems.reduce((acc, curr) => acc + curr.count, 0);

  // Geometria do Donut SVG
  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcular offsets cumulativos apenas para itens com percentage > 0
  let cumulativePercentage = 0;
  const slices = dataItems
    .filter((item) => item.percentage > 0)
    .map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
      cumulativePercentage += item.percentage;
      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });

  const hasAnyData = calculatedTotal > 0 && slices.length > 0;

  return (
    <div className="bg-white dark:bg-[#1E1518] border border-[#F0E5E7] dark:border-[#332228] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between select-none h-full">
      {/* Cabeçalho */}
      <div className="pb-3 border-b border-[#F7EFF1] dark:border-[#2C1D23]">
        <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro dark:text-[#F8EFF1]">
          Distribuição de Pedidos
        </h2>
        <p className="text-xs text-texto-claro dark:text-[#A89299] mt-0.5">
          Divisão percentual por status de faturamento e logística.
        </p>
      </div>

      {/* Donut Chart Central - Layout vertical empilhado e responsivo */}
      <div className="py-4 flex flex-col items-center justify-center gap-5 flex-1">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center flex-shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full transform -rotate-90 overflow-visible"
          >
            {/* Círculo base de fundo */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-[#F7EFF1] dark:text-[#2E2025]"
              strokeWidth={strokeWidth}
            />

            {/* Slices com dados reais (somente se percentual > 0) */}
            {hasAnyData &&
              slices.map((slice) => {
                const isHovered = hoveredStatus === slice.status;
                return (
                  <circle
                    key={slice.status}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredStatus(slice.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                );
              })}
          </svg>

          {/* Núcleo Central com Total de Pedidos */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-texto-escuro dark:text-[#F8EFF1] leading-none">
              {calculatedTotal}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-texto-claro dark:text-[#A89299] uppercase tracking-wider mt-1">
              {calculatedTotal === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
        </div>

        {/* Legenda Lateral com Percentuais - Colunas separadas para evitar colisão */}
        <div className="w-full space-y-1 pt-1">
          {dataItems.map((item) => {
            const isHovered = hoveredStatus === item.status;
            return (
              <div
                key={item.status}
                onMouseEnter={() => setHoveredStatus(item.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer",
                  isHovered
                    ? "bg-[#FDF2F4] dark:bg-[#2C1A20]"
                    : "hover:bg-[#FAF7F8] dark:hover:bg-[#251A1E]"
                )}
              >
                {/* Lado Esquerdo: Indicador colorido + Nome */}
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className={cn(
                      "font-medium truncate",
                      isHovered
                        ? "text-primaria font-semibold"
                        : "text-texto-escuro dark:text-[#F8EFF1]"
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Lado Direito: Unidades + Percentual */}
                <div className="flex items-center gap-2.5 flex-shrink-0 text-right">
                  <span className="text-[11px] text-texto-claro dark:text-[#A89299] font-mono">
                    {item.count} un
                  </span>
                  <span
                    className={cn(
                      "font-bold text-xs font-mono min-w-[34px] text-right",
                      isHovered ? "text-primaria" : "text-texto-escuro dark:text-[#F8EFF1]"
                    )}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
