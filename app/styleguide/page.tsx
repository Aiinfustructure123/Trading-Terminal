import { Badge } from "@/components/ui/badge";
import { ConvictionRing } from "@/components/ui/conviction-ring";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/ui/source-badge";
import type { CompositeScore } from "@/lib/datasources/types";

const sampleScore: CompositeScore = {
  value: 82,
  explanation:
    "Composite conviction is a weighted blend of observable momentum, liquidity depth, holder quality, risk inverse, smart-money proxy, and narrative strength.",
  components: [
    {
      key: "momentum",
      label: "Momentum",
      value: 88,
      score: 88,
      weight: 0.26,
      tone: "signal",
      inputs: [
        { label: "24h Volume", value: "$18.4M" },
        { label: "Buy/Sell", value: "1.74x" },
        { label: "1h Structure", value: "HH / HL" },
      ],
      reasoning: "Volume expansion and positive microstructure are both accelerating.",
    },
    {
      key: "liquidity",
      label: "Liquidity",
      value: 74,
      score: 74,
      weight: 0.2,
      tone: "profit",
      inputs: [
        { label: "Depth", value: "$2.8M" },
        { label: "Slippage", value: "0.42%" },
        { label: "Growth", value: "+21.8%" },
      ],
      reasoning: "Liquidity is broad enough for retail entry and has grown during the latest impulse.",
    },
    {
      key: "holders",
      label: "Holders",
      value: 68,
      score: 68,
      weight: 0.16,
      tone: "neutral",
      inputs: [
        { label: "Holders", value: "12,904" },
        { label: "Top 10", value: "18.2%" },
        { label: "Creator", value: "Renounced" },
      ],
      reasoning: "Holder base is expanding while concentration remains acceptable for a new asset.",
    },
    {
      key: "riskInverse",
      label: "Risk Inverse",
      value: 61,
      score: 61,
      weight: 0.18,
      tone: "warn",
      inputs: [
        { label: "Tier", value: "Moderate" },
        { label: "Flags", value: "2" },
        { label: "LP Lock", value: "Partial" },
      ],
      reasoning: "Two caution flags lower the score until liquidity lock and authority status improve.",
    },
    {
      key: "smartMoney",
      label: "Smart Money",
      value: 78,
      score: 78,
      weight: 0.1,
      tone: "profit",
      inputs: [
        { label: "Tracked Buys", value: "7" },
        { label: "Net Flow", value: "+$420K" },
        { label: "Exit Pressure", value: "Low" },
      ],
      reasoning: "Sample tracked wallets are net accumulating without clustered exits.",
    },
    {
      key: "narrative",
      label: "Narrative",
      value: 91,
      score: 91,
      weight: 0.1,
      tone: "signal",
      inputs: [
        { label: "Category", value: "AI" },
        { label: "24h Flow", value: "+$114M" },
        { label: "Rank", value: "#1" },
      ],
      reasoning: "The AI narrative is leading sampled 24h and 7d capital-flow rankings.",
    },
  ],
};

const palette = [
  ["--bg", "#07080C", "Void background"],
  ["--panel", "#0E1117", "Panel surface"],
  ["--ink", "#E8ECF4", "Primary text"],
  ["--muted", "#6B7488", "Secondary labels"],
  ["--signal", "#5CE1E6", "Live data, actions"],
  ["--danger", "#FF4D5E", "Risk, sell pressure"],
  ["--warn", "#FFB020", "Caution states"],
  ["--profit", "#3DDC97", "Gains, buy pressure"],
];

const rows = [
  ["NEURAL", "$0.04231", "+4.82%", "$18.4M", "Moderate"],
  ["FLUX", "$1.28000", "-2.14%", "$42.8M", "Low"],
  ["RIFT", "$0.00091", "+18.62%", "$3.1M", "High"],
];

