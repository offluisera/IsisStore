import { Skeleton } from "@/components/ui/skeleton";

export default function ContaLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borda space-y-3">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-7 w-56 rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md opacity-70" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-borda space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Content Box Skeleton */}
      <div className="bg-white p-6 rounded-3xl border border-borda space-y-4">
        <Skeleton className="h-5 w-40 rounded-md" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
