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
  { status: "paid", label: "Pago", count: 87, percentage: 68, color: "#E08CA3" },
  { status: "pending", label: "Pendente", count: 15, percentage: 12, color: "#F59E0B" },
  { status: "processing", label: "Processando", count: 10, percentage: 8, color: "#3B82F6" },
  { status: "canceled", label: "Cancelado", count: 8, percentage: 6, color: "#EF4444" },
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
  const size = 180;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcular offsets cumulativos
  let cumulativePercentage = 0;
  const slices = dataItems.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
    cumulativePercentage += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white border border-[#F0E5E7] rounded-2xl p-6 shadow-xs flex flex-col justify-between select-none">
      {/* Cabeçalho */}
      <div className="pb-4 border-b border-[#F7EFF1]">
        <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro">
          Distribuição de Pedidos
        </h2>
        <p className="text-xs text-texto-claro mt-0.5">
          Divisão percentual por status de faturamento e logística.
        </p>
      </div>

      {/* Donut Chart Central */}
      <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 overflow-visible"
          >
            {/* Círculo base de fundo */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F7EFF1"
              strokeWidth={strokeWidth}
            />

            {/* Slices com cores da marca */}
            {slices.map((slice) => {
              const isHovered = hoveredStatus === slice.status;
              return (
                <circle
                  key={slice.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredStatus(slice.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })}
          </svg>

          {/* Núcleo Central com Total de Pedidos */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-texto-escuro leading-none">
              {calculatedTotal}
            </span>
            <span className="text-[11px] font-semibold text-texto-claro uppercase tracking-wider mt-1">
              pedidos
            </span>
          </div>
        </div>

        {/* Legenda Lateral com Percentuais */}
        <div className="flex-1 w-full space-y-2">
          {dataItems.map((item) => {
            const isHovered = hoveredStatus === item.status;
            return (
              <div
                key={item.status}
                onMouseEnter={() => setHoveredStatus(item.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer",
                  isHovered ? "bg-[#FDF2F4]" : "hover:bg-[#FAF7F8]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      isHovered ? "text-primaria font-semibold" : "text-texto-escuro"
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-texto-claro">
                    {item.count} un
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      isHovered ? "text-primaria" : "text-texto-escuro"
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
