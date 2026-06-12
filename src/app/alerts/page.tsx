"use client";

import * as React from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import type { AlertSeverity } from "@/lib/datasources";
import { useAlertsTicker } from "@/lib/queries";
import { useLocalStorage } from "@/lib/use-local-storage";
import { PageHeader } from "@/components/page-header";
import { Panel, Eyebrow } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AlertRule {
  id: string;
  metric: string;
  operator: string;
  threshold: string;
  target: string;
  enabled: boolean;
  createdAt: number;
}

const METRICS = [
  { value: "momentum", label: "Momentum score" },
  { value: "liquidity", label: "Liquidity" },
  { value: "risk", label: "Risk tier" },
  { value: "volume", label: "24h volume" },
  { value: "price", label: "Price" },
];

const OPERATORS = [
  { value: "crosses_above", label: "crosses above" },
  { value: "crosses_below", label: "crosses below" },
  { value: "drops_pct_1h", label: "drops > x% in 1h" },
  { value: "worsens", label: "worsens" },
];

const TARGETS = [
  { value: "watchlist", label: "Watchlist tokens" },
  { value: "all", label: "All screened tokens" },
];

const DEFAULT_RULES: AlertRule[] = [
  { id: "r1", metric: "momentum", operator: "crosses_above", threshold: "75", target: "watchlist", enabled: true, createdAt: Date.now() },
  { id: "r2", metric: "liquidity", operator: "drops_pct_1h", threshold: "30", target: "watchlist", enabled: true, createdAt: Date.now() },
  { id: "r3", metric: "risk", operator: "worsens", threshold: "", target: "all", enabled: false, createdAt: Date.now() },
];

function ruleSentence(r: AlertRule) {
  const metric = METRICS.find((m) => m.value === r.metric)?.label ?? r.metric;
  const op = OPERATORS.find((o) => o.value === r.operator)?.label ?? r.operator;
  const threshold = r.operator === "drops_pct_1h" ? `${r.threshold}%` : r.threshold;
  const target = TARGETS.find((t) => t.value === r.target)?.label ?? r.target;
  return `${metric} ${op.replace("x", r.threshold)}${r.operator !== "worsens" && r.operator !== "drops_pct_1h" ? ` ${threshold}` : ""} · ${target}`;
}

const DOT: Record<AlertSeverity, string> = {
  info: "bg-muted",
  profit: "bg-profit",
  warn: "bg-warn",
  danger: "bg-danger",
};

export default function AlertsPage() {
  const [rules, setRules, hydrated] = useLocalStorage<AlertRule[]>("alpha:alert-rules", DEFAULT_RULES);
  const [draft, setDraft] = React.useState<Omit<AlertRule, "id" | "enabled" | "createdAt">>({
    metric: "momentum",
    operator: "crosses_above",
    threshold: "75",
    target: "watchlist",
  });
  const { data: history } = useAlertsTicker();

  const addRule = () => {
    setRules((prev) => [
      { ...draft, id: `r-${Date.now()}`, enabled: true, createdAt: Date.now() },
      ...prev,
    ]);
  };

  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Monitoring"
        title="Alerts Center"
        description="Build rules over momentum, liquidity, risk and volume. Rules are evaluated by the scoring cron in Phase 3, with Telegram + in-app delivery."
      />

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
        <Panel title="Rule Builder">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Eyebrow>Metric</Eyebrow>
                <Select value={draft.metric} onValueChange={(v) => setDraft((d) => ({ ...d, metric: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METRICS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Eyebrow>Condition</Eyebrow>
                <Select value={draft.operator} onValueChange={(v) => setDraft((d) => ({ ...d, operator: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Eyebrow>Threshold</Eyebrow>
                <Input
                  value={draft.threshold}
                  onChange={(e) => setDraft((d) => ({ ...d, threshold: e.target.value }))}
                  placeholder="e.g. 75"
                  disabled={draft.operator === "worsens"}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Eyebrow>Applies to</Eyebrow>
                <Select value={draft.target} onValueChange={(v) => setDraft((d) => ({ ...d, target: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TARGETS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addRule}>
              <Plus className="h-4 w-4" /> Add rule
            </Button>
          </div>
        </Panel>

        <Panel title="Active Rules" actions={<span className="eyebrow">{hydrated ? rules.length : 0} rules</span>} bodyClassName="p-0">
          {!hydrated || rules.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-[13px] text-muted">No rules yet.</div>
          ) : (
            <ul className="flex flex-col divide-y divide-edge">
              {rules.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-ink">{ruleSentence(r)}</p>
                    <p className="eyebrow mt-0.5">{r.enabled ? "Active" : "Paused"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={(v) => setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))}
                    />
                    <button
                      onClick={() => setRules((prev) => prev.filter((x) => x.id !== r.id))}
                      className="text-muted transition-colors hover:text-danger"
                      aria-label="Delete rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Notification History" sourceKey="market" className="lg:col-span-2" bodyClassName="p-0">
          {!history ? (
            <div className="flex h-40 items-center justify-center text-[13px] text-muted">Loading…</div>
          ) : (
            <ul className="flex flex-col divide-y divide-edge/60">
              {history.map((n) => (
                <li key={n.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Bell className="h-3.5 w-3.5 shrink-0 text-muted" />
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[n.severity])} />
                  <span className="tabular flex-1 text-[13px] text-ink">{n.text}</span>
                  <span className="text-micro shrink-0 text-muted">{formatRelativeTime(n.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
