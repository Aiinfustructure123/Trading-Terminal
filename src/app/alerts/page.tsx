"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Info, Plus, ShieldAlert, Trash2, Zap } from "lucide-react";
import {
  ALERT_COMPARATOR_LABELS,
  ALERT_METRIC_LABELS,
  AlertComparator,
  AlertMetric,
  addAlertRule,
  deleteAlertRule,
  toggleAlertRule,
  useAlertRules,
} from "@/lib/store/alert-rules";
import { useTickerAlerts } from "@/lib/hooks/queries";
import { TickerAlert } from "@/lib/datasources/types";
import { timeAgo } from "@/lib/format";
import { Panel } from "@/components/terminal/panel";
import { PanelSkeleton } from "@/components/terminal/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const METRIC_UNITS: Record<AlertMetric, string> = {
  momentum: "score",
  composite: "score",
  liquidityDrop1h: "%",
  priceChange1h: "%",
  volumeAccel: "× 7d avg",
  riskTierWorsens: "",
};

function describeRule(metric: AlertMetric, comparator: AlertComparator, threshold: number): string {
  if (metric === "riskTierWorsens") return "Risk tier worsens (any downgrade)";
  return `${ALERT_METRIC_LABELS[metric]} ${ALERT_COMPARATOR_LABELS[comparator]} ${threshold}${METRIC_UNITS[metric] ? ` ${METRIC_UNITS[metric]}` : ""}`;
}

function SeverityIcon({ severity }: { severity: TickerAlert["severity"] }) {
  if (severity === "severe") return <ShieldAlert size={13} className="shrink-0 text-danger" />;
  if (severity === "caution") return <AlertTriangle size={13} className="shrink-0 text-warn" />;
  if (severity === "signal") return <Zap size={13} className="shrink-0 text-signal" />;
  return <Info size={13} className="shrink-0 text-muted" />;
}

function RuleBuilder() {
  const [metric, setMetric] = React.useState<AlertMetric>("momentum");
  const [comparator, setComparator] = React.useState<AlertComparator>("crossesAbove");
  const [threshold, setThreshold] = React.useState("75");
  const [scope, setScope] = React.useState<"watchlist" | "any">("watchlist");

  const comparators: AlertComparator[] =
    metric === "liquidityDrop1h"
      ? ["dropsMoreThan"]
      : metric === "riskTierWorsens"
        ? ["crossesAbove"]
        : ["crossesAbove", "crossesBelow"];
  // derive instead of state-syncing when the metric constrains the choices
  const effectiveComparator = comparators.includes(comparator)
    ? comparator
    : comparators[0];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(threshold);
    if (metric !== "riskTierWorsens" && !Number.isFinite(value)) return;
    addAlertRule({
      name: describeRule(metric, effectiveComparator, value),
      scope,
      metric,
      comparator: effectiveComparator,
      threshold: metric === "riskTierWorsens" ? 0 : value,
      enabled: true,
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 p-3">
      <label className="flex flex-col gap-1">
        <span className="eyebrow !text-[9px]">When</span>
        <Select value={metric} onChange={(e) => setMetric(e.target.value as AlertMetric)}>
          {(Object.keys(ALERT_METRIC_LABELS) as AlertMetric[]).map((m) => (
            <option key={m} value={m}>{ALERT_METRIC_LABELS[m]}</option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="eyebrow !text-[9px]">Condition</span>
        <Select
          value={effectiveComparator}
          onChange={(e) => setComparator(e.target.value as AlertComparator)}
          disabled={metric === "riskTierWorsens"}
        >
          {comparators.map((c) => (
            <option key={c} value={c}>{ALERT_COMPARATOR_LABELS[c]}</option>
          ))}
        </Select>
      </label>
      {metric !== "riskTierWorsens" ? (
        <label className="flex flex-col gap-1">
          <span className="eyebrow !text-[9px]">
            Threshold{METRIC_UNITS[metric] ? ` (${METRIC_UNITS[metric]})` : ""}
          </span>
          <Input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-24"
            step="any"
            required
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-1">
        <span className="eyebrow !text-[9px]">Scope</span>
        <Select value={scope} onChange={(e) => setScope(e.target.value as "watchlist" | "any")}>
          <option value="watchlist">Watchlist tokens</option>
          <option value="any">Any screened token</option>
        </Select>
      </label>
      <Button type="submit" variant="primary">
        <Plus size={12} />
        Add rule
      </Button>
      <p className="w-full pt-1 text-2xs leading-4 text-muted">
        Example presets: “Momentum crosses 75”, “Liquidity drops &gt;30% in 1h”,
        “Risk tier worsens”. Phase 3 evaluates rules on a 30-minute cron and
        delivers via Telegram + this notification feed.
      </p>
    </form>
  );
}

export default function AlertsPage() {
  const rules = useAlertRules();
  const { data: history, isPending } = useTickerAlerts();

  return (
    <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-12">
      <div className="space-y-3 xl:col-span-7">
        <Panel title="Rule Builder">
          <RuleBuilder />
        </Panel>

        <Panel title="Active Rules" bodyClassName="divide-y divide-edge/60">
          {rules.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-muted">
              No rules yet — build one above.
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 px-3 py-2.5">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleAlertRule(rule.id)}
                  aria-label={`Toggle rule: ${rule.name}`}
                />
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-xs font-medium", rule.enabled ? "text-ink" : "text-muted")}>
                    {rule.name}
                  </div>
                  <div className="num text-[10px] text-muted">
                    scope: {rule.scope === "watchlist" ? "watchlist" : "any token"} ·
                    created {timeAgo(rule.createdAt)}
                  </div>
                </div>
                <span
                  className={cn(
                    "num rounded-[3px] border px-1.5 py-px text-[9px] tracking-wider",
                    rule.enabled
                      ? "border-signal/40 text-signal"
                      : "border-edge-bright text-muted",
                  )}
                >
                  {rule.enabled ? "ARMED" : "PAUSED"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAlertRule(rule.id)}
                  aria-label={`Delete rule: ${rule.name}`}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))
          )}
        </Panel>
      </div>

      <Panel
        title="Notification History"
        source="market"
        className="xl:col-span-5"
        bodyClassName="max-h-[70vh] overflow-y-auto"
      >
        {isPending || !history ? (
          <PanelSkeleton rows={10} />
        ) : (
          <div className="divide-y divide-edge/60">
            {history.map((a, i) => (
              <Link
                key={a.id}
                href={a.tokenId ? `/token/${a.tokenId}` : "#"}
                className="flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-panel-2/60"
                style={i === 0 ? { animation: "row-in 220ms ease-out both" } : undefined}
              >
                <SeverityIcon severity={a.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-4 text-ink/90">{a.text}</p>
                  <span className="num text-[10px] text-muted">{timeAgo(a.at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
