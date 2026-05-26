import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({ action, description, icon: EmptyStateIcon, title }: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-primary/20 bg-gradient-to-br from-white via-white to-blue-50/60 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
        <EmptyStateIcon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-base font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
