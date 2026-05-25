import type * as React from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...cardProps }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}
      {...cardProps}
    />
  );
}

export function CardHeader({ className, ...cardHeaderProps }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...cardHeaderProps} />;
}

export function CardTitle({ className, ...cardTitleProps }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-base font-semibold leading-none text-foreground", className)}
      {...cardTitleProps}
    />
  );
}

export function CardDescription({
  className,
  ...cardDescriptionProps
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm leading-5 text-muted-foreground", className)}
      {...cardDescriptionProps}
    />
  );
}

export function CardContent({ className, ...cardContentProps }: React.ComponentProps<"div">) {
  return <div className={cn("p-5 pt-0", className)} {...cardContentProps} />;
}
