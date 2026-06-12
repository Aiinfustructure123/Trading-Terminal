"use client";

import * as React from "react";
import { ConvictionScore, ScoreComponent } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * The Conviction Ring — the product's visual identity.
 *
 * A segmented circular gauge: one segment per score component, segment arc
 * length ∝ component weight, fill ∝ sub-score. Renders at every scale from
 * 16px table rows to 120px token detail. Below 28px it simplifies to a single
 * composite arc. Hovering a segment reveals the component; clicking opens the
 * full breakdown (via onSegmentClick).
 */

interface ConvictionRingProps {
  score: ConvictionScore | number;
  size?: number;
  className?: string;
  interactive?: boolean;
  onSegmentClick?: (component: ScoreComponent | null) => void;
  /** Highlight a single component key (e.g. while a breakdown row is hovered). */
  highlightKey?: string | null;
}

function compositeOf(score: ConvictionScore | number): number {
  return typeof score === "number" ? score : score.composite;
}

export function ringColor(composite: number): string {
  if (composite >= 65) return "var(--signal)";
  if (composite >= 40) return "var(--warn)";
  return "var(--danger)";
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

export function ConvictionRing({
  score,
  size = 16,
  className,
  interactive = false,
  onSegmentClick,
  highlightKey = null,
}: ConvictionRingProps) {
  const composite = compositeOf(score);
  const components = typeof score === "number" ? null : score.components;
  const simplified = size < 28 || !components;
  const stroke = Math.max(1.5, size * 0.085);
  const r = size / 2 - stroke / 2 - (simplified ? 0 : size * 0.02);
  const c = size / 2;
  const color = ringColor(composite);

  if (simplified) {
    const circumference = 2 * Math.PI * r;
    const filled = (composite / 100) * circumference;
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("shrink-0 -rotate-90", className)}
        role="img"
        aria-label={`Conviction ${Math.round(composite)} of 100`}
      >
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--edge)" strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 600ms ease, stroke 600ms ease" }}
        />
      </svg>
    );
  }

  const gap = 14; // degrees between segments
  const totalSpan = 360 - gap * components.length;

  const segments: { comp: ScoreComponent; start: number; end: number }[] = [];
  for (let i = 0, cursor = gap / 2; i < components.length; i++) {
    const comp = components[i];
    const span = comp.weight * totalSpan;
    segments.push({ comp, start: cursor, end: cursor + span });
    cursor += span + gap;
  }

  const showValue = size >= 44;
  const showCaption = size >= 96;

  return (
    <div
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Conviction ${Math.round(composite)} of 100`}
      >
        {segments.map(({ comp, start, end }) => {
          const dimmed = highlightKey !== null && highlightKey !== comp.key;
          const track = arcPath(c, c, r, start, end);
          const seg = (
            <g
              key={comp.key}
              className={cn(interactive && "cursor-pointer")}
              style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity 200ms ease" }}
              onClick={
                interactive && onSegmentClick ? () => onSegmentClick(comp) : undefined
              }
            >
              <path d={track} fill="none" stroke="var(--edge)" strokeWidth={stroke} strokeLinecap="round" />
              <path
                d={track}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${Math.max(2, comp.subScore)} 100`}
                opacity={0.35 + (comp.subScore / 100) * 0.65}
                style={{ transition: "stroke-dasharray 600ms ease, stroke 600ms ease" }}
              />
              {interactive ? (
                <path
                  d={track}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={stroke * 3}
                  className="hover:stroke-white/5"
                />
              ) : null}
            </g>
          );
          if (!interactive) return seg;
          return (
            <Tooltip key={comp.key} delayDuration={80}>
              <TooltipTrigger asChild>{seg}</TooltipTrigger>
              <TooltipContent side="top">
                <div className="eyebrow !text-signal">{comp.label}</div>
                <div className="num mt-0.5 text-sm text-ink">
                  {comp.subScore.toFixed(0)}
                  <span className="text-muted">/100 · weight {(comp.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-1 text-2xs text-muted">{comp.input}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </svg>
      {showValue ? (
        <button
          type="button"
          tabIndex={interactive ? 0 : -1}
          onClick={interactive && onSegmentClick ? () => onSegmentClick(null) : undefined}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center rounded-full",
            interactive && "cursor-pointer",
          )}
          aria-label="Open score breakdown"
        >
          <span
            className="num font-semibold"
            style={{ fontSize: size * 0.26, color, lineHeight: 1 }}
          >
            {Math.round(composite)}
          </span>
          {showCaption ? (
            <span className="eyebrow mt-1" style={{ fontSize: Math.max(8, size * 0.075) }}>
              Conviction
            </span>
          ) : null}
        </button>
      ) : null}
    </div>
  );
}
