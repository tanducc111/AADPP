export function ClientCompanyTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, skeletonIndex) => (
          <div className="grid gap-3 md:grid-cols-6" key={skeletonIndex}>
            <div className="h-5 rounded-md bg-muted md:col-span-2" />
            <div className="h-5 rounded-md bg-muted" />
            <div className="h-5 rounded-md bg-muted" />
            <div className="h-5 rounded-md bg-muted" />
            <div className="h-5 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
