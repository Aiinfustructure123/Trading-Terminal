"use client";

import { useState } from "react";
import { BellRing, Plus, Trash2 } from "lucide-react";
import { Panel, Skeleton, Eyebrow } from "@/components/ui/primitives";
import { useAlerts } from "@/lib/hooks/use-data";
import { useAlertRules, describeRule, type RuleMetric, type RuleOperator } from "@/lib/store/alert-rules";
import { fmtTimeAgo, cn } from "@/lib/utils";

const METRICS: { value: RuleMetric; label: string }[] = [
  { value: "momentum", label: "Momentum" },
  { value: "liquidity", label: "Liquidity" },
  { value: "risk", label: "Risk tier" },
  { value: "price", label: "Price" },
  { value: "volume", label: "Volume" },
];
const OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: "crosses_above", label: "crosses above" },
  { value: "crosses_below", label: "crosses below" },
  { value: "drops_pct", label: "drops % in 1h" },
  { value: "worsens", label: "worsens" },
];
const SCOPES = ["All tokens", "Watchlist", "Discovery: Early Discovery"];

const dot: Record<string, string> = { info: "bg-muted", caution: "bg-warn", danger: "bg-danger", profit: "bg-profit" };

export default function AlertsPage() {
  const { rules, add, toggle, remove } = useAlertRules();
  const { data: history, isLoading } = useAlerts();
  const [metric, setMetric] = useState<RuleMetric>("momentum");
  const [operator, setOperator] = useState<RuleOperator>("crosses_above");
  const [threshold, setThreshold] = useState(75);
  const [scope, setScope] = useState(SCOPES[0]);

  return (
    <div className="flex flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center gap-2">
        <BellRing className="size-4 text-signal" />
        <Eyebrow>Alerts Center</Eyebrow>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Rule builder */}
        <Panel title="Rule Builder" className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Metric">
                <Select value={metric} onChange={(v) => setMetric(v as RuleMetric)} options={METRICS} />
              </Field>
              <Field label="Condition">
                <Select value={operator} onChange={(v) => setOperator(v as RuleOperator)} options={OPERATORS} />
              </Field>
              <Field label="Threshold">
                <input
                  type="number"
                  value={threshold}
                  disabled={operator === "worsens"}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-xs text-ink outline-none focus:border-signal/50 disabled:opacity-40"
                />
              </Field>
              <Field label="Scope">
                <Select value={scope} onChange={setScope} options={SCOPES.map((s) => ({ value: s, label: s }))} />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
              <span className="font-mono text-xs text-muted">
                Preview: <span className="text-ink">{describeRule({ id: "", metric, operator, threshold, scope, enabled: true, createdAt: 0 })}</span> · {scope}
              </span>
              <button
                onClick={() => add({ metric, operator, threshold, scope, enabled: true })}
                className="flex items-center gap-1.5 rounded-md bg-signal/15 px-3 py-1.5 font-mono text-xs text-signal hover:bg-signal/25"
              >
                <Plus className="size-3.5" /> Create rule
              </button>
            </div>
          </div>
        </Panel>

        {/* Rule list */}
        <Panel title="Active Rules" className="lg:col-span-1">
          <div className="flex flex-col gap-2">
            {rules.length === 0 && <p className="text-sm text-muted">No rules yet.</p>}
            {rules.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-md border border-border bg-panel-2/40 px-2.5 py-2">
                <button
                  onClick={() => toggle(r.id)}
                  className={cn("relative h-4 w-7 shrink-0 rounded-full transition-colors", r.enabled ? "bg-signal/60" : "bg-border-strong")}
                  aria-label="Toggle rule"
                >
                  <span className={cn("absolute top-0.5 size-3 rounded-full bg-ink transition-all", r.enabled ? "left-3.5" : "left-0.5")} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-[11px] text-ink">{describeRule(r)}</div>
                  <div className="font-mono text-[9px] text-muted">{r.scope}</div>
                </div>
                <button onClick={() => remove(r.id)} className="text-muted/50 hover:text-danger" aria-label="Delete rule">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Notification history */}
      <Panel title="Notification History" source="market" dense>
        <div className="max-h-[420px] overflow-y-auto">
          {isLoading || !history ? (
            <div className="space-y-2 p-3.5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <ul>
              {history.map((a) => (
                <li key={a.id} className="flex items-center gap-2.5 border-b border-border/50 px-3.5 py-2.5">
                  <span className={cn("size-1.5 shrink-0 rounded-full", dot[a.severity])} />
                  <span className="flex-1 font-mono text-[11px] text-ink/90">{a.message}</span>
                  <span className="font-mono text-[10px] text-muted">{fmtTimeAgo(a.time)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-xs text-ink outline-none focus:border-signal/50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-panel">{o.label}</option>
      ))}
    </select>
  );
}
