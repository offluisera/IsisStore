"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string; // "06/04"
  dayName?: string; // "Seg"
  amountCents: number; // 70000 -> R$ 700,00
}

interface SalesAreaChartProps {
  data?: DataPoint[];
  periodLabel?: string;
  growth?: {
    percentage: number;
    isPositive: boolean;
  };
}

const DEFAULT_7_DAYS_DATA: DataPoint[] = [
  { date: "06/04", dayName: "Seg", amountCents: 70000 },
  { date: "07/04", dayName: "Ter", amountCents: 120000 },
  { date: "08/04", dayName: "Qua", amountCents: 100000 },
  { date: "09/04", dayName: "Qui", amountCents: 190000 },
  { date: "10/04", dayName: "Sex", amountCents: 230000 },
  { date: "11/04", dayName: "Sáb", amountCents: 290000 },
  { date: "12/04", dayName: "Dom", amountCents: 360000 },
];

export function SalesAreaChart({
  data = DEFAULT_7_DAYS_DATA,
  growth,
}: SalesAreaChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "month">("7d");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatBrl = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const chartData = data && data.length > 0 ? data : DEFAULT_7_DAYS_DATA;

  // Dimensões do gráfico SVG
  const width = 640;
  const height = 220;
  const paddingLeft = 55;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 30;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const highestValue = Math.max(...chartData.map((d) => d.amountCents), 0);
  const maxVal =
    highestValue > 0
      ? Math.max(Math.ceil((highestValue * 1.25) / 5000) * 5000, 40000)
      : 100000;
  const minVal = 0;
  const range = maxVal - minVal || 1;

  // Gerar coordenadas (x, y) para cada ponto
  const points = chartData.map((d, index) => {
    const x =
      paddingLeft +
      (index / (chartData.length - 1)) * innerWidth;
    const y =
      paddingTop +
      innerHeight -
      ((d.amountCents - minVal) / range) * innerHeight;
    return { x, y, ...d };
  });

  // Curva suave cúbica Bezier
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  // Caminho fechado para gradiente de preenchimento
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaD = `${pathD} L ${lastPoint.x} ${paddingTop + innerHeight} L ${firstPoint.x} ${paddingTop + innerHeight} Z`;

  // Linhas guia do eixo Y dinâmicas
  const yTicks = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

  const formatYTick = (cents: number) => {
    if (cents === 0) return "R$ 0";
    if (cents >= 100000) return `R$ ${(cents / 100000).toFixed(0)}.000`;
    return `R$ ${(cents / 100).toFixed(0)}`;
  };

  const totalPeriodRevenue = chartData.reduce((acc, curr) => acc + curr.amountCents, 0);

  return (
    <div className="bg-white border border-[#F0E5E7] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between select-none h-full">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F7EFF1]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-base sm:text-lg text-texto-escuro">
              Vendas dos últimos 7 dias
            </h2>

            {/* Indicador de subida com dados reais */}
            {growth && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors",
                  growth.percentage === 0
                    ? "text-texto-claro bg-[#FAF7F8] border border-[#F0E5E7]"
                    : growth.isPositive
                    ? "text-sucesso bg-sucesso/10"
                    : "text-erro bg-erro/10"
                )}
              >
                {growth.percentage > 0 && growth.isPositive && (
                  <TrendingUp className="w-3 h-3" />
                )}
                {growth.percentage > 0 && !growth.isPositive && (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {growth.percentage > 0
                    ? `${growth.isPositive ? "+" : "-"}${growth.percentage.toFixed(1).replace(".", ",")}%`
                    : "0,0%"}
                </span>
              </span>
            )}
          </div>

          <p className="text-xs text-texto-claro mt-0.5">
            Evolução diária de faturamento confirmado &bull; Total:{" "}
            <span className="font-bold text-primaria">
              {formatBrl(totalPeriodRevenue)}
            </span>
          </p>
        </div>

        {/* Seletor de Período */}
        <div className="relative inline-flex items-center self-start sm:self-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "7d" | "30d" | "month")}
            className="appearance-none bg-[#FAF7F8] hover:bg-[#F5EFF1] text-xs font-semibold text-texto-escuro border border-[#F0E5E7] rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-primaria/20 cursor-pointer transition-colors"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="month">Este mês</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#8E787C] absolute right-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Área do Gráfico SVG - 100% fluida e responsiva sem overflow cortado */}
      <div className="relative pt-3 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E08CA3" stopOpacity={0.4} />
              <stop offset="60%" stopColor="#F9C7D4" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
            </linearGradient>
            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#E08CA3" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Linhas guia horizontais e valores do eixo Y */}
          {yTicks.map((val) => {
            const y =
              paddingTop +
              innerHeight -
              ((val - minVal) / range) * innerHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F3E9EB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#9E8C90"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {formatYTick(val)}
                </text>
              </g>
            );
          })}

          {/* Área preenchida do gradiente */}
          <path d={areaD} fill="url(#salesGradient)" />

          {/* Linha principal com cor da marca */}
          <path
            d={pathD}
            fill="none"
            stroke="#E08CA3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pontos interativos e marcadores de datas */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={p.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Linha vertical de foco no hover */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + innerHeight}
                    stroke="#E08CA3"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.7"
                  />
                )}

                {/* Marcador do Ponto */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="#FFFFFF"
                  stroke="#E08CA3"
                  strokeWidth={isHovered ? 3 : 2}
                  filter={isHovered ? "url(#pointGlow)" : undefined}
                  className="transition-all duration-150"
                />

                {/* Rótulo de Data no Eixo X */}
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? "600" : "400"}
                  fill={isHovered ? "#E08CA3" : "#786467"}
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip flutuante posicionado acima do ponto para não colidir com o cabeçalho */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute transform -translate-x-1/2 bg-texto-escuro text-white text-[11px] rounded-xl px-3 py-1.5 shadow-xl pointer-events-none z-20 whitespace-nowrap animate-in fade-in duration-150"
            style={{
              left: `${Math.min(Math.max((points[hoveredIndex].x / width) * 100, 15), 85)}%`,
              top: `${Math.max(points[hoveredIndex].y - 48, 4)}px`,
            }}
          >
            <div className="font-semibold">
              {points[hoveredIndex].date} &bull; {formatBrl(points[hoveredIndex].amountCents)}
            </div>
            <div className="text-[9px] text-[#F9C7D4] opacity-90">
              Vendas confirmadas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
