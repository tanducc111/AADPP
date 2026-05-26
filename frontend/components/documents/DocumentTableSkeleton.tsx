import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export function DocumentTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="table-surface hidden overflow-hidden lg:block">
        <div className="grid grid-cols-7 gap-4 bg-slate-50 px-4 py-3">
          {Array.from({ length: 7 }).map((_, columnIndex) => (
            <LoadingSkeleton className="h-4" key={columnIndex} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div className="grid grid-cols-7 gap-4 border-t border-border/80 px-4 py-4" key={rowIndex}>
            {Array.from({ length: 7 }).map((__, columnIndex) => (
              <LoadingSkeleton className="h-4" key={columnIndex} />
            ))}
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:hidden">
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <div className="premium-card rounded-lg p-4" key={rowIndex}>
            <LoadingSkeleton className="h-5 w-2/3" />
            <LoadingSkeleton className="mt-4 h-4" />
            <LoadingSkeleton className="mt-2 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
