import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-borda space-y-3">
        <Skeleton className="h-7 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md opacity-70" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-borda space-y-3">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded-md opacity-60" />
          </div>
        ))}
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-borda space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-borda space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
