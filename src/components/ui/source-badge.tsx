import { DataSourceKey, getSourceMode, modeToBadgeLabel } from "@/lib/datasources/config";
import { cn } from "@/lib/utils";

type SourceBadgeProps = {
  source: DataSourceKey;
  degraded?: boolean;
  className?: string;
};

export function SourceBadge({ source, degraded = false, className }: SourceBadgeProps) {
  const mode = getSourceMode(source);
  const label = degraded ? "SOURCE DEGRADED" : modeToBadgeLabel(mode);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold tracking-[0.11em]",
        degraded
          ? "border-danger/50 bg-danger/10 text-danger"
          : mode === "live"
            ? "border-signal/60 bg-signal/10 text-signal"
            : "border-warn/60 bg-warn/10 text-warn",
        className,
      )}
    >
      {label}
    </span>
  );
}
