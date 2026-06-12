"use client";

import * as React from "react";
import type { ConvictionScore, ScoreComponent } from "@/lib/datasources";
import { cn } from "@/lib/utils";

const GAP_DEG = 6; // gap between segments

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

/** Map a 0–100 sub-score to a signal color. */
function scoreColor(score: number) {
  if (score >= 66) return "rgb(var(--profit))";
  if (score >= 40) return "rgb(var(--signal))";
  if (score >= 22) return "rgb(var(--warn))";
  return "rgb(var(--danger))";
}

function compositeColor(score: number) {
  if (score >= 70) return "text-profit";
  if (score >= 50) return "text-signal";
  if (score >= 30) return "text-warn";
  return "text-danger";
}

export interface ConvictionRingProps {
  score: ConvictionScore;
  size?: number;
  interactive?: boolean;
  showValue?: boolean;
  className?: string;
  /** Externally controlled highlight (e.g. hovering a breakdown row). */
  activeKey?: ScoreComponent["key"] | null;
  onActiveKeyChange?: (key: ScoreComponent["key"] | null) => void;
  onSegmentClick?: (component: ScoreComponent) => void;
  ariaLabel?: string;
}

export function ConvictionRing({
  score,
  size = 40,
  interactive = false,
  showValue = true,
  className,
  activeKey: controlledActive,
  onActiveKeyChange,
  onSegmentClick,
  ariaLabel,
}: ConvictionRingProps) {
  const [internalActive, setInternalActive] = React.useState<ScoreComponent["key"] | null>(null);
  const active = controlledActive !== undefined ? controlledActive : internalActive;
  const setActive = (k: ScoreComponent["key"] | null) => {
    if (onActiveKeyChange) onActiveKeyChange(k);
    if (controlledActive === undefined) setInternalActive(k);
  };

  const components = score.components;
  const n = components.length;
  const stroke = Math.max(2, size * 0.11);
  const r = (size - stroke) / 2 - 0.5;
  const cx = size / 2;
  const cy = size / 2;
  const segSweep = 360 / n - GAP_DEG;
  const tiny = size < 28;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel ?? `Conviction ${score.composite} of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-0">
        {components.map((c, i) => {
          const segStart = i * (360 / n) + GAP_DEG / 2;
          const segEnd = segStart + segSweep;
          const fillEnd = segStart + (segSweep * c.score) / 100;
          const isActive = active === c.key;
          const dim = active != null && !isActive;
          return (
            <g key={c.key}>
              {/* track */}
              <path
                d={arcPath(cx, cy, r, segStart, segEnd)}
                fill="none"
                stroke="rgb(var(--edge))"
                strokeWidth={stroke}
                strokeLinecap="round"
              />
              {/* fill */}
              <path
                d={arcPath(cx, cy, r, segStart, Math.max(fillEnd, segStart + 0.01))}
                fill="none"
                stroke={scoreColor(c.score)}
                strokeWidth={isActive ? stroke + 1.5 : stroke}
                strokeLinecap="round"
                style={{
                  opacity: dim ? 0.3 : 1,
                  transition: "opacity 150ms ease, stroke-width 150ms ease",
                }}
              />
              {/* hit area for interaction */}
              {interactive && (
                <path
                  d={arcPath(cx, cy, r, segStart, segEnd)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={stroke + 8}
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(c.key)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => onSegmentClick?.(c)}
                  tabIndex={0}
                  onFocus={() => setActive(c.key)}
                  onBlur={() => setActive(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSegmentClick?.(c);
                    }
                  }}
                  role="button"
                  aria-label={`${c.label}: ${c.score} of 100. ${c.explanation}`}
                />
              )}
            </g>
          );
        })}
      </svg>
      {showValue && !tiny && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn("tabular font-semibold leading-none", compositeColor(score.composite))}
            style={{ fontSize: Math.max(9, size * 0.3) }}
          >
            {score.composite}
          </span>
          {size >= 72 && <span className="eyebrow mt-1 text-[9px]">Conviction</span>}
        </div>
      )}
    </div>
  );
}
