"use client";

import { ShieldCheck, ShieldAlert, ShieldX, Info } from "lucide-react";
import { useForensics } from "@/lib/hooks/use-data";
import { Panel, Skeleton } from "@/components/ui/primitives";
import { RiskBadge } from "@/components/ui/token-bits";
import type { RiskFlag } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

function FlagIcon({ flag }: { flag: RiskFlag }) {
  if (!flag.triggered) return <ShieldCheck className="size-4 shrink-0 text-profit" />;
  if (flag.severity === "danger") return <ShieldX className="size-4 shrink-0 text-danger" />;
  if (flag.severity === "caution") return <ShieldAlert className="size-4 shrink-0 text-warn" />;
  return <Info className="size-4 shrink-0 text-muted" />;
}

export function ForensicsPanel({ address }: { address: string }) {
  const { data, isLoading } = useForensics(address);
  return (
    <Panel
      title="Forensics"
      source="security"
      className="h-full"
      action={data ? <RiskBadge tier={data.tier} /> : null}
    >
      {isLoading || !data ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-muted">Composite tier derived from the deterministic rules below. Triggered rules are shown with their reasoning.</p>
          <ul className="flex flex-col divide-y divide-border">
            {data.flags.map((f) => (
              <li key={f.id} className="flex items-start gap-2.5 py-2.5">
                <FlagIcon flag={f} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm text-ink">{f.label}</span>
                    <span className={cn("font-mono text-[9px] uppercase tracking-wide", f.triggered ? (f.severity === "danger" ? "text-danger" : f.severity === "caution" ? "text-warn" : "text-muted") : "text-profit")}>
                      {f.triggered ? f.severity : "pass"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted">{f.explanation}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
