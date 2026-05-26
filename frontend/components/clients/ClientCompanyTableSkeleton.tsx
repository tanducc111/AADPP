import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export function ClientCompanyTableSkeleton() {
  return (
    <div className="table-surface p-4">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, skeletonIndex) => (
          <div className="grid gap-3 md:grid-cols-6" key={skeletonIndex}>
            <LoadingSkeleton className="h-5 md:col-span-2" />
            <LoadingSkeleton className="h-5" />
            <LoadingSkeleton className="h-5" />
            <LoadingSkeleton className="h-5" />
            <LoadingSkeleton className="h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}
