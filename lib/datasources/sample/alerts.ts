import type { AlertsSource, NotificationItem } from "../types";
import { getUniverse, rng, simulateLatency } from "./generator";

const TEMPLATES: Array<{
  ruleName: string;
  message: (sym: string, val: string) => string;
  severity: NotificationItem["severity"];
}> = [
  {
    ruleName: "Momentum crosses 75",
    message: (sym, val) => `${sym} momentum component crossed above 75 (now ${val}).`,
    severity: "info",
  },
  {
    ruleName: "Liquidity drop >30% / 1h",
    message: (sym, val) => `${sym} pool liquidity fell ${val}% in the last hour. Rug early-warning triggered.`,
    severity: "critical",
  },
  {
    ruleName: "Risk tier worsened",
    message: (sym) => `${sym} risk tier moved from Moderate to High — new mint-authority flag detected.`,
    severity: "warning",
  },
  {
    ruleName: "Conviction crosses 80",
    message: (sym, val) => `${sym} composite conviction crossed 80 (now ${val}).`,
    severity: "info",
  },
  {
    ruleName: "Volume spike",
    message: (sym, val) => `${sym} 1h volume is ${val}x its 7-day hourly average.`,
    severity: "info",
  },
];

export class SampleAlertsSource implements AlertsSource {
  async getNotifications(limit = 30): Promise<NotificationItem[]> {
    await simulateLatency(120, 350);
    const universe = getUniverse();
    const items: NotificationItem[] = [];
    const seedBlock = Math.floor(Date.now() / 120_000);
    for (let i = 0; i < limit; i++) {
      const r = rng(`notif-${seedBlock}-${i}`);
      const tpl = TEMPLATES[Math.floor(r() * TEMPLATES.length)];
      const token = universe[Math.floor(r() * universe.length)];
      const val =
        tpl.severity === "critical"
          ? (31 + r() * 40).toFixed(0)
          : tpl.ruleName === "Volume spike"
            ? (2 + r() * 6).toFixed(1)
            : (76 + r() * 20).toFixed(0);
      items.push({
        id: `ntf-${seedBlock}-${i}`,
        ruleId: `rule-${i % 5}`,
        ruleName: tpl.ruleName,
        tokenId: token.id,
        tokenSymbol: token.symbol,
        message: tpl.message(token.symbol, val),
        severity: tpl.severity,
        at: Date.now() - Math.floor(r() * 3600_000 * 18),
        read: r() > 0.4,
      });
    }
    return items.sort((a, b) => b.at - a.at);
  }
}
