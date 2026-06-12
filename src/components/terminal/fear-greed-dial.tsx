"use client";

import { cn } from "@/lib/utils";

/** Semicircular fear/greed gauge: danger → warn → signal sweep with needle. */
export function FearGreedDial({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const w = 84;
  const h = 46;
  const cx = w / 2;
  const cy = h - 4;
  const r = 34;
  const angle = Math.PI * (1 - value / 100);
  const nx = cx + Math.cos(angle) * (r - 5);
  const ny = cy - Math.sin(angle) * (r - 5);

  function arc(from: number, to: number): string {
    const a0 = Math.PI * (1 - from / 100);
    const a1 = Math.PI * (1 - to / 100);
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy - Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy - Math.sin(a1) * r;
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <path d={arc(0, 33)} fill="none" stroke="var(--danger)" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
        <path d={arc(36, 63)} fill="none" stroke="var(--warn)" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
        <path d={arc(66, 100)} fill="none" stroke="var(--signal)" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="var(--ink)"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={{ transition: "all 700ms ease" }}
        />
        <circle cx={cx} cy={cy} r={2.5} fill="var(--ink)" />
      </svg>
      <div>
        <div className="num text-sm font-semibold text-ink">{value}</div>
        <div className="text-2xs text-muted">{label}</div>
      </div>
    </div>
  );
}
