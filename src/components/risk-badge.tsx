import type { RiskTier } from "@/lib/datasources";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TIER_VARIANT: Record<RiskTier, "profit" | "warn" | "danger"> = {
  Low: "profit",
  Moderate: "warn",
  High: "danger",
  Avoid: "danger",
};

export function RiskBadge({ tier, className, compact }: { tier: RiskTier; className?: string; compact?: boolean }) {
  return (
    <Badge variant={TIER_VARIANT[tier]} className={cn(tier === "Avoid" && "font-bold", className)}>
      {compact ? tier.slice(0, 1) : tier}
    </Badge>
  );
}
