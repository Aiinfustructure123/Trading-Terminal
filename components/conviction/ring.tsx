"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { ConvictionScore, ScoreComponentKey } from "@/lib/datasources/types";

/**
 * The Conviction Ring — the product's visual identity.
 *
 * A segmented circular gauge: each segment is one score component
 * (momentum, volume, liquidity, holders, risk-inverse). Segment arc length is
 * the component's weight; segment opacity encodes its sub-score. Hovering a
 * segment highlights that component; clicking opens the full breakdown
 * (wired by the parent via onSelectComponent / onOpenBreakdown).
 *
 * Renders identically at every scale — 16px in table rows, 120px on detail.
 */

const COMPONENT_COLORS: Record<ScoreComponentKey, string> = {
  momentum: "#5CE1E6",
  volume: "#7AA2FF",
  liquidity: "#3DDC97",
  holders: "#C792EA",
  riskInverse: "#FFB020",
};

function computeSegments(components: ConvictionScore["components"]) {
  const segments: Array<{
    comp: ConvictionScore["components"][number];
    start: number;
    end: number;
  }> = [];
  let offset = -Math.PI / 2; // start at 12 o'clock
  for (const comp of components) {
    const arc = comp.weight * 2 * Math.PI;
    segments.push({ comp, start: offset, end: offset + arc });
    offset += arc;
  }
  return segments;
}

interface ConvictionRingProps {
  score: ConvictionScore;
  size?: number;
  /** Show the numeric total in the center (auto-hidden below 28px) */
  showValue?: boolean;
  className?: string;
  onSelectComponent?: (key: ScoreComponentKey | null) => void;
  onOpenBreakdown?: () => void;
  /** Externally-controlled highlight (e.g. hovering the breakdown list) */
  highlightKey?: ScoreComponentKey | null;
}

export function ConvictionRing({
  score,
  size = 32,
  showValue,
  className,
  onSelectComponent,
  onOpenBreakdown,
  highlightKey = null,
}: ConvictionRingProps) {
  const [hovered, setHovered] = useState<ScoreComponentKey | null>(null);
  const titleId = useId();
  const active = highlightKey ?? hovered;

  const interactive = size >= 40 && (onSelectComponent || onOpenBreakdown);
  const stroke = Math.max(1.5, size * 0.09);
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = size >= 40 ? circumference * 0.015 : 0;

  const segments = computeSegments(score.components);

  const valueVisible = (showValue ?? size >= 48) && size >= 28;
  const totalRounded = Math.round(score.total);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-labelledby={titleId}
      className={cn("shrink-0 select-none", interactive && "cursor-pointer", className)}
      onClick={interactive ? onOpenBreakdown : undefined}
      onMouseLeave={() => {
        setHovered(null);
        onSelectComponent?.(null);
      }}
    >
      <title id={titleId}>
        Conviction {totalRounded}/100 —{" "}
        {score.components.map((cm) => `${cm.label} ${Math.round(cm.score)}`).join(", ")}
      </title>
      {/* track */}
      <circle cx={c} cy={c} r={r} fill="none" stroke="#1C2230" strokeWidth={stroke} />
      {segments.map(({ comp, start, end }) => {
        const isActive = active === comp.key;
        const isDimmed = active !== null && !isActive;
        // score → arc fill intensity
        const opacity = isDimmed ? 0.15 : 0.25 + (comp.score / 100) * 0.75;
        const x1 = c + r * Math.cos(start + gap / r / 2);
        const y1 = c + r * Math.sin(start + gap / r / 2);
        const x2 = c + r * Math.cos(end - gap / r / 2);
        const y2 = c + r * Math.sin(end - gap / r / 2);
        const largeArc = end - start > Math.PI ? 1 : 0;
        return (
          <path
            key={comp.key}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={COMPONENT_COLORS[comp.key]}
            strokeWidth={isActive ? stroke * 1.35 : stroke}
            strokeLinecap={size >= 40 ? "round" : "butt"}
            opacity={opacity}
            style={{ transition: "opacity 150ms ease, stroke-width 150ms ease" }}
            onMouseEnter={
              interactive
                ? () => {
                    setHovered(comp.key);
                    onSelectComponent?.(comp.key);
                  }
                : undefined
            }
          >
            <title>{`${comp.label}: ${Math.round(comp.score)}/100 (weight ${(comp.weight * 100).toFixed(0)}%)`}</title>
          </path>
        );
      })}
      {valueVisible && (
        <text
          x={c}
          y={c}
          textAnchor="middle"
          dominantBaseline="central"
          fill={totalRounded >= 70 ? "#5CE1E6" : totalRounded >= 45 ? "#E8ECF4" : "#6B7488"}
          fontSize={size * (size >= 80 ? 0.26 : 0.32)}
          fontFamily="var(--font-jetbrains-mono), monospace"
          fontWeight={600}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {totalRounded}
        </text>
      )}
    </svg>
  );
}

export { COMPONENT_COLORS };
