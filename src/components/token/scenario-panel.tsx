"use client";

import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { useScenarios } from "@/lib/hooks/use-data";
import { Panel, Skeleton } from "@/components/ui/primitives";
import type { Scenario } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

const META: Record<Scenario["kind"], { color: string; bg: string; icon: typeof TrendingUp }> = {
  Bull: { color: "text-profit", bg: "border-profit/20 bg-profit/5", icon: TrendingUp },
  Base: { color: "text-signal", bg: "border-signal/20 bg-signal/5", icon: Minus },
  Bear: { color: "text-danger", bg: "border-danger/20 bg-danger/5", icon: TrendingDown },
};

export function ScenarioPanel({ address }: { address: string }) {
  const { data, isLoading } = useScenarios(address);
  return (
    <Panel title="Scenario Analysis" source="ai" className="h-full">
      {isLoading || !data ? (
        <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {data.map((s) => {
              const m = META[s.kind];
              const Icon = m.icon;
              return (
                <div key={s.kind} className={cn("flex flex-col gap-2 rounded-md border p-3", m.bg)}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-4", m.color)} />
                    <span className={cn("font-display text-sm font-semibold", m.color)}>{s.kind} Case</span>
                  </div>
                  <p className="text-[11px] text-muted">{s.thesis}</p>
                  <ul className="flex flex-col gap-1.5">
                    {s.conditions.map((c, i) => (
                      <li key={i} className="flex gap-1.5 text-[11px] text-ink/90">
                        <span className={cn("mt-1 size-1 shrink-0 rounded-full", m.color === "text-profit" ? "bg-profit" : m.color === "text-danger" ? "bg-danger" : "bg-signal")} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-md border border-border bg-bg px-3 py-2 font-mono text-[10px] text-muted">
            Scenarios are observable conditions, not probabilities or price targets. Analytical tooling, not financial advice.
          </p>
        </>
      )}
    </Panel>
  );
}
