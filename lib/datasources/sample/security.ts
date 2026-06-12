import type { RiskFlag, RiskReport, RiskTier, SecuritySource } from "../types";
import { getUniverse, rng, simulateLatency } from "./generator";

interface FlagTemplate {
  id: string;
  severity: RiskFlag["severity"];
  title: string;
  explanation: string;
  /** Applied to tiers at or worse than this */
  minTier: RiskTier;
  chance: number;
}

const FLAG_TEMPLATES: FlagTemplate[] = [
  {
    id: "mint-authority",
    severity: "critical",
    title: "Mint authority active",
    explanation:
      "The deployer can mint unlimited new tokens at any time, diluting every holder. This alone forces a High risk tier minimum.",
    minTier: "High",
    chance: 0.8,
  },
  {
    id: "freeze-authority",
    severity: "critical",
    title: "Freeze authority active",
    explanation:
      "The deployer can freeze token accounts, preventing holders from selling. Classic precursor to a soft rug.",
    minTier: "High",
    chance: 0.5,
  },
  {
    id: "lp-unlocked",
    severity: "warning",
    title: "LP not fully locked",
    explanation:
      "A meaningful share of pool liquidity is held in an unlocked wallet and could be withdrawn without notice.",
    minTier: "Moderate",
    chance: 0.65,
  },
  {
    id: "high-sell-tax",
    severity: "warning",
    title: "Elevated sell tax",
    explanation:
      "Sell transactions are taxed above the typical range, which depresses realized exits and can mask weak organic demand.",
    minTier: "Moderate",
    chance: 0.3,
  },
  {
    id: "concentrated-top10",
    severity: "warning",
    title: "Top-10 holder concentration",
    explanation:
      "The ten largest wallets control an outsized share of supply. Coordinated selling would overwhelm current liquidity.",
    minTier: "Moderate",
    chance: 0.45,
  },
  {
    id: "young-contract",
    severity: "info",
    title: "Contract younger than 7 days",
    explanation:
      "Not a problem by itself, but most rug pulls happen in the first week. Treat all other signals with extra skepticism.",
    minTier: "Low",
    chance: 0.0, // handled by age check below
  },
  {
    id: "honeypot",
    severity: "critical",
    title: "Honeypot characteristics",
    explanation:
      "Simulated sells fail or return far less than expected. Buying may be possible while selling is effectively blocked.",
    minTier: "Avoid",
    chance: 0.85,
  },
  {
    id: "verified-clean",
    severity: "info",
    title: "Authorities renounced",
    explanation: "Mint and freeze authorities are revoked. The supply and holder accounts cannot be manipulated by the deployer.",
    minTier: "Low",
    chance: 0.0, // added for Low-tier tokens below
  },
];

const TIER_ORDER: Record<RiskTier, number> = { Low: 0, Moderate: 1, High: 2, Avoid: 3 };

export class SampleSecuritySource implements SecuritySource {
  async getRiskReport(tokenId: string): Promise<RiskReport> {
    await simulateLatency(180, 500);
    const token = getUniverse().find((t) => t.id === tokenId);
    const tier: RiskTier = token?.riskTier ?? "Moderate";
    const r = rng(`risk-${tokenId}`);

    const flags: RiskFlag[] = [];
    for (const tpl of FLAG_TEMPLATES) {
      if (tpl.id === "young-contract") {
        if (token && token.ageHours < 24 * 7) flags.push(tpl);
        continue;
      }
      if (tpl.id === "verified-clean") {
        if (tier === "Low") flags.push(tpl);
        continue;
      }
      if (TIER_ORDER[tier] >= TIER_ORDER[tpl.minTier] && r() < tpl.chance) {
        flags.push(tpl);
      }
    }

    const mintAuthorityActive = flags.some((f) => f.id === "mint-authority");
    const freezeAuthorityActive = flags.some((f) => f.id === "freeze-authority");
    const honeypot = flags.some((f) => f.id === "honeypot");
    const lpUnlocked = flags.some((f) => f.id === "lp-unlocked");

    return {
      tokenId,
      tier,
      flags: flags.sort(
        (a, b) =>
          ["critical", "warning", "info"].indexOf(a.severity) -
          ["critical", "warning", "info"].indexOf(b.severity)
      ),
      mintAuthorityActive,
      freezeAuthorityActive,
      lpLockedPct: lpUnlocked ? 35 + r() * 40 : 92 + r() * 8,
      buyTaxPct: tier === "Low" ? 0 : r() * 4,
      sellTaxPct: flags.some((f) => f.id === "high-sell-tax") ? 8 + r() * 12 : r() * 3,
      honeypot,
      checkedAt: Date.now(),
    };
  }
}
