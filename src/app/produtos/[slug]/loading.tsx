import { Skeleton } from "@/components/ui/skeleton";

export default function ProdutoDetalheLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Galeria Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Informações e Ações Skeleton */}
        <div className="lg:col-span-5 bg-fundo-card p-6 sm:p-8 rounded-3xl border border-borda space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-8 w-4/5 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>

          <div className="space-y-3 pt-4 border-t border-borda">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>

          <div className="pt-4 border-t border-borda space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-4/6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