export default function StyleguidePage() {
  return (
    <div className="panel-grid mx-auto grid max-w-[1500px] gap-6 px-4 py-8">
      <section className="rounded-3xl border border-line bg-panel/80 p-6 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">Phase 0 design system</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-ink md:text-6xl">
              Bloomberg density, Apple restraint, mission-control signal clarity.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted md:text-base">
              This route is the contract for the terminal UI: exact palette, strict labels, data typography,
              explainable score rings, badges, skeleton loaders, and table density.
            </p>
          </div>
          <SourceBadge mode="sample" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Palette" eyebrow="Tokens">
          <div className="grid gap-3 sm:grid-cols-2">
            {palette.map(([name, hex, usage]) => (
              <div key={name} className="rounded-2xl border border-line bg-bg/60 p-4">
                <div
                  className="mb-4 h-16 rounded-xl border border-white/10"
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow mb-2">{usage}</p>
                    <p className="font-semibold text-ink">{name}</p>
                  </div>
                  <p className="number text-sm text-muted">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Type scale" eyebrow="Typography">
          <div className="grid gap-5">
            <div>
              <p className="eyebrow mb-2">Display / UI · Space Grotesk</p>
              <p className="text-5xl font-semibold tracking-[-0.06em]">Alpha conviction</p>
            </div>
            <div>
              <p className="eyebrow mb-2">Section title</p>
              <p className="text-xl font-semibold tracking-[-0.03em]">Token intelligence case file</p>
            </div>
            <div>
              <p className="eyebrow mb-2">Body copy</p>
              <p className="max-w-lg text-sm leading-6 text-muted">
                Labels are structural. Color is reserved for signal, risk, caution, and profit.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Data · JetBrains Mono tabular nums</p>
              <p className="number text-2xl">$18,421,990.42 · +14.82% · 02:31:07</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Conviction Ring" eyebrow="Signature component">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-wrap items-center gap-7">
            {[16, 32, 72, 120].map((size) => (
              <div key={size} className="grid justify-items-center gap-3">
                <ConvictionRing score={sampleScore} size={size} label={`${size}px conviction ring`} />
                <p className="number text-xs text-muted">{size}px</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            {sampleScore.components.map((component) => (
              <div key={component.key} className="rounded-2xl border border-line bg-bg/55 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow mb-2">{component.label}</p>
                    <p className="text-sm text-muted">{component.reasoning}</p>
                  </div>
                  <div className="number text-right text-sm">
                    <p className="font-semibold text-ink">{component.score}/100</p>
                    <p className="text-muted">{Math.round(component.weight * 100)}% weight</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Badges and states" eyebrow="Status language">
          <div className="flex flex-wrap gap-3">
            <SourceBadge mode="sample" />
            <SourceBadge mode="live" />
            <Badge tone="signal">Live edge</Badge>
            <Badge tone="profit">Buy pressure</Badge>
            <Badge tone="warn">Moderate risk</Badge>
            <Badge tone="danger">Avoid</Badge>
            <Badge>Neutral</Badge>
          </div>
          <div className="mt-6 grid gap-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </Panel>

        <Panel title="Dense table style" eyebrow="Screener baseline">
          <div className="terminal-scrollbar overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  {["Token", "Price", "24h", "Volume", "Risk"].map((heading) => (
                    <th key={heading} className="eyebrow px-3 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([token, price, delta, volume, risk]) => {
                  const isPositive = delta.startsWith("+");
                  return (
                    <tr key={token} className="border-b border-line/70 transition hover:bg-white/[0.03]">
                      <td className="px-3 py-3 font-semibold">{token}</td>
                      <td className="number px-3 py-3">{price}</td>
                      <td className={`number px-3 py-3 ${isPositive ? "text-profit" : "text-danger"}`}>
                        {delta}
                      </td>
                      <td className="number px-3 py-3 text-muted">{volume}</td>
                      <td className="px-3 py-3">
                        <Badge tone={risk === "Low" ? "profit" : risk === "Moderate" ? "warn" : "danger"}>
                          {risk}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
