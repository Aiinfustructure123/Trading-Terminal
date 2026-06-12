import type { Forensics, RiskFlag, RiskTier } from "@/lib/datasources/types";

/* ============================================================
   RISK SCORING — deterministic rule set.
   Each rule maps observable on-chain / security facts to a
   severity. The composite tier is derived from the worst
   triggered rules, with hard floors (e.g. active mint authority
   forces at least High). Triggered rules are surfaced to the user
   in the Forensics panel — no opaque "risk number".
   ============================================================ */

export interface RiskInputs {
  mintAuthorityActive: boolean;
  freezeAuthorityActive: boolean;
  lpLockedPct: number; // 0–100
  top10Pct: number; // holder concentration
  buyTaxPct: number;
  sellTaxPct: number;
  isHoneypot: boolean;
  liquidityUsd: number;
  ageHours: number;
  creatorHoldingPct: number;
}

const order: Record<RiskTier, number> = { Low: 0, Moderate: 1, High: 2, Avoid: 3 };

function worse(a: RiskTier, b: RiskTier): RiskTier {
  return order[a] >= order[b] ? a : b;
}

export function computeRisk(i: RiskInputs): Forensics {
  const flags: RiskFlag[] = [];
  let tier: RiskTier = "Low";

  const add = (
    id: string,
    label: string,
    triggered: boolean,
    severity: RiskFlag["severity"],
    explanation: string,
    floor?: RiskTier,
  ) => {
    flags.push({ id, label, triggered, severity, explanation });
    if (triggered && floor) tier = worse(tier, floor);
  };

  add("honeypot", "Honeypot simulation", i.isHoneypot, "danger",
    i.isHoneypot
      ? "Sell simulation failed — buyers may be unable to sell. Automatic Avoid."
      : "Sell simulation passed: a test sell would execute normally.",
    "Avoid");

  add("mint", "Mint authority", i.mintAuthorityActive, "danger",
    i.mintAuthorityActive
      ? "Mint authority is still active — supply can be inflated at will. Floors risk at High."
      : "Mint authority renounced: total supply is fixed.",
    "High");

  add("freeze", "Freeze authority", i.freezeAuthorityActive, "caution",
    i.freezeAuthorityActive
      ? "Freeze authority is active — the deployer can freeze token accounts."
      : "Freeze authority renounced: balances cannot be frozen.",
    "Moderate");

  add("lp", "LP lock / burn", i.lpLockedPct < 50, i.lpLockedPct < 20 ? "danger" : "caution",
    i.lpLockedPct >= 50
      ? `${i.lpLockedPct.toFixed(0)}% of LP is locked or burned — exit liquidity is protected.`
      : `Only ${i.lpLockedPct.toFixed(0)}% of LP is locked — liquidity could be pulled.`,
    i.lpLockedPct < 20 ? "High" : "Moderate");

  add("concentration", "Holder concentration", i.top10Pct > 35, i.top10Pct > 60 ? "danger" : "caution",
    i.top10Pct > 35
      ? `Top 10 wallets hold ${i.top10Pct.toFixed(0)}% — concentrated supply enables coordinated dumps.`
      : `Top 10 wallets hold ${i.top10Pct.toFixed(0)}% — reasonably distributed.`,
    i.top10Pct > 60 ? "High" : "Moderate");

  const highTax = i.buyTaxPct > 10 || i.sellTaxPct > 10;
  add("tax", "Transfer taxes", highTax, highTax ? "danger" : i.buyTaxPct + i.sellTaxPct > 0 ? "caution" : "info",
    `Buy tax ${i.buyTaxPct.toFixed(1)}% / sell tax ${i.sellTaxPct.toFixed(1)}%.${highTax ? " Elevated taxes erode returns and can hide soft rugs." : ""}`,
    highTax ? "High" : undefined);

  add("creator", "Creator holdings", i.creatorHoldingPct > 5, i.creatorHoldingPct > 15 ? "danger" : "caution",
    i.creatorHoldingPct > 5
      ? `Creator wallet holds ${i.creatorHoldingPct.toFixed(1)}% of supply.`
      : `Creator wallet holds ${i.creatorHoldingPct.toFixed(1)}% — minimal insider overhang.`,
    i.creatorHoldingPct > 15 ? "High" : i.creatorHoldingPct > 5 ? "Moderate" : undefined);

  add("liquidity", "Thin liquidity", i.liquidityUsd < 25_000, i.liquidityUsd < 10_000 ? "danger" : "caution",
    i.liquidityUsd < 25_000
      ? `Liquidity is only $${Math.round(i.liquidityUsd).toLocaleString()} — high slippage and manipulation risk.`
      : `Liquidity of $${Math.round(i.liquidityUsd).toLocaleString()} supports normal-sized positions.`,
    i.liquidityUsd < 10_000 ? "High" : undefined);

  add("age", "New deployment", i.ageHours < 24, "info",
    i.ageHours < 24
      ? `Deployed ${i.ageHours.toFixed(0)}h ago — unproven; treat with elevated caution.`
      : `Deployed ${(i.ageHours / 24).toFixed(0)}d ago.`,
    undefined);

  return { tier, flags };
}

export function riskTierColor(tier: RiskTier): string {
  switch (tier) {
    case "Low": return "text-profit";
    case "Moderate": return "text-warn";
    case "High": return "text-danger";
    case "Avoid": return "text-danger";
  }
}

export const RISK_ORDER = order;
