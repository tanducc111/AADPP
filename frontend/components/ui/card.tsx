import type * as React from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...cardProps }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("premium-card rounded-lg text-card-foreground", className)}
      {...cardProps}
    />
  );
}

export function CardHeader({ className, ...cardHeaderProps }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex flex-col space-y-1.5 p-6", className)} {...cardHeaderProps} />;
}

export function CardTitle({ className, ...cardTitleProps }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-base font-bold leading-none text-foreground", className)}
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
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...cardDescriptionProps}
    />
  );
}

export function CardContent({ className, ...cardContentProps }: React.ComponentProps<"div">) {
  return <div className={cn("relative p-6 pt-0", className)} {...cardContentProps} />;
}
