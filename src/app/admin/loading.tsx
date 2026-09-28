import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 select-none">
      {/* 1. Cabeçalho Oficial Isis Store Skeleton com Ações Rápidas no topo */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 pb-4 border-b border-[#F0E5E7]/70 min-w-0 w-full">
        <div className="space-y-2 shrink-0">
          <Skeleton className="h-8 w-64 sm:w-72 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md opacity-70" />
        </div>

        {/* Ações Rápidas Skeleton à Direita */}
        <div className="w-full xl:flex-1 xl:max-w-2xl 2xl:max-w-3xl min-w-0 bg-white border border-[#F0E5E7] rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#F7EFF1]">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-2.5 w-20 rounded-md opacity-60" />
          </div>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Grid de 4 KPI Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#F0E5E7] rounded-2xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-md opacity-60" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-lg opacity-40" />
          </div>
        ))}
      </div>

      {/* 3. Seção Visual: Gráfico de Vendas 7 Dias (8 cols) & Distribuição de Pedidos Donut (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Gráfico de Vendas Skeleton */}
        <div className="xl:col-span-8 bg-white border border-[#F0E5E7] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1]">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md opacity-60" />
            </div>
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>

        {/* Donut Chart Skeleton */}
        <div className="xl:col-span-4 bg-white border border-[#F0E5E7] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-1.5 pb-3 border-b border-[#F7EFF1]">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3 w-52 rounded-md opacity-60" />
          </div>
          <div className="flex justify-center py-4">
            <Skeleton className="w-36 h-36 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-3.5 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Seção Visual: Pedidos Recentes (8 cols) & Notificações (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Tabela de Pedidos Skeleton */}
        <div className="xl:col-span-8 bg-white border border-[#F0E5E7] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1]">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3 w-60 rounded-md opacity-60" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#F7EFF1]">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-7 h-7 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Feed de Notificações Skeleton */}
        <div className="xl:col-span-4 bg-white border border-[#F0E5E7] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1]">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-28 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-md opacity-60" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <div className="space-y-3.5 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                  <Skeleton className="h-3 w-44 rounded-md opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Seção Visual: Mais Vendidos (8 cols) & Dica do Dia (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Mais Vendidos Skeleton */}
        <div className="xl:col-span-8 bg-white border border-[#F0E5E7] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F7EFF1]">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md opacity-60" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <div className="space-y-4 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-5 h-4 rounded-md" />
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-40 rounded-md" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Dica do Dia Skeleton */}
        <div className="xl:col-span-4 bg-[#FFF5F6] border border-[#F9C7D4]/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-3 w-28 rounded-md opacity-60" />
            </div>
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-3 w-4/5 rounded-md opacity-70" />
            <div className="pt-3 space-y-2">
              <Skeleton className="h-3 w-full rounded-md opacity-50" />
              <Skeleton className="h-3 w-5/6 rounded-md opacity-50" />
              <Skeleton className="h-3 w-4/6 rounded-md opacity-50" />
            </div>
          </div>
          <Skeleton className="h-3 w-36 rounded-md opacity-60" />
        </div>
      </div>
    </div>
  );
}
