"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type AnimatedContainerProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
};

export function AnimatedContainer({
  children,
  className,
  delay = 0,
  ...motionProps
}: AnimatedContainerProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(className)}
      initial={{ opacity: 0, y: 14 }}
      transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

type AnimatedListProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      animate="visible"
      className={cn(className)}
      initial="hidden"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type AnimatedListItemProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
};

export function AnimatedListItem({
  children,
  className,
  ...motionProps
}: AnimatedListItemProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
