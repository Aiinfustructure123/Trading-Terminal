"use client";

import { Check, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ScenarioKind } from "@/lib/datasources";
import { useScenarios } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  ScenarioKind,
  { icon: typeof TrendingUp; color: string; border: string; bg: string }
> = {
  bull: { icon: TrendingUp, color: "text-profit", border: "border-profit/30", bg: "bg-profit/5" },
  base: { icon: Minus, color: "text-signal", border: "border-signal/30", bg: "bg-signal/5" },
  bear: { icon: TrendingDown, color: "text-danger", border: "border-danger/30", bg: "bg-danger/5" },
};

export function ScenarioPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useScenarios(tokenId);

  return (
    <Panel title="Scenario Analysis" sourceKey="ai">
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {data.map((s) => {
            const meta = KIND_META[s.kind];
            const Icon = meta.icon;
            return (
              <div key={s.kind} className={cn("flex flex-col gap-2 rounded-md border p-3", meta.border, meta.bg)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", meta.color)} />
                  <span className={cn("font-display text-[14px] font-semibold", meta.color)}>{s.title}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {s.conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[12px] text-ink">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-muted" />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto border-t border-edge/60 pt-2 text-[11px] text-muted">{s.implication}</p>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-3 border-t border-edge pt-3 text-[11px] text-muted">
        Scenarios are defined by <span className="text-ink">observable conditions</span>, not probabilities or price
        targets. Analytical tooling, not financial advice.
      </p>
    </Panel>
  );
}
