"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ScoreComponent } from "@/lib/datasources/types";

type ConvictionRingProps = {
  size: number;
  score: number;
  components: ScoreComponent[];
  className?: string;
  showCenterValue?: boolean;
  interactive?: boolean;
  onSegmentSelect?: (component: ScoreComponent) => void;
};

const SEGMENT_COLORS = ["#5CE1E6", "#3DDC97", "#FFB020", "#8895AA", "#8C9AFF"];

export function ConvictionRing({
  size,
  score,
  components,
  className,
  showCenterValue = false,
  interactive = false,
  onSegmentSelect,
}: ConvictionRingProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const strokeWidth = size < 24 ? 2 : size < 72 ? 6 : 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalWeight = Math.max(
    components.reduce((sum, component) => sum + component.weight, 0),
    1,
  );
  const gapLength = Math.max(circumference * 0.006, 2);

  const segments = useMemo(() => {
    let progress = 0;

    return components.map((component, index) => {
      const ratio = component.weight / totalWeight;
      const segmentLength = Math.max(circumference * ratio - gapLength, 0);
      const offset = circumference - progress;
      progress += segmentLength + gapLength;

      return {
        ...component,
        segmentLength,
        offset,
        color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      };
    });
  }, [components, circumference, gapLength, totalWeight]);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role={interactive ? "listbox" : "img"}
      aria-label={`Conviction score ${score}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(107, 116, 136, 0.22)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((segment) => {
            const isHovered = hoveredId === segment.id;

            return (
              <circle
                key={segment.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${segment.segmentLength} ${circumference - segment.segmentLength}`}
                strokeDashoffset={segment.offset}
                opacity={hoveredId && !isHovered ? 0.45 : 1}
                style={{ cursor: interactive ? "pointer" : "default" }}
                onMouseEnter={() => {
                  if (interactive) {
                    setHoveredId(segment.id);
                  }
                }}
                onMouseLeave={() => {
                  if (interactive) {
                    setHoveredId(null);
                  }
                }}
                onClick={() => {
                  if (interactive && onSegmentSelect) {
                    onSegmentSelect(segment);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>
      {showCenterValue ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className="data-mono font-semibold leading-none text-ink"
            style={{ fontSize: `${Math.max(Math.round(size * 0.2), 10)}px` }}
          >
            {score}
          </span>
        </div>
      ) : null}
    </div>
  );
}
