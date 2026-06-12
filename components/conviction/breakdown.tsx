"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ConvictionScore, ScoreComponentKey } from "@/lib/datasources/types";
import { COMPONENT_COLORS, ConvictionRing } from "./ring";

/**
 * Full score breakdown: every component with its raw input, sub-score, weight,
 * and a plain-English line. This is the "no black boxes" guarantee rendered.
 * Hover sync works both directions with the ring.
 */
export function ScoreBreakdown({
  score,
  className,
  ringSize = 120,
}: {
  score: ConvictionScore;
  className?: string;
  ringSize?: number;
}) {
  const [highlight, setHighlight] = useState<ScoreComponentKey | null>(null);

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start", className)}>
      <div className="flex shrink-0 flex-col items-center gap-1 self-center sm:self-start">
        <ConvictionRing
          score={score}
          size={ringSize}
          highlightKey={highlight}
          onSelectComponent={setHighlight}
        />
        <span className="eyebrow mt-1">Composite</span>
        <span className="font-mono text-xs text-muted">
          Σ (sub-score × weight)
        </span>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col divide-y divide-panel-border">
        {score.components.map((comp) => {
          const active = highlight === comp.key;
          return (
            <li
              key={comp.key}
              onMouseEnter={() => setHighlight(comp.key)}
              onMouseLeave={() => setHighlight(null)}
              className={cn(
                "flex flex-col gap-1 px-2 py-2.5 transition-colors duration-150",
                active && "bg-white/[0.03]"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: COMPONENT_COLORS[comp.key] }}
                />
                <span className="text-sm font-medium">{comp.label}</span>
                <span className="font-mono text-[10px] text-muted">
                  w={comp.weight.toFixed(2)}
                </span>
                <span className="ml-auto font-mono text-sm" data-numeric>
                  {Math.round(comp.score)}
                  <span className="text-muted">/100</span>
                </span>
              </div>
              <div className="ml-4 flex flex-col gap-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-panel-border">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${comp.score}%`,
                      background: COMPONENT_COLORS[comp.key],
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] text-muted" data-numeric>
                  input: {comp.inputValue} · contributes {(comp.score * comp.weight).toFixed(1)} pts
                </span>
                <p className="text-xs leading-relaxed text-ink/80">{comp.reason}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
