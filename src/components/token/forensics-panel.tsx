"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { RiskSeverity } from "@/lib/datasources/types";
import { useRiskReport } from "@/lib/hooks/queries";
import { RiskBadge } from "@/components/terminal/badges";
import { PanelSkeleton } from "@/components/terminal/skeleton";

function SeverityIcon({ severity }: { severity: RiskSeverity }) {
  if (severity === "severe") return <ShieldAlert size={13} className="shrink-0 text-danger" />;
  if (severity === "caution") return <AlertTriangle size={13} className="shrink-0 text-warn" />;
  return <Info size={13} className="shrink-0 text-muted" />;
}

export function ForensicsPanel({ tokenId }: { tokenId: string }) {
  const { data, isPending, isError } = useRiskReport(tokenId);

  if (isPending) return <PanelSkeleton rows={5} />;
  if (isError || !data) {
    return (
      <div className="p-4 text-2xs text-muted">
        Source degraded — forensic report unavailable. Nothing is being faked
        in its place.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-edge px-3 py-2.5">
        <span className="eyebrow !text-[9px]">Composite tier</span>
        <RiskBadge tier={data.tier} />
      </div>
      <div className="min-h-0 flex-1 divide-y divide-edge/60 overflow-y-auto">
        {data.flags.map((f) => (
          <div key={f.id} className="flex gap-2.5 px-3 py-2.5">
            <SeverityIcon severity={f.severity} />
            <div className="min-w-0">
              <div className="text-xs font-medium text-ink">{f.title}</div>
              <p className="mt-0.5 text-2xs leading-4 text-muted">{f.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="border-t border-edge px-3 py-2 text-2xs leading-4 text-muted/80">
        {data.summary}
      </p>
    </div>
  );
}
