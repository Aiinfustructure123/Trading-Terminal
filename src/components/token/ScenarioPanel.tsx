"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { securitySource } from "@/lib/datasources";
import type { Chain, Scenario } from "@/lib/datasources/types";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertTriangle, TrendingUp, Minus, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SCENARIO_CONFIG = {
  Bull: {
    icon: <TrendingUp size={14} />,
    color: "text-profit",
    border: "border-profit/30",
    bg: "bg-profit/5",
  },
  Base: {
    icon: <Minus size={14} />,
    color: "text-signal",
    border: "border-signal/30",
    bg: "bg-signal/5",
  },
  Bear: {
    icon: <TrendingDown size={14} />,
    color: "text-danger",
    border: "border-danger/30",
    bg: "bg-danger/5",
  },
};

function ScenarioCard({ s }: { s: Scenario }) {
  const cfg = SCENARIO_CONFIG[s.label];
  return (
    <div className={cn("p-4 rounded-md border", cfg.border, cfg.bg)}>
      <div className={cn("flex items-center gap-2 mb-3 font-semibold text-sm", cfg.color)}>
        {cfg.icon} {s.label} Case
      </div>
      <div className="space-y-1.5 mb-3">
        {s.conditions.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted">
            <span className={cn("flex-shrink-0 mt-0.5 text-[10px] font-mono", cfg.color)}>IF</span>
            <span>{c}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink/80 leading-relaxed border-t border-border/50 pt-2">
        {s.implications}
      </p>
    </div>
  );
}

interface Props {
  address: string;
  chain: Chain;
}

export function ScenarioPanel({ address, chain }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["scenarios", address, chain],
    queryFn:  () => securitySource.getScenarios(address, chain),
  });

  return (
    <div className="panel-surface overflow-hidden flex flex-col">
      <PanelHeader label="Scenario Analysis" mode={data?.source.mode ?? "sample"} />
      <div className="p-4 space-y-3">
        {isLoading
          ? <Skeleton className="h-64 w-full" />
          : data?.scenarios.map(s => <ScenarioCard key={s.label} s={s} />)
        }
        <div className="flex items-start gap-2 p-3 bg-warn/5 border border-warn/20 rounded text-xs text-muted">
          <AlertTriangle size={12} className="text-warn flex-shrink-0 mt-0.5" />
          <span>{data?.disclaimer ?? "Analytical tooling, not financial advice."}</span>
        </div>
      </div>
    </div>
  );
}
