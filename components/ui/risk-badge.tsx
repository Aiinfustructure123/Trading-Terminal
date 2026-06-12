import { RiskTier } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

type RiskBadgeProps = {
  tier: RiskTier;
  className?: string;
};

const riskStyles: Record<RiskTier, string> = {
  low: "border-profit/40 text-profit bg-profit/5",
  moderate: "border-warn/40 text-warn bg-warn/5",
  high: "border-danger/40 text-danger bg-danger/5",
  avoid: "border-danger/60 text-danger bg-danger/10",
};

export function RiskBadge({ tier, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "data-mono inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        riskStyles[tier],
        className,
      )}
    >
      {tier}
    </span>
  );
}
