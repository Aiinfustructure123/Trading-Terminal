import { cn } from "@/lib/utils";
import { sourceMode, type SourceKey } from "@/lib/datasources/config";
import type { RiskTier } from "@/lib/datasources/types";

/** SAMPLE / LIVE badge — driven entirely by the datasource config map. */
export function SourceBadge({ source, className }: { source: SourceKey; className?: string }) {
  const mode = sourceMode(source);
  const live = mode === "live";
  return (
    <span
      title={
        live
          ? "This panel is powered by live data."
          : "This panel runs on clearly-labeled sample data until its live source ships."
      }
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em]",
        live
          ? "border-signal/40 bg-signal/10 text-signal"
          : "border-warn/30 bg-warn/5 text-warn/90",
        className
      )}
    >
      <span
        className={cn(
          "size-1 rounded-full",
          live ? "animate-pulse-dot bg-signal" : "bg-warn/70"
        )}
      />
      {live ? "Live" : "Sample data"}
    </span>
  );
}

const RISK_STYLES: Record<RiskTier, string> = {
  Low: "border-profit/35 bg-profit/10 text-profit",
  Moderate: "border-warn/35 bg-warn/10 text-warn",
  High: "border-danger/35 bg-danger/10 text-danger",
  Avoid: "border-danger/60 bg-danger/20 text-danger",
};

export function RiskBadge({ tier, className }: { tier: RiskTier; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
        RISK_STYLES[tier],
        tier === "Avoid" && "font-bold",
        className
      )}
    >
      {tier}
    </span>
  );
}

export function ChainBadge({ chain, className }: { chain: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-panel-border bg-bg px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted",
        className
      )}
    >
      {chain === "solana" ? "SOL" : chain === "ethereum" ? "ETH" : chain.toUpperCase()}
    </span>
  );
}
