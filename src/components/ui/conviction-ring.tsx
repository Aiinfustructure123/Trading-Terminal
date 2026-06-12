"use client";

import { useState } from "react";
import type { ConvictionScore, ScoreComponentKey } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

/* ============================================================
   THE CONVICTION RING — the product's visual identity.
   A segmented circular gauge: one segment per score component,
   segment width = weight, fill = sub-score. Renders at every
   scale (16px table cell → 120px detail header). Hovering a
   segment highlights its component; clicking opens the breakdown.
   ============================================================ */

export const COMPONENT_COLORS: Record<ScoreComponentKey, string> = {
  momentum: "#5CE1E6",
  liquidity: "#62B6FF",
  holders: "#3DDC97",
  volume: "#9B8CFF",
  riskInverse: "#FFB020",
  smartMoney: "#FF8FB1",
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export function ConvictionRing({
  score,
  size = 40,
  interactive = false,
  showValue,
  className,
  onSegmentClick,
  activeKey,
  onHoverKey,
}: {
  score: ConvictionScore;
  size?: number;
  interactive?: boolean;
  showValue?: boolean;
  className?: string;
  onSegmentClick?: (key: ScoreComponentKey) => void;
  activeKey?: ScoreComponentKey | null;
  onHoverKey?: (key: ScoreComponentKey | null) => void;
}) {
  const [hover, setHover] = useState<ScoreComponentKey | null>(null);
  const active = activeKey ?? hover;

  const stroke = Math.max(2, Math.round(size * 0.12));
  const r = (size - stroke) / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const gap = size > 60 ? 6 : size > 28 ? 8 : 4; // degrees between segments
  const total = 360;
  const usable = total - gap * score.components.length;

  let cursor = 0;
  const segs = score.components.map((c) => {
    const span = usable * c.weight;
    const start = cursor;
    const end = cursor + span;
    cursor = end + gap;
    const fillEnd = start + span * (c.subScore / 100);
    return { c, start, end, fillEnd };
  });

  const display = showValue ?? size >= 36;
  const valueColor =
    score.composite >= 70 ? "var(--color-profit)" : score.composite >= 45 ? "var(--color-signal)" : score.composite >= 25 ? "var(--color-warn)" : "var(--color-danger)";

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-0">
        {segs.map(({ c, start, end, fillEnd }) => {
          const dim = active && active !== c.key;
          return (
            <g
              key={c.key}
              style={{ cursor: interactive ? "pointer" : "default", transition: "opacity 120ms" }}
              opacity={dim ? 0.25 : 1}
              onMouseEnter={interactive ? () => { setHover(c.key); onHoverKey?.(c.key); } : undefined}
              onMouseLeave={interactive ? () => { setHover(null); onHoverKey?.(null); } : undefined}
              onClick={interactive ? () => onSegmentClick?.(c.key) : undefined}
            >
              {/* track */}
              <path d={arcPath(cx, cy, r, start, end)} fill="none" stroke="var(--color-border-strong)" strokeWidth={stroke} strokeLinecap="round" />
              {/* fill */}
              {fillEnd > start + 0.5 && (
                <path
                  d={arcPath(cx, cy, r, start, fillEnd)}
                  fill="none"
                  stroke={COMPONENT_COLORS[c.key]}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  style={{
                    filter: active === c.key ? `drop-shadow(0 0 4px ${COMPONENT_COLORS[c.key]})` : undefined,
                    transition: "all 300ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
      {display && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-semibold tabular-nums leading-none" style={{ fontSize: size * 0.3, color: valueColor }}>
            {score.composite}
          </span>
          {size >= 88 && <span className="eyebrow mt-1" style={{ fontSize: 8 }}>Conviction</span>}
        </div>
      )}
    </div>
  );
}
