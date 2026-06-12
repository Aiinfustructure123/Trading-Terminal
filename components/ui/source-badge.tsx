import { cn } from "@/lib/utils";
import type { SourceMode } from "@/lib/datasources/types";

type SourceBadgeProps = {
  mode: SourceMode;
  label?: string;
  className?: string;
};

export function SourceBadge({ mode, label, className }: SourceBadgeProps) {
  const copy = label ?? (mode === "live" ? "LIVE" : "SAMPLE DATA");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em]",
        mode === "live"
          ? "border-signal/45 bg-signal/10 text-signal shadow-[0_0_18px_rgba(92,225,230,0.16)]"
          : "border-warn/40 bg-warn/10 text-warn",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          mode === "live" ? "bg-signal" : "bg-warn",
        )}
      />
      {copy}
    </span>
  );
}
