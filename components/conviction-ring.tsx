"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ConvictionSegment } from "@/lib/datasources/types";

const colors: Record<ConvictionSegment["color"], string> = {
  signal: "var(--signal)",
  profit: "var(--profit)",
  warn: "var(--warn)",
  danger: "var(--danger)"
};

const sizeMap = {
  xs: 16,
  sm: 32,
  md: 64,
  lg: 120
};

type ConvictionRingProps = {
  score: number;
  segments: ConvictionSegment[];
  size?: keyof typeof sizeMap;
  className?: string;
  showScore?: boolean;
  onOpenBreakdown?: (segment?: ConvictionSegment) => void;
};

export function ConvictionRing({
  score,
  segments,
  size = "md",
  className,
  showScore = size !== "xs",
  onOpenBreakdown
}: ConvictionRingProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const dimension = sizeMap[size];
  const stroke = Math.max(2, dimension * 0.095);
  const radius = dimension / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.max(0, Math.min(100, score));

  const weightedSegments = useMemo(() => {
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0) || 1;
    return segments.reduce<{
      items: Array<ConvictionSegment & { dashArray: string; dashOffset: number; isActive: boolean }>;
      offset: number;
    }>(
      (accumulator, segment) => {
        const share = segment.weight / totalWeight;
        const segmentLength = circumference * share * (segment.value / 100);
        const emptyLength = circumference * share - segmentLength;

        return {
          items: [
            ...accumulator.items,
            {
              ...segment,
              dashArray: `${segmentLength} ${circumference - segmentLength}`,
              dashOffset: -accumulator.offset,
              isActive: activeKey === segment.key
            }
          ],
          offset: accumulator.offset + segmentLength + emptyLength + circumference * 0.012
        };
      },
      { items: [], offset: 0 }
    ).items;
  }, [activeKey, circumference, segments]);

  return (
    <button
      type="button"
      aria-label={`Conviction score ${Math.round(normalizedScore)}. Open score breakdown.`}
      className={cn(
        "group relative inline-grid place-items-center rounded-full focus-visible:outline-offset-4",
        className
      )}
      style={{ width: dimension, height: dimension }}
      onClick={() => onOpenBreakdown?.()}
    >
      <svg
        aria-hidden="true"
        className="-rotate-90 overflow-visible"
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        width={dimension}
      >
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          fill="none"
          r={radius}
          stroke="rgba(107, 116, 136, 0.2)"
          strokeWidth={stroke}
        />
        {weightedSegments.map((segment) => (
          <circle
            key={segment.key}
            cx={dimension / 2}
            cy={dimension / 2}
            fill="none"
            r={radius}
            stroke={colors[segment.color]}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
            strokeLinecap="round"
            strokeOpacity={activeKey && !segment.isActive ? 0.28 : 1}
            strokeWidth={segment.isActive ? stroke * 1.28 : stroke}
            className="cursor-pointer transition-all duration-150"
            onClick={(event) => {
              event.stopPropagation();
              onOpenBreakdown?.(segment);
            }}
            onMouseEnter={() => setActiveKey(segment.key)}
            onMouseLeave={() => setActiveKey(null)}
          />
        ))}
      </svg>
      {showScore ? (
        <span className="data-text absolute text-[0.34em] font-bold text-ink" style={{ fontSize: dimension * 0.22 }}>
          {Math.round(normalizedScore)}
        </span>
      ) : null}
    </button>
  );
}
