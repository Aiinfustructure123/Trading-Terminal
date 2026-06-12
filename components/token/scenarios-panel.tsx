"use client";

import { useScenarios } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ScenarioKind } from "@/lib/datasources/types";

const KIND_STYLES: Record<ScenarioKind, { border: string; label: string; text: string }> = {
  bull: { border: "border-t-profit/60", label: "BULL", text: "text-profit" },
  base: { border: "border-t-muted/60", label: "BASE", text: "text-muted" },
  bear: { border: "border-t-danger/60", label: "BEAR", text: "text-danger" },
};

export function ScenariosPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useScenarios(tokenId);

  return (
    <Panel title="Scenario analysis" source="ai" bodyClassName="flex flex-col">
      <div className="grid flex-1 grid-cols-1 gap-px bg-panel-border lg:grid-cols-3">
        {isLoading || !data
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-panel p-3">
                <Skeleton className="h-40 w-full" />
              </div>
            ))
          : data.map((s) => {
              const style = KIND_STYLES[s.kind];
              return (
                <div key={s.kind} className={cn("flex flex-col gap-2 border-t-2 bg-panel p-3", style.border)}>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("font-mono text-[11px] font-bold tracking-[0.18em]", style.text)}>
                      {style.label}
                    </span>
                    <span className="text-[13px] font-medium">{s.title.split("—")[1]?.trim() ?? s.title}</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {s.conditions.map((c, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink/85">
                        <span className={cn("mt-1.5 size-1 shrink-0 rounded-full", style.text.replace("text-", "bg-"))} />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto border-t border-panel-border pt-2 text-[11px] leading-relaxed text-muted">
                    {s.summary}
                  </p>
                </div>
              );
            })}
      </div>
      <p className="border-t border-panel-border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-muted">
        Scenarios are observable conditions, not predictions. Analytical tooling, not financial advice.
      </p>
    </Panel>
  );
}
