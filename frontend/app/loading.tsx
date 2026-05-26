export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      <div className="flex items-center gap-3 rounded-md border border-border bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        Loading workspace...
      </div>
    </div>
  );
}
