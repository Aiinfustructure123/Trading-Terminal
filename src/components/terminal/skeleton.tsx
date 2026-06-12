import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[4px] bg-edge/60", className)}
      aria-hidden
    />
  );
}

/** Standard skeleton fill for a panel body — fixed heights, zero layout shift. */
export function PanelSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5 p-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-7" />
      ))}
    </div>
  );
}
