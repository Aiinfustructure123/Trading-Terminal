import { sourceMode, SourceKey } from "@/lib/datasources/config";
import { Chain, RiskTier } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

/**
 * SAMPLE / LIVE badge — driven entirely by the datasource config map.
 * Principle 2: the user must always know which is which.
 */
export function SourceBadge({
  source,
  className,
}: {
  source: SourceKey;
  className?: string;
}) {
  const mode = sourceMode(source);
  if (mode === "live") {
    return (
      <span
        className={cn(
          "num inline-flex items-center gap-1 rounded-[3px] border border-signal/40 bg-signal/10 px-1.5 py-px text-[10px] font-medium tracking-[0.12em] text-signal",
          className,
        )}
        title="This panel is fed by a live data source."
      >
        <span className="pulse-dot inline-block h-1 w-1 rounded-full bg-signal" />
        LIVE
      </span>
    );
  }
  return (
    <span
      className={cn(
        "num inline-flex items-center rounded-[3px] border border-warn/35 bg-warn/[0.07] px-1.5 py-px text-[10px] font-medium tracking-[0.12em] text-warn/90",
        className,
      )}
      title="This panel renders generated sample data. It flips to LIVE when the real source is connected."
    >
      SAMPLE
    </span>
  );
}

const RISK_STYLES: Record<RiskTier, string> = {
  Low: "border-profit/40 text-profit bg-profit/[0.07]",
  Moderate: "border-warn/40 text-warn bg-warn/[0.07]",
  High: "border-danger/40 text-danger bg-danger/[0.07]",
  Avoid: "border-danger bg-danger/90 text-bg font-semibold",
};

export function RiskBadge({
  tier,
  className,
}: {
  tier: RiskTier;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "num inline-flex items-center rounded-[3px] border px-1.5 py-px text-[10px] font-medium uppercase tracking-[0.1em]",
        RISK_STYLES[tier],
        className,
      )}
    >
      {tier}
    </span>
  );
}

const CHAIN_LABELS: Record<Chain, string> = {
  solana: "SOL",
  base: "BASE",
  ethereum: "ETH",
};

export function ChainBadge({
  chain,
  className,
}: {
  chain: Chain;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "num inline-flex items-center rounded-[3px] border border-edge-bright bg-panel-2 px-1 py-px text-[9px] tracking-[0.1em] text-muted",
        className,
      )}
    >
      {CHAIN_LABELS[chain]}
    </span>
  );
}
