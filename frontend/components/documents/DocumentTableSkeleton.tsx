export function DocumentTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-lg border border-border lg:block">
        <div className="grid grid-cols-7 gap-4 bg-muted px-4 py-3">
          {Array.from({ length: 7 }).map((_, columnIndex) => (
            <div className="h-4 rounded bg-background" key={columnIndex} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div className="grid grid-cols-7 gap-4 border-t border-border px-4 py-4" key={rowIndex}>
            {Array.from({ length: 7 }).map((__, columnIndex) => (
              <div className="h-4 rounded bg-muted" key={columnIndex} />
            ))}
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:hidden">
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <div className="rounded-lg border border-border p-4" key={rowIndex}>
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="mt-4 h-4 rounded bg-muted" />
            <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
