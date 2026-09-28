import { Skeleton } from "@/components/ui/skeleton";

export default function ProdutosLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Banner Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borda space-y-3">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-lg opacity-70" />
      </div>

      {/* Grid with Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-borda h-fit">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-6 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-borda p-4 space-y-4 shadow-2xs"
            >
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
