"use client";

import { useState } from "react";
import type { ConvictionScore, ScoreComponentKey } from "@/lib/datasources/types";
import { COMPONENT_COLORS, ConvictionRing } from "@/components/ui/conviction-ring";
import { cn } from "@/lib/utils";

/* Full explainable breakdown: ring + per-component value / sub-score /
   weight / plain-English rationale. Used in the detail panel and inside
   the ring's click-to-expand modal. No black boxes. */
export function ScoreBreakdown({ score, ringSize = 120 }: { score: ConvictionScore; ringSize?: number }) {
  const [active, setActive] = useState<ScoreComponentKey | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ConvictionRing score={score} size={ringSize} interactive activeKey={active} onHoverKey={setActive} onSegmentClick={(k) => setActive(k)} />
        <div className="flex flex-col gap-1">
          <div className="eyebrow">Composite Conviction</div>
          <div className="font-mono text-3xl font-semibold tabular-nums text-ink">{score.composite}<span className="text-base text-muted">/100</span></div>
          <p className="max-w-[28ch] text-xs text-muted">Weighted blend of the components below. Hover or tap a segment to isolate it.</p>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {score.components.map((c) => (
          <button
            key={c.key}
            type="button"
            onMouseEnter={() => setActive(c.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(c.key)}
            className={cn(
              "flex flex-col gap-1.5 py-2.5 text-left transition-colors",
              active && active !== c.key ? "opacity-40" : "opacity-100",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: COMPONENT_COLORS[c.key] }} />
                <span className="font-display text-sm font-medium text-ink">{c.label}</span>
                <span className="font-mono text-[10px] text-muted">w {(c.weight * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted">{c.valueLabel}</span>
                <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: COMPONENT_COLORS[c.key] }}>{c.subScore}</span>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-border-strong">
              <div className="h-full rounded-full transition-all" style={{ width: `${c.subScore}%`, background: COMPONENT_COLORS[c.key] }} />
            </div>
            <p className="text-[11px] leading-relaxed text-muted">{c.rationale}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
