import { SourceMode } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

type DataSourceBadgeProps = {
  mode: SourceMode;
  className?: string;
};

export function DataSourceBadge({ mode, className }: DataSourceBadgeProps) {
  const isLive = mode === "live";

  return (
    <span
      className={cn(
        "data-mono inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        isLive
          ? "border-signal/40 text-signal shadow-glow"
          : "border-warn/40 text-warn bg-warn/5",
        className,
      )}
    >
      {isLive ? "LIVE" : "SAMPLE DATA"}
    </span>
  );
}
