"use client";

import { useScenarios } from "@/lib/hooks/queries";
import { ScenarioCase } from "@/lib/datasources/types";
import { PanelSkeleton } from "@/components/terminal/skeleton";
import { cn } from "@/lib/utils";

const KIND_STYLE: Record<ScenarioCase["kind"], { label: string; tone: string; edge: string }> = {
  bull: { label: "Bull", tone: "text-profit", edge: "border-l-profit/60" },
  base: { label: "Base", tone: "text-muted", edge: "border-l-edge-bright" },
  bear: { label: "Bear", tone: "text-danger", edge: "border-l-danger/60" },
};

export function ScenarioPanel({ tokenId }: { tokenId: string }) {
  const { data, isPending } = useScenarios(tokenId);

  if (isPending || !data) return <PanelSkeleton rows={4} />;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
        {data.map((s) => {
          const style = KIND_STYLE[s.kind];
          return (
            <div
              key={s.kind}
              className={cn(
                "rounded-[4px] border border-edge border-l-2 bg-panel-2/40 p-2.5",
                style.edge,
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className={cn("eyebrow !text-[10px]", style.tone)}>{style.label}</span>
                <span className="text-xs font-medium text-ink">{s.title}</span>
              </div>
              <ul className="mt-1.5 space-y-1">
                {s.conditions.map((c, i) => (
                  <li key={i} className="flex gap-1.5 text-2xs leading-4 text-muted">
                    <span className="num shrink-0 text-muted/60">▸</span>
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-2xs leading-4 text-muted/80">{s.reading}</p>
            </div>
          );
        })}
      </div>
      <p className="num shrink-0 border-t border-edge px-3 py-2 text-[10px] uppercase tracking-wider text-muted/70">
        Scenarios are observable conditions, not predictions. Analytical
        tooling, not financial advice.
      </p>
    </div>
  );
}
