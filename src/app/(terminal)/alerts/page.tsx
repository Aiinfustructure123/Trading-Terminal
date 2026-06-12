"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsSource } from "@/lib/datasources";
import type { AlertRule, AlertConditionType } from "@/lib/datasources/types";
import { DataModeBadge, SeverityBadge } from "@/components/ui/DataBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtRelTime, cn } from "@/lib/utils";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Info, AlertTriangle, XCircle } from "lucide-react";

const CONDITION_LABELS: Record<AlertConditionType, string> = {
  momentum_crosses: "Momentum crosses",
  liquidity_drops:  "Liquidity drops",
  risk_worsens:     "Risk tier worsens",
  price_moves:      "Price moves",
  volume_spikes:    "Volume spikes",
};

const SEVERITY_ICONS = {
  critical: <XCircle size={13} className="text-danger" />,
  warn:     <AlertTriangle size={13} className="text-warn" />,
  info:     <Info size={13} className="text-signal" />,
};

function RuleRow({ rule }: { rule: AlertRule }) {
  const qc = useQueryClient();

  const toggle = useMutation({
    mutationFn: () => alertsSource.updateRule(rule.id, { enabled: !rule.enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-rules"] }),
  });

  const remove = useMutation({
    mutationFn: () => alertsSource.deleteRule(rule.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-rules"] }),
  });

  return (
    <div className={cn(
      "flex items-center gap-4 px-4 py-3 border-b border-border/40 last:border-0 transition-all",
      rule.enabled ? "" : "opacity-50"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-ink">{rule.name}</span>
          {!rule.enabled && <span className="text-2xs text-muted border border-border rounded px-1.5 py-0.5">DISABLED</span>}
        </div>
        <div className="text-xs text-muted">
          {CONDITION_LABELS[rule.condition]}
          {rule.params.threshold !== undefined && ` › ${rule.params.threshold}`}
          {rule.params.pct !== undefined && ` › ${rule.params.pct}% in ${rule.params.window}`}
          {rule.tokenAddress && ` · ${rule.tokenAddress.slice(0, 8)}…`}
        </div>
      </div>

      <button
        onClick={() => toggle.mutate()}
        className={cn("transition-colors", rule.enabled ? "text-signal" : "text-muted hover:text-signal")}
        aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
      >
        {rule.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
      </button>

      <button
        onClick={() => remove.mutate()}
        className="text-muted hover:text-danger transition-colors"
        aria-label="Delete rule"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function NewRuleForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [condition, setCondition] = useState<AlertConditionType>("momentum_crosses");
  const [threshold, setThreshold] = useState("75");

  const create = useMutation({
    mutationFn: () => alertsSource.createRule({
      name, condition, params: { threshold: parseFloat(threshold) }, enabled: true,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alert-rules"] }); onDone(); },
  });

  return (
    <div className="p-4 border border-signal/30 bg-signal/5 rounded-md mb-4 space-y-3">
      <div className="label-eyebrow text-signal">NEW RULE</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Rule name"
          className="bg-bg border border-border rounded px-3 py-1.5 text-sm text-ink outline-none
                     focus:border-signal/50 placeholder:text-muted col-span-1"
        />
        <select
          value={condition}
          onChange={e => setCondition(e.target.value as AlertConditionType)}
          className="bg-bg border border-border rounded px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
        >
          {Object.entries(CONDITION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          value={threshold}
          onChange={e => setThreshold(e.target.value)}
          placeholder="Threshold"
          type="number"
          className="bg-bg border border-border rounded px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => create.mutate()}
          disabled={!name}
          className="btn-terminal text-xs"
        >
          <Plus size={12} /> Create Rule
        </button>
        <button onClick={onDone} className="btn-terminal text-xs">Cancel</button>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [showForm, setShowForm] = useState(false);

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ["alert-rules"],
    queryFn:  () => alertsSource.getRules(),
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["alert-events"],
    queryFn:  () => alertsSource.getEvents(),
  });

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={18} className="text-signal" />
          <h1 className="text-xl font-semibold text-ink">Alerts</h1>
          <DataModeBadge mode="sample" />
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="btn-terminal"
        >
          <Plus size={13} /> New Rule
        </button>
      </div>

      {showForm && <NewRuleForm onDone={() => setShowForm(false)} />}

      {/* Rules */}
      <div className="panel-surface overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="label-eyebrow">ALERT RULES</span>
          <span className="text-xs text-muted">{rules?.length ?? 0} rules</span>
        </div>
        {rulesLoading
          ? <Skeleton className="h-32 m-4" />
          : rules?.map(rule => <RuleRow key={rule.id} rule={rule} />)
        }
      </div>

      {/* Event history */}
      <div className="panel-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="label-eyebrow">NOTIFICATION HISTORY</span>
        </div>
        {eventsLoading
          ? <Skeleton className="h-32 m-4" />
          : events?.map(evt => (
              <div
                key={evt.id}
                className="flex items-start gap-3 px-4 py-3 border-b border-border/40 last:border-0"
              >
                <span className="flex-shrink-0 mt-0.5">
                  {SEVERITY_ICONS[evt.severity as keyof typeof SEVERITY_ICONS] ?? <Info size={13} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm text-ink">{evt.message}</span>
                    {evt.tokenSymbol && (
                      <span className="text-xs font-mono text-signal">[{evt.tokenSymbol}]</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-muted">{evt.ruleName}</span>
                    <span className="text-muted">·</span>
                    <span className="text-2xs text-muted">{fmtRelTime(evt.at)}</span>
                  </div>
                </div>
                <SeverityBadge severity={evt.severity} />
              </div>
            ))
        }
      </div>
    </div>
  );
}
