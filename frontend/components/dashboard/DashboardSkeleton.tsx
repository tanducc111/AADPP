"use client";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, skeletonIndex) => (
        <div
          className="h-32 animate-pulse rounded-lg border border-border bg-card p-5"
          key={skeletonIndex}
        >
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="mt-5 h-8 w-20 rounded bg-muted" />
          <div className="mt-4 h-3 w-44 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
