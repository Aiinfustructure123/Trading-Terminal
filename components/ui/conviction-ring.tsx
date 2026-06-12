"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export type ConvictionSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type ConvictionRingProps = {
  size?: number;
  strokeWidth?: number;
  score: number;
  segments: ConvictionSegment[];
  onSegmentClick?: (segment: ConvictionSegment) => void;
  className?: string;
  showCenterScore?: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function ConvictionRing({
  size = 120,
  strokeWidth = 10,
  score,
  segments,
  onSegmentClick,
  className,
  showCenterScore = true,
}: ConvictionRingProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 0.024;
  const dashBySegment = (circumference / segments.length) * (1 - gap);
  const gapLength = (circumference / segments.length) * gap;
  const normalizedScore = clamp(score, 0, 100);

  const scoreColor = useMemo(() => {
    if (normalizedScore >= 75) return "var(--profit)";
    if (normalizedScore >= 45) return "var(--warn)";
    return "var(--danger)";
  }, [normalizedScore]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(107, 116, 136, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((segment, index) => {
          const offset = (dashBySegment + gapLength) * index;
          const opacity = !activeKey || activeKey === segment.key ? 1 : 0.28;

          return (
            <circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashBySegment} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              fill="none"
              className="cursor-pointer transition-opacity duration-150"
              style={{ opacity }}
              onMouseEnter={() => setActiveKey(segment.key)}
              onMouseLeave={() => setActiveKey(null)}
              onClick={() => onSegmentClick?.(segment)}
              role="button"
              aria-label={`${segment.label} segment`}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSegmentClick?.(segment);
                }
              }}
            />
          );
        })}
      </svg>
      {showCenterScore ? (
        <div className="absolute flex flex-col items-center justify-center leading-none">
          <span className="eyebrow">Conviction</span>
          <span className="data-mono text-xl font-semibold" style={{ color: scoreColor }}>
            {Math.round(normalizedScore)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
