"use client";

import React from "react";
import type { ConvictionScore, ScoreComponent } from "@/lib/datasources/types";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { cn } from "@/lib/utils";

function ComponentBar({ comp, highlighted }: { comp: ScoreComponent; highlighted?: boolean }) {
  const color =
    comp.subScore >= 70 ? "#3DDC97" :
    comp.subScore >= 45 ? "#FFB020" : "#FF4D5E";

  return (
    <div className={cn(
      "p-3 rounded-md border transition-all duration-200",
      highlighted ? "border-signal/50 bg-signal/5" : "border-border bg-bg/30"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{comp.label}</span>
          <span className="text-xs text-muted">×{(comp.weight * 100).toFixed(0)}% weight</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="num text-sm font-semibold" style={{ color }}>
            {comp.subScore.toFixed(0)}<span className="text-muted text-xs">/100</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${comp.subScore}%`, background: color }}
        />
      </div>

      <p className="text-xs text-muted leading-relaxed">{comp.description}</p>
    </div>
  );
}

interface Props {
  score: ConvictionScore;
  highlightedKey?: string;
}

export function ScoreBreakdown({ score, highlightedKey }: Props) {
  const compositeColor =
    score.composite >= 70 ? "text-profit" :
    score.composite >= 45 ? "text-warn" : "text-danger";

  return (
    <div className="panel-surface overflow-hidden flex flex-col">
      <PanelHeader label="Score Breakdown" mode="sample" />
      <div className="p-4 space-y-3">
        {/* Composite */}
        <div className="flex items-center justify-between p-3 bg-bg/40 border border-border rounded-md">
          <span className="text-sm font-semibold text-ink">Composite Conviction Score</span>
          <span className={cn("num text-2xl font-bold", compositeColor)}>
            {score.composite.toFixed(0)}
            <span className="text-muted text-sm font-normal">/100</span>
          </span>
        </div>

        {/* Components */}
        {score.components.map(comp => (
          <ComponentBar
            key={comp.key}
            comp={comp}
            highlighted={highlightedKey === comp.key}
          />
        ))}

        {/* Weights sum */}
        <p className="text-2xs text-muted text-right">
          Weights: {score.components.map(c => `${c.label} ${(c.weight * 100).toFixed(0)}%`).join(" · ")}
        </p>
      </div>
    </div>
  );
}
