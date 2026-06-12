import { cn } from "@/lib/utils";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  /** Override stroke; defaults to trend color (profit/danger). */
  stroke?: string;
}

export function Sparkline({
  values,
  width = 96,
  height = 28,
  className,
  stroke,
}: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;
  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const trendStroke =
    stroke ??
    (values[values.length - 1] >= values[0] ? "var(--profit)" : "var(--danger)");
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={trendStroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
      />
    </svg>
  );
}
