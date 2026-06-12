import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Signed percent, color-coded: profit green / danger red / muted flat. */
export function Delta({
  value,
  className,
  muted = false,
}: {
  value: number;
  className?: string;
  muted?: boolean;
}) {
  const tone =
    Math.abs(value) < 0.005 || muted
      ? "text-muted"
      : value > 0
        ? "text-profit"
        : "text-danger";
  return (
    <span className={cn("num", tone, className)}>{formatPercent(value)}</span>
  );
}
