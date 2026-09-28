"use client";

interface MetricSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  gradientId?: string;
}

export function MetricSparkline({
  data = [10, 15, 8, 22, 18, 28, 35],
  color = "#E08CA3",
  width = 96,
  height = 42,
  className = "",
  gradientId = "sparkline-grad",
}: MetricSparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }

  const padding = 4;
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  // Mapear pontos para o viewBox
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((val - minVal) / range) * (height - padding * 2);
    return { x, y };
  });

  // Criar curva suave SVG (Cubic Bezier)
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
  const areaD = `${pathD} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;

  return (
    <div className={`relative flex items-center justify-end ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Área preenchida */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Linha da tendência */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ponto terminal com pulso sutil */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3"
          fill={color}
          className="shadow-xs"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="5"
          fill={color}
          opacity="0.3"
          className="animate-ping"
        />
      </svg>
    </div>
  );
}
