import { cn } from "@/lib/cn";

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn("shimmer-surface rounded-md", className)} />;
}
