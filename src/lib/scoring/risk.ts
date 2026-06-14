/**
 * Risk Tier — deterministic rule set.
 * Rules are documented here and each triggered rule is shown to the user.
 *
 * "active mint authority = automatic High minimum" — this rule is non-negotiable.
 */

import type { RiskFlag, RiskTier } from "@/lib/datasources/types";
import type { GoPlusTokenResult } from "@/lib/datasources/schemas/goplus";
import type { RugCheckReport } from "@/lib/datasources/schemas/rugcheck";

export interface SecurityInputs {
  goplus?:   GoPlusTokenResult | null;
  rugcheck?: RugCheckReport | null;
  liquidity: number;
  ageHours:  number;
  topHolderConcentrationPct: number;  // top-10 % of supply
}

function pct(s?: string | null): number {
  return parseFloat(s ?? "0") || 0;
}

export function computeRiskFlags(inputs: SecurityInputs): RiskFlag[] {
  const g = inputs.goplus;
  const r = inputs.rugcheck;

  // Check LP locked status
  const lpLocked = g?.lp_holders?.some(h =>
    (typeof h.is_locked === "number" ? h.is_locked : parseInt(h.is_locked as string)) === 1
  ) ?? false;

  const lpLockedPct = r?.markets?.[0]?.lp?.lpLockedPct ?? (lpLocked ? 100 : 0);

  return [
    {
      id: "mint_auth",
      severity: "critical",
      label: "Mint Authority Active",
      description: "Creator wallet retains the ability to mint additional tokens, diluting holders at will.",
      triggered: g?.is_mintable === true || !!(r?.token?.mintAuthority),
    },
    {
      id: "freeze_auth",
      severity: "high",
      label: "Freeze Authority Active",
      description: "Token accounts can be frozen by the authority, blocking your ability to sell.",
      triggered: !!(r?.token?.freezeAuthority),
    },
    {
      id: "honeypot",
      severity: "critical",
      label: "Honeypot Detected",
      description: "Selling appears to be blocked by contract code. Funds may be unrecoverable.",
      triggered: g?.is_honeypot === true,
    },
    {
      id: "lp_unlocked",
      severity: "high",
      label: "Liquidity Unlocked",
      description: "Less than 50% of LP tokens are time-locked. Rug pull risk is elevated.",
      triggered: lpLockedPct < 50,
    },
    {
      id: "buy_tax",
      severity: "medium",
      label: "High Buy Tax (>5%)",
      description: `Buy tax of ${pct(g?.buy_tax).toFixed(1)}% detected. Reduces effective entry price.`,
      triggered: pct(g?.buy_tax) > 5,
    },
    {
      id: "sell_tax",
      severity: "high",
      label: "High Sell Tax (>10%)",
      description: `Sell tax of ${pct(g?.sell_tax).toFixed(1)}% detected. Severely impacts exit value.`,
      triggered: pct(g?.sell_tax) > 10,
    },
    {
      id: "high_concentration",
      severity: "medium",
      label: "Top-10 Holder Concentration >60%",
      description: "A small group controls the majority of supply, enabling coordinated price manipulation.",
      triggered: inputs.topHolderConcentrationPct > 60,
    },
    {
      id: "low_liq",
      severity: "medium",
      label: "Liquidity Below $25K",
      description: "Very thin liquidity. Even small sells cause significant price impact.",
      triggered: inputs.liquidity > 0 && inputs.liquidity < 25_000,
    },
    {
      id: "young_contract",
      severity: "low",
      label: "Contract Age <24h",
      description: "Very new deployment — limited on-chain history available for assessment.",
      triggered: inputs.ageHours > 0 && inputs.ageHours < 24,
    },
    {
      id: "rugged",
      severity: "critical",
      label: "Previously Rugged",
      description: "RugCheck has flagged this token as a confirmed rug pull.",
      triggered: r?.rugged === true,
    },
    {
      id: "transfer_pausable",
      severity: "high",
      label: "Transfers Pausable",
      description: "Contract owner can pause all token transfers, trapping holders.",
      triggered: g?.transfer_pausable === true,
    },
    {
      id: "can_take_back_ownership",
      severity: "high",
      label: "Ownership Reclaim Possible",
      description: "Contract includes a mechanism to reclaim renounced ownership.",
      triggered: g?.can_take_back_ownership === true,
    },
  ];
}

/** Severity → weight for tier calculation */
const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 100,
  high:     40,
  medium:   15,
  low:      5,
};

export function computeRiskTier(flags: RiskFlag[]): RiskTier {
  const triggered = flags.filter(f => f.triggered);

  // Hard rules — any of these = immediate Avoid
  const hasCritical = triggered.some(f => f.severity === "critical");
  if (hasCritical) return "Avoid";

  // Score-based tier
  const score = triggered.reduce((s, f) => s + (SEVERITY_WEIGHT[f.severity] ?? 0), 0);

  if (score >= 80) return "High";
  if (score >= 30) return "Moderate";
  if (score > 0)   return "Moderate";
  return "Low";
}
