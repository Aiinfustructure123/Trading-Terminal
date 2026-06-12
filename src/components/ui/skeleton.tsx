import { cn } from "@/lib/utils";

/** Shimmer-free, zero-layout-shift skeleton. Reserve exact final dimensions. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse-soft rounded-sm bg-panel-2", className)} aria-hidden />;
}
