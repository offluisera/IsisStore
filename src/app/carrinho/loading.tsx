import { Skeleton } from "@/components/ui/skeleton";

export default function CarrinhoLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-md opacity-70" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Itens Skeleton */}
        <div className="lg:col-span-8 bg-fundo-card p-6 rounded-3xl border border-borda space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-borda/60 last:border-0">
              <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          ))}
        </div>

        {/* Resumo Skeleton */}
        <div className="lg:col-span-4 bg-fundo-card p-6 rounded-3xl border border-borda space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md mt-4" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
