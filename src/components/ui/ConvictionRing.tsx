"use client";

import React, { useState } from "react";
import type { ConvictionScore, ScoreComponent } from "@/lib/datasources/types";
import { cn, scoreColor } from "@/lib/utils";

// ── Segment arc math ─────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number
): string {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

// ── Component ────────────────────────────────────────────────────────────────

interface ConvictionRingProps {
  score: ConvictionScore;
  size?: number;   // diameter in px; defaults to 120
  strokeWidth?: number;
  showLabel?: boolean;
  /** Triggered when user clicks a segment; opens the breakdown panel */
  onSegmentClick?: (component: ScoreComponent) => void;
  className?: string;
}

const GAP = 3; // gap between segments in degrees

export function ConvictionRing({
  score,
  size = 120,
  strokeWidth,
  showLabel = true,
  onSegmentClick,
  className,
}: ConvictionRingProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const sw = strokeWidth ?? Math.max(4, size * 0.1);
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - sw) / 2;

  // Total degrees allocated per weight, with gaps subtracted
  const totalGapDeg = GAP * score.components.length;
  const usableDeg   = 360 - totalGapDeg;

  let currentAngle = 0;
  const segments = score.components.map((comp) => {
    const startAngle = currentAngle;
    const spanDeg    = usableDeg * comp.weight;
    const endAngle   = startAngle + spanDeg;
    currentAngle     = endAngle + GAP;

    // Color: hue from the component sub-score
    const baseColor = (() => {
      if (comp.subScore >= 70) return "#3DDC97";
      if (comp.subScore >= 45) return "#FFB020";
      return "#FF4D5E";
    })();

    return { comp, startAngle, endAngle, baseColor };
  });

  const compositeColor = scoreColor(score.composite);
  const isSmall = size < 40;
  const labelSize = isSmall ? size * 0.32 : size * 0.28;
  const sublabelSize = size * 0.16;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Conviction score ${score.composite.toFixed(0)} — ${score.riskTier} risk`}
      >
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#1C2230"
          strokeWidth={sw}
        />

        {/* Segments */}
        {segments.map(({ comp, startAngle, endAngle, baseColor }) => {
          const isHovered = hoveredKey === comp.key;
          const opacity   = hoveredKey && !isHovered ? 0.35 : 1;
          // Fill the arc proportional to the sub-score
          const filledEnd = startAngle + (endAngle - startAngle) * (comp.subScore / 100);

          return (
            <g key={comp.key}>
              {/* Dimmed full-weight track */}
              <path
                d={describeArc(cx, cy, r, startAngle, endAngle)}
                fill="none"
                stroke={baseColor}
                strokeWidth={sw}
                strokeLinecap="butt"
                opacity={0.15}
              />
              {/* Filled arc */}
              <path
                d={describeArc(cx, cy, r, startAngle, filledEnd)}
                fill="none"
                stroke={baseColor}
                strokeWidth={isHovered ? sw + 2 : sw}
                strokeLinecap="butt"
                opacity={opacity}
                style={{
                  transition: "opacity 150ms ease, stroke-width 150ms ease",
                  filter: isHovered ? `drop-shadow(0 0 6px ${baseColor})` : undefined,
                }}
              />
              {/* Invisible interaction target */}
              {!isSmall && (
                <path
                  d={describeArc(cx, cy, r, startAngle, endAngle)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={sw + 8}
                  strokeLinecap="butt"
                  style={{ cursor: onSegmentClick ? "pointer" : "default" }}
                  onMouseEnter={() => setHoveredKey(comp.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => onSegmentClick?.(comp)}
                  aria-label={`${comp.label}: ${comp.subScore.toFixed(0)}/100`}
                />
              )}
            </g>
          );
        })}

        {/* Center composite number */}
        {showLabel && (
          <>
            <text
              x={cx} y={cy + labelSize * 0.35}
              textAnchor="middle"
              fill={compositeColor}
              fontSize={labelSize}
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {Math.round(score.composite)}
            </text>
            {!isSmall && (
              <text
                x={cx} y={cy + labelSize * 0.35 + sublabelSize + 2}
                textAnchor="middle"
                fill="#6B7488"
                fontSize={sublabelSize}
                fontFamily="Space Grotesk, sans-serif"
                letterSpacing="0.08em"
                textDecoration="none"
                style={{ textTransform: "uppercase" }}
              >
                {score.riskTier}
              </text>
            )}
          </>
        )}
      </svg>

      {/* Tooltip on segment hover */}
      {hoveredKey && !isSmall && (() => {
        const seg = segments.find(s => s.comp.key === hoveredKey);
        if (!seg) return null;
        return (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50
                         glass px-3 py-2 rounded-md text-xs min-w-[160px] text-center shadow-xl">
            <div className="label-eyebrow mb-1">{seg.comp.label}</div>
            <div className="num text-ink font-semibold">{seg.comp.subScore.toFixed(0)}<span className="text-muted">/100</span></div>
            <div className="text-muted mt-1 text-left leading-relaxed" style={{ fontSize: 10 }}>
              {seg.comp.description.slice(0, 100)}…
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Inline variant (for table rows) ─────────────────────────────────────────

export function ConvictionRingInline({ score, size = 20 }: { score: ConvictionScore; size?: number }) {
  return <ConvictionRing score={score} size={size} showLabel={false} strokeWidth={3} />;
}
