"use client";

import { clamp } from "@/lib/utils";

/* Half-circle fear/greed gauge with a needle. Color shifts from
   danger (fear) through warn to profit (greed). */
export function FearGreedDial({ value, label, size = 130 }: { value: number; label: string; size?: number }) {
  const v = clamp(value, 0, 100);
  const w = size;
  const h = size * 0.62;
  const cx = w / 2;
  const cy = h - 6;
  const r = w / 2 - 10;

  const polar = (angle: number, radius: number) => {
    const a = (Math.PI * (180 - angle)) / 180;
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  };

  const segs = [
    { from: 0, to: 25, color: "#FF4D5E" },
    { from: 25, to: 45, color: "#FF8F45" },
    { from: 45, to: 55, color: "#FFB020" },
    { from: 55, to: 75, color: "#7CE38B" },
    { from: 75, to: 100, color: "#3DDC97" },
  ];

  const arc = (from: number, to: number) => {
    const a1 = (from / 100) * 180;
    const a2 = (to / 100) * 180;
    const p1 = polar(a1, r);
    const p2 = polar(a2, r);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };

  const needle = polar((v / 100) * 180, r - 6);
  const color = segs.find((s) => v >= s.from && v <= s.to)?.color ?? "#FFB020";

  return (
    <div className="flex flex-col items-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {segs.map((s) => (
          <path key={s.from} d={arc(s.from, s.to)} fill="none" stroke={s.color} strokeWidth={8} strokeLinecap="butt" opacity={0.85} />
        ))}
        <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="var(--color-ink)" strokeWidth={2} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3.5} fill="var(--color-ink)" />
      </svg>
      <div className="-mt-2 flex flex-col items-center">
        <span className="font-mono text-2xl font-semibold tabular-nums" style={{ color }}>
          {Math.round(v)}
        </span>
        <span className="eyebrow" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}
