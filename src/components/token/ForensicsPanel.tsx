"use client";

import React from "react";
import type { ConvictionScore, RiskFlag } from "@/lib/datasources/types";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { RiskBadge, SeverityBadge } from "@/components/ui/DataBadge";
import { CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

const SEVERITY_ICONS = {
  critical: <XCircle size={14} className="text-danger flex-shrink-0" />,
  high:     <AlertTriangle size={14} className="text-danger flex-shrink-0" />,
  medium:   <AlertTriangle size={14} className="text-warn flex-shrink-0" />,
  low:      <Info size={14} className="text-signal flex-shrink-0" />,
  info:     <Info size={14} className="text-muted flex-shrink-0" />,
};

function FlagRow({ flag }: { flag: RiskFlag }) {
  if (!flag.triggered) {
    return (
      <div className="flex items-start gap-2.5 py-2 px-3 rounded border border-border/50 bg-bg/20 opacity-50">
        <CheckCircle size={14} className="text-profit flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-sm text-muted line-through">{flag.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 py-2.5 px-3 rounded border border-danger/20 bg-danger/5">
      <span className="mt-0.5">{SEVERITY_ICONS[flag.severity]}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-ink">{flag.label}</span>
          <SeverityBadge severity={flag.severity} />
        </div>
        <p className="text-xs text-muted leading-relaxed">{flag.description}</p>
      </div>
    </div>
  );
}

interface Props {
  score: ConvictionScore;
}

export function ForensicsPanel({ score }: Props) {
  const triggeredFlags = score.riskFlags.filter(f => f.triggered);
  const clearFlags     = score.riskFlags.filter(f => !f.triggered);

  return (
    <div className="panel-surface overflow-hidden flex flex-col">
      <PanelHeader
        label="Forensics"
        mode="sample"
        actions={<RiskBadge tier={score.riskTier} />}
      />
      <div className="p-4 space-y-2">
        {/* Triggered first, then cleared */}
        {triggeredFlags.map(f => <FlagRow key={f.id} flag={f} />)}
        {clearFlags.map(f => <FlagRow key={f.id} flag={f} />)}

        {triggeredFlags.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded border border-profit/30 bg-profit/5">
            <CheckCircle size={14} className="text-profit" />
            <span className="text-sm text-profit">No risk flags triggered</span>
          </div>
        )}

        <p className="text-2xs text-muted mt-3">
          Risk tier is set to the most severe triggered flag; manually escalated if mint or freeze authority is active.
        </p>
      </div>
    </div>
  );
}
