"use client";

import { useCallback, useEffect, useState } from "react";

export type RuleMetric = "momentum" | "liquidity" | "risk" | "price" | "volume";
export type RuleOperator = "crosses_above" | "crosses_below" | "drops_pct" | "worsens";

export interface AlertRule {
  id: string;
  metric: RuleMetric;
  operator: RuleOperator;
  threshold: number;
  scope: string;
  enabled: boolean;
  createdAt: number;
}

const KEY = "alpha.alertRules";

const SEED: AlertRule[] = [
  { id: "seed-1", metric: "momentum", operator: "crosses_above", threshold: 75, scope: "All tokens", enabled: true, createdAt: Date.now() - 86400000 },
  { id: "seed-2", metric: "liquidity", operator: "drops_pct", threshold: 30, scope: "Watchlist", enabled: true, createdAt: Date.now() - 43200000 },
  { id: "seed-3", metric: "risk", operator: "worsens", threshold: 0, scope: "Watchlist", enabled: false, createdAt: Date.now() - 7200000 },
];

export function useAlertRules() {
  const [rules, setRules] = useState<AlertRule[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      setRules(saved ? JSON.parse(saved) : SEED);
    } catch {
      setRules(SEED);
    }
  }, []);

  const persist = (next: AlertRule[]) => {
    setRules(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = useCallback((rule: Omit<AlertRule, "id" | "createdAt">) => {
    setRules((prev) => {
      const next = [{ ...rule, id: `r-${Date.now()}`, createdAt: Date.now() }, ...prev];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setRules((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setRules((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { rules, add, toggle, remove, persist };
}

export function describeRule(r: AlertRule): string {
  const metric: Record<RuleMetric, string> = { momentum: "Momentum", liquidity: "Liquidity", risk: "Risk tier", price: "Price", volume: "Volume" };
  switch (r.operator) {
    case "crosses_above": return `${metric[r.metric]} crosses above ${r.threshold}`;
    case "crosses_below": return `${metric[r.metric]} crosses below ${r.threshold}`;
    case "drops_pct": return `${metric[r.metric]} drops >${r.threshold}% in 1h`;
    case "worsens": return `${metric[r.metric]} worsens`;
  }
}
