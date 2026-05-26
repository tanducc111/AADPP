"use client";

import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, skeletonIndex) => (
        <div
          className="premium-card h-36 rounded-lg p-5"
          key={skeletonIndex}
        >
          <LoadingSkeleton className="h-3 w-32" />
          <LoadingSkeleton className="mt-5 h-9 w-24" />
          <LoadingSkeleton className="mt-4 h-3 w-48" />
        </div>
      ))}
    </div>
  );
}
