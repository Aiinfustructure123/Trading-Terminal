"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert, ShieldQuestion } from "lucide-react";
import type { FlagSeverity } from "@/lib/datasources";
import { useForensics } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { RiskBadge } from "@/components/risk-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SEVERITY_META: Record<FlagSeverity, { icon: typeof CheckCircle2; color: string }> = {
  critical: { icon: AlertOctagon, color: "text-danger" },
  high: { icon: ShieldAlert, color: "text-danger" },
  medium: { icon: AlertTriangle, color: "text-warn" },
  low: { icon: ShieldQuestion, color: "text-muted" },
  pass: { icon: CheckCircle2, color: "text-profit" },
};

export function ForensicsPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useForensics(tokenId);

  return (
    <Panel
      title="Forensics"
      sourceKey="security"
      actions={data && <RiskBadge tier={data.tier} />}
    >
      {isLoading || !data ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-edge">
          {data.flags.map((f) => {
            const meta = SEVERITY_META[f.severity];
            const Icon = meta.icon;
            return (
              <li key={f.id} className="flex items-start gap-3 py-2.5">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.color)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] text-ink">{f.label}</span>
                    {f.value && <span className={cn("tabular text-[11px]", meta.color)}>{f.value}</span>}
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted">{f.explanation}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
