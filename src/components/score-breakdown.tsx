"use client";

import * as React from "react";
import type { ConvictionScore, ScoreComponent, TokenSummary } from "@/lib/datasources";
import { ConvictionRing } from "@/components/conviction-ring";
import { Eyebrow } from "@/components/panel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function barColor(score: number) {
  if (score >= 66) return "bg-profit";
  if (score >= 40) return "bg-signal";
  if (score >= 22) return "bg-warn";
  return "bg-danger";
}

export function ScoreBreakdown({
  score,
  className,
}: {
  score: ConvictionScore;
  className?: string;
}) {
  const [active, setActive] = React.useState<ScoreComponent["key"] | null>(null);

  return (
    <div className={cn("grid gap-5 md:grid-cols-[160px_1fr]", className)}>
      <div className="flex flex-col items-center justify-start gap-3">
        <ConvictionRing
          score={score}
          size={132}
          interactive
          activeKey={active}
          onActiveKeyChange={setActive}
        />
        <p className="max-w-[160px] text-center text-[11px] text-muted">
          Composite of {score.components.length} weighted, observable components. Hover a row or segment.
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-edge">
        {score.components.map((c) => {
          const isActive = active === c.key;
          return (
            <li
              key={c.key}
              className={cn(
                "flex flex-col gap-1.5 rounded-sm px-2 py-2.5 transition-colors",
                isActive && "bg-panel-2",
              )}
              onMouseEnter={() => setActive(c.key)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[13px] text-ink">{c.label}</span>
                  <span className="eyebrow text-[10px]">wt {(c.weight * 100).toFixed(0)}%</span>
                </div>
                <span className="tabular text-[13px] font-semibold text-ink">{c.score}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                <div
                  className={cn("h-full rounded-full transition-all", barColor(c.score))}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12px] text-muted">{c.explanation}</span>
                <span className="tabular shrink-0 text-[11px] text-muted">{c.rawLabel}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Click a ring anywhere → full breakdown modal. The explainability contract. */
export function ScoreBreakdownDialog({
  token,
  trigger,
}: {
  token: TokenSummary;
  trigger: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>
              {token.symbol} · Conviction {token.conviction.composite}/100
            </DialogTitle>
          </div>
          <Eyebrow>How this score is computed</Eyebrow>
        </DialogHeader>
        <ScoreBreakdown score={token.conviction} />
        <p className="mt-1 border-t border-edge pt-3 text-[11px] text-muted">
          Every number here is derived from observable on-chain & market data. No price prediction is implied —
          this is a relative ranking, not a probability of return.
        </p>
      </DialogContent>
    </Dialog>
  );
}
