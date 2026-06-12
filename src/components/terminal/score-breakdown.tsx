"use client";

import * as React from "react";
import { ConvictionScore } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";
import { ringColor, ConvictionRing } from "./conviction-ring";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The "no black boxes" view: every component with its raw input, sub-score,
 * weight, weighted contribution, and plain-English reasoning.
 */
export function ScoreBreakdownTable({
  score,
  onHoverComponent,
  className,
}: {
  score: ConvictionScore;
  onHoverComponent?: (key: string | null) => void;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-edge", className)}>
      {score.components.map((c) => {
        const contribution = c.subScore * c.weight;
        return (
          <div
            key={c.key}
            className="px-3 py-2.5 transition-colors hover:bg-panel-2/60"
            onMouseEnter={() => onHoverComponent?.(c.key)}
            onMouseLeave={() => onHoverComponent?.(null)}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-ink">{c.label}</span>
              <span className="num text-2xs text-muted">w {(c.weight * 100).toFixed(0)}%</span>
              <span className="num ml-auto text-xs" style={{ color: ringColor(c.subScore) }}>
                {c.subScore.toFixed(0)}
                <span className="text-muted">/100</span>
              </span>
              <span className="num w-14 text-right text-2xs text-muted">
                +{contribution.toFixed(1)} pts
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-edge">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${c.subScore}%`,
                  background: ringColor(c.subScore),
                  opacity: 0.85,
                }}
              />
            </div>
            <div className="num mt-1.5 text-2xs text-muted">{c.input}</div>
            <p className="mt-1 text-2xs leading-4 text-muted/90">{c.explanation}</p>
          </div>
        );
      })}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="eyebrow">Composite</span>
        <span className="num ml-auto text-sm font-semibold" style={{ color: ringColor(score.composite) }}>
          {score.composite.toFixed(1)}
        </span>
        <span className="num text-2xs text-muted">= Σ sub-score × weight</span>
      </div>
    </div>
  );
}

/** Dialog wrapper — opened by clicking any Conviction Ring. */
export function ScoreBreakdownDialog({
  score,
  symbol,
  open,
  onOpenChange,
}: {
  score: ConvictionScore | null;
  symbol?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [hover, setHover] = React.useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        {score ? (
          <>
            <div className="flex items-center gap-4 border-b border-edge px-5 py-4">
              <ConvictionRing score={score} size={72} highlightKey={hover} />
              <div>
                <DialogTitle className="text-sm font-semibold text-ink">
                  Conviction breakdown{symbol ? ` — $${symbol}` : ""}
                </DialogTitle>
                <DialogDescription className="mt-1 text-2xs text-muted">
                  Exact inputs, weights, and reasoning behind the composite.
                  Nothing is hidden; the ring is the sum of these rows.
                </DialogDescription>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <ScoreBreakdownTable score={score} onHoverComponent={setHover} />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
