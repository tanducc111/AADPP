import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionHeaderProps = {
  actions?: ReactNode;
  badge: string;
  className?: string;
  description?: string;
  title: string;
};

export function SectionHeader({
  actions,
  badge,
  className,
  description,
  title,
}: SectionHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/80 bg-white/72 p-6 shadow-sm backdrop-blur md:p-7",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <span className="section-label">{badge}</span>
          <h1 className="mt-4 break-words text-3xl font-black leading-tight text-foreground md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
