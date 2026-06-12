import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DeltaValue({
  value,
  className,
  digits = 1,
  showArrow = false,
}: {
  value: number;
  className?: string;
  digits?: number;
  showArrow?: boolean;
}) {
  const up = value > 0;
  const flat = Math.abs(value) < 0.005;
  return (
    <span
      className={cn(
        "tabular",
        flat ? "text-muted" : up ? "text-profit" : "text-danger",
        className,
      )}
    >
      {showArrow && !flat && (up ? "▲" : "▼")} {formatPct(value, { digits })}
    </span>
  );
}
