import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "gradient-primary accent-shadow text-primary-foreground hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:brightness-95",
        destructive:
          "bg-destructive text-white shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90 active:translate-y-0",
        outline:
          "border border-input bg-white/80 text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-secondary/80",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ asChild = false, className, size, variant, ...buttonProps }: ButtonProps) {
  const ButtonComponent = asChild ? Slot : "button";

  return (
    <ButtonComponent
      className={cn(buttonVariants({ variant, size, className }))}
      {...buttonProps}
    />
  );
}

export { buttonVariants };
