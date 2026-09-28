import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primaria/20 border-t-primaria animate-spin" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-3 w-48 rounded-lg opacity-60" />
      </div>
    </div>
  );
}
