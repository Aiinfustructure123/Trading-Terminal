"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useNotifications } from "@/lib/hooks/queries";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AlertCondition, AlertMetric, AlertRule } from "@/lib/datasources/types";

const METRICS: Array<{ value: AlertMetric; label: string; unit: string }> = [
  { value: "momentum", label: "Momentum component", unit: "score" },
  { value: "conviction", label: "Composite conviction", unit: "score" },
  { value: "liquidityChange1h", label: "Liquidity change / 1h", unit: "%" },
  { value: "priceChange1h", label: "Price change / 1h", unit: "%" },
  { value: "volumeChange1h", label: "Volume change / 1h", unit: "%" },
  { value: "riskTier", label: "Risk tier", unit: "" },
];

const CONDITIONS: Array<{ value: AlertCondition; label: string }> = [
  { value: "crosses-above", label: "crosses above" },
  { value: "crosses-below", label: "crosses below" },
  { value: "drops-more-than", label: "drops more than" },
  { value: "worsens", label: "worsens" },
];

const DEFAULT_RULES: AlertRule[] = [
  {
    id: "default-momentum",
    name: "Momentum crosses 75",
    metric: "momentum",
    condition: "crosses-above",
    threshold: 75,
    scope: "watchlist",
    enabled: true,
    createdAt: 0,
  },
  {
    id: "default-rug",
    name: "Rug early-warning: liquidity drops >30% in 1h",
    metric: "liquidityChange1h",
    condition: "drops-more-than",
    threshold: 30,
    scope: "watchlist",
    enabled: true,
    createdAt: 0,
  },
  {
    id: "default-risk",
    name: "Risk tier worsens",
    metric: "riskTier",
    condition: "worsens",
    threshold: 0,
    scope: "watchlist",
    enabled: true,
    createdAt: 0,
  },
];

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-signal",
  warning: "bg-warn",
  critical: "bg-danger",
};

function describeRule(rule: AlertRule): string {
  const metric = METRICS.find((m) => m.value === rule.metric);
  const condition = CONDITIONS.find((c) => c.value === rule.condition);
  const threshold = rule.metric === "riskTier" ? "" : ` ${rule.threshold}${metric?.unit === "%" ? "%" : ""}`;
  return `${metric?.label ?? rule.metric} ${condition?.label ?? rule.condition}${threshold} · scope: ${rule.scope}`;
}

export default function AlertsPage() {
  const [rules, setRules] = useLocalStorage<AlertRule[]>("alpha:alert-rules", DEFAULT_RULES);
  const { data: notifications, isLoading } = useNotifications(24);

  const [metric, setMetric] = useState<AlertMetric>("momentum");
  const [condition, setCondition] = useState<AlertCondition>("crosses-above");
  const [threshold, setThreshold] = useState("75");
  const [scope, setScope] = useState<"watchlist" | "all">("watchlist");

  const addRule = () => {
    const m = METRICS.find((x) => x.value === metric)!;
    const c = CONDITIONS.find((x) => x.value === condition)!;
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: `${m.label} ${c.label} ${metric === "riskTier" ? "" : threshold}`.trim(),
      metric,
      condition,
      threshold: Number(threshold) || 0,
      scope,
      enabled: true,
      createdAt: Date.now(),
    };
    setRules((prev) => [...prev, rule]);
  };

  const selectClass =
    "h-8 rounded border border-panel-border bg-panel px-2 font-mono text-xs text-ink outline-none transition-colors hover:border-signal/40 focus:border-signal/60";

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-1">
        <span className="eyebrow">Alerts center</span>
        <h1 className="text-lg font-semibold leading-tight">Rules & notifications</h1>
        <p className="max-w-xl text-sm text-muted">
          Rules are evaluated by the scoring cron in Phase 3 and delivered via Telegram + this
          in-app feed. In Phase 0 the builder and history demonstrate the live behavior.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-3">
          {/* Rule builder */}
          <Panel title="New rule" source="alerts" bodyClassName="flex flex-wrap items-end gap-2 p-3">
            <label className="flex flex-col gap-1">
              <span className="eyebrow">Metric</span>
              <select className={selectClass} value={metric} onChange={(e) => setMetric(e.target.value as AlertMetric)}>
                {METRICS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="eyebrow">Condition</span>
              <select
                className={selectClass}
                value={condition}
                onChange={(e) => setCondition(e.target.value as AlertCondition)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            {metric !== "riskTier" && (
              <label className="flex flex-col gap-1">
                <span className="eyebrow">Threshold</span>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className={cn(selectClass, "w-24")}
                />
              </label>
            )}
            <label className="flex flex-col gap-1">
              <span className="eyebrow">Scope</span>
              <select className={selectClass} value={scope} onChange={(e) => setScope(e.target.value as "watchlist" | "all")}>
                <option value="watchlist">Watchlist</option>
                <option value="all">All tokens</option>
              </select>
            </label>
            <button
              onClick={addRule}
              className="flex h-8 items-center gap-1.5 rounded border border-signal/50 bg-signal/10 px-3 text-xs font-medium text-signal transition-colors hover:bg-signal/20"
            >
              <Plus className="size-3.5" aria-hidden />
              Add rule
            </button>
          </Panel>

          {/* Rule list */}
          <Panel title={`Rules (${rules.length})`} source="alerts" bodyClassName="divide-y divide-panel-border/60 overflow-y-auto">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 px-3 py-2.5">
                <button
                  role="switch"
                  aria-checked={rule.enabled}
                  aria-label={`Toggle rule: ${rule.name}`}
                  onClick={() =>
                    setRules((prev) => prev.map((x) => (x.id === rule.id ? { ...x, enabled: !x.enabled } : x)))
                  }
                  className={cn(
                    "relative h-4.5 w-8 shrink-0 rounded-full border transition-colors",
                    rule.enabled ? "border-signal/60 bg-signal/25" : "border-panel-border bg-panel"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1/2 size-3 -translate-y-1/2 rounded-full transition-all",
                      rule.enabled ? "left-[calc(100%-0.875rem)] bg-signal" : "left-0.5 bg-muted"
                    )}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-[13px] font-medium", !rule.enabled && "text-muted")}>{rule.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted">{describeRule(rule)}</p>
                </div>
                <button
                  onClick={() => setRules((prev) => prev.filter((x) => x.id !== rule.id))}
                  aria-label={`Delete rule: ${rule.name}`}
                  className="rounded p-1 text-muted/50 transition-colors hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            ))}
            {rules.length === 0 && <p className="p-6 text-center text-sm text-muted">No rules yet — build one above.</p>}
          </Panel>
        </div>

        {/* Notification history */}
        <Panel title="Notification history" source="alerts" bodyClassName="overflow-y-auto">
          {isLoading || !notifications ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-panel-border/60">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/token/${n.tokenId}`}
                    className={cn(
                      "flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-white/[0.03]",
                      !n.read && "bg-signal/[0.03]"
                    )}
                  >
                    <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", SEVERITY_STYLES[n.severity])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug">{n.message}</p>
                      <p className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-muted" data-numeric>
                        <Bell className="size-2.5" aria-hidden />
                        {n.ruleName} · {timeAgo(n.at)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
