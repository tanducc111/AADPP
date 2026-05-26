"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type MetricCardProps = {
  accentClassName?: string;
  description: string;
  icon: LucideIcon;
  label: string;
  meta?: ReactNode;
  value: string;
};

export function MetricCard({
  accentClassName,
  description,
  icon: MetricIcon,
  label,
  meta,
  value,
}: MetricCardProps) {
  return (
    <motion.article
      className="premium-card group rounded-lg p-5"
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black leading-none text-foreground">{value}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/10 transition-transform duration-200 group-hover:scale-105",
            accentClassName,
          )}
        >
          <MetricIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="relative mt-5 flex items-center justify-between gap-3">
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        {meta}
      </div>
    </motion.article>
  );
}
