"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useRiskReport } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { RiskBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/format";
import type { RiskFlagSeverity } from "@/lib/datasources/types";

const SEVERITY_ICON: Record<RiskFlagSeverity, React.ReactNode> = {
  critical: <ShieldAlert className="size-4 shrink-0 text-danger" aria-label="Critical" />,
  warning: <AlertTriangle className="size-4 shrink-0 text-warn" aria-label="Warning" />,
  info: <Info className="size-4 shrink-0 text-muted" aria-label="Info" />,
};

export function ForensicsPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useRiskReport(tokenId);

  return (
    <Panel
      title="Forensics"
      source="security"
      actions={data && <RiskBadge tier={data.tier} />}
      bodyClassName="flex flex-col"
    >
      {isLoading || !data ? (
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px bg-panel-border sm:grid-cols-4">
            {(
              [
                ["Mint auth", data.mintAuthorityActive ? "ACTIVE" : "Revoked", data.mintAuthorityActive],
                ["Freeze auth", data.freezeAuthorityActive ? "ACTIVE" : "Revoked", data.freezeAuthorityActive],
                ["LP locked", `${data.lpLockedPct.toFixed(0)}%`, data.lpLockedPct < 80],
                ["Sell tax", `${data.sellTaxPct.toFixed(1)}%`, data.sellTaxPct > 5],
              ] as const
            ).map(([label, value, bad]) => (
              <div key={label} className="flex flex-col gap-0.5 bg-panel px-3 py-2">
                <span className="eyebrow">{label}</span>
                <span className={`font-mono text-sm ${bad ? "text-danger" : "text-profit"}`} data-numeric>
                  {value}
                </span>
              </div>
            ))}
          </div>
          <ul className="flex-1 divide-y divide-panel-border/60 overflow-y-auto border-t border-panel-border">
            {data.flags.map((flag) => (
              <li key={flag.id} className="flex gap-2.5 px-3 py-2.5">
                {SEVERITY_ICON[flag.severity]}
                <div className="min-w-0">
                  <p className="text-[13px] font-medium leading-tight">{flag.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{flag.explanation}</p>
                </div>
              </li>
            ))}
            {data.flags.length === 0 && (
              <li className="px-3 py-4 text-sm text-muted">No flags raised at last check.</li>
            )}
          </ul>
          <p className="border-t border-panel-border px-3 py-1.5 font-mono text-[10px] text-muted" data-numeric>
            checked {timeAgo(data.checkedAt)}
          </p>
        </>
      )}
    </Panel>
  );
}
