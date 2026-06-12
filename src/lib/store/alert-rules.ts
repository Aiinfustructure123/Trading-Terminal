"use client";

import { createLocalStore } from "./local-store";

export type AlertMetric =
  | "momentum"
  | "composite"
  | "liquidityDrop1h"
  | "priceChange1h"
  | "volumeAccel"
  | "riskTierWorsens";

export type AlertComparator = "crossesAbove" | "crossesBelow" | "dropsMoreThan";

export interface AlertRule {
  id: string;
  name: string;
  scope: "watchlist" | "any";
  metric: AlertMetric;
  comparator: AlertComparator;
  threshold: number;
  enabled: boolean;
  createdAt: string;
}

export const ALERT_METRIC_LABELS: Record<AlertMetric, string> = {
  momentum: "Momentum score",
  composite: "Composite conviction",
  liquidityDrop1h: "Liquidity (1h window)",
  priceChange1h: "Price change (1h)",
  volumeAccel: "Volume vs 7d average",
  riskTierWorsens: "Risk tier",
};

export const ALERT_COMPARATOR_LABELS: Record<AlertComparator, string> = {
  crossesAbove: "crosses above",
  crossesBelow: "crosses below",
  dropsMoreThan: "drops more than",
};

const DEFAULT_RULES: AlertRule[] = [
  {
    id: "rule-momentum-75",
    name: "Momentum breakout",
    scope: "watchlist",
    metric: "momentum",
    comparator: "crossesAbove",
    threshold: 75,
    enabled: true,
    createdAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "rule-rug-warning",
    name: "Rug early warning",
    scope: "watchlist",
    metric: "liquidityDrop1h",
    comparator: "dropsMoreThan",
    threshold: 30,
    enabled: true,
    createdAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "rule-risk-worsens",
    name: "Risk tier worsens",
    scope: "watchlist",
    metric: "riskTierWorsens",
    comparator: "crossesAbove",
    threshold: 0,
    enabled: false,
    createdAt: "2026-06-01T09:00:00.000Z",
  },
];

const store = createLocalStore<AlertRule[]>("alert-rules", DEFAULT_RULES);

export function useAlertRules(): AlertRule[] {
  return store.useValue();
}

export function addAlertRule(rule: Omit<AlertRule, "id" | "createdAt">): void {
  store.set((prev) => [
    {
      ...rule,
      id: `rule-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    },
    ...prev,
  ]);
}

export function toggleAlertRule(id: string): void {
  store.set((prev) =>
    prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
  );
}

export function deleteAlertRule(id: string): void {
  store.set((prev) => prev.filter((r) => r.id !== id));
}
