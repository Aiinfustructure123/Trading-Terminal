import { Badge } from "@/components/ui/badge";
import { Panel, Eyebrow } from "@/components/ui/panel";
import { ConvictionRing } from "@/components/conviction-ring";
import type { ConvictionSegment } from "@/lib/datasources/types";

const palette = [
  ["--bg", "#07080C", "Near-black blue field"],
  ["--panel", "#0E1117", "Panel surfaces"],
  ["--ink", "#E8ECF4", "Primary text"],
  ["--muted", "#6B7488", "Secondary labels"],
  ["--signal", "#5CE1E6", "Live data / primary action"],
  ["--danger", "#FF4D5E", "Risk and sell pressure"],
  ["--warn", "#FFB020", "Caution / moderate risk"],
  ["--profit", "#3DDC97", "Gains and buy pressure"]
];

const segments: ConvictionSegment[] = [
  {
    key: "momentum",
    label: "Momentum",
    value: 86,
    weight: 0.28,
    color: "signal",
    reasoning: "Volume acceleration and higher-high structure are leading the rank."
  },
  {
    key: "liquidity",
    label: "Liquidity",
    value: 72,
    weight: 0.24,
    color: "profit",
    reasoning: "Depth improved without a matching sell-side impulse."
  },
  {
    key: "holders",
    label: "Holders",
    value: 64,
    weight: 0.2,
    color: "warn",
    reasoning: "Holder growth is healthy but top-wallet concentration remains elevated."
  },
  {
    key: "risk",
    label: "Risk inverse",
    value: 78,
    weight: 0.28,
    color: "danger",
    reasoning: "Risk checks pass, with one moderate caution on creator wallet age."
  }
];

const tableRows = [
  ["NEBULA", "$0.004218", "+18.2%", "$842K", "72", "Moderate"],
  ["ORBIT", "$0.000913", "-4.8%", "$311K", "61", "High"],
  ["VECTOR", "$0.081200", "+7.4%", "$4.8M", "83", "Low"]
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Phase 0 design system</Eyebrow>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-ink md:text-6xl">
            Terminal styleguide
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Bloomberg-density information hierarchy with quiet surfaces, exact signal colors, tabular data,
            and explainable score affordances.
          </p>
        </div>
        <Badge tone="sample">Sample Data</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Palette" eyebrow="Exact tokens" contentClassName="grid gap-3 sm:grid-cols-2">
          {palette.map(([name, value, label]) => (
            <div key={name} className="rounded-xl border border-border bg-bg/60 p-3">
              <div className="mb-3 h-16 rounded-lg border border-white/10" style={{ background: value }} />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-semibold text-ink">{name}</div>
                  <div className="mt-1 text-xs text-muted">{label}</div>
                </div>
                <div className="data-text text-xs text-muted">{value}</div>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Conviction Ring" eyebrow="Signature score primitive">
          <div className="grid place-items-center gap-6 rounded-xl border border-border bg-bg/45 p-6">
            <div className="flex items-end gap-5">
              <ConvictionRing score={76} segments={segments} size="xs" />
              <ConvictionRing score={76} segments={segments} size="sm" />
              <ConvictionRing score={76} segments={segments} size="md" />
              <ConvictionRing score={76} segments={segments} size="lg" />
            </div>
            <div className="grid w-full gap-2">
              {segments.map((segment) => (
                <div key={segment.key} className="rounded-lg border border-border bg-panel px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-ink">{segment.label}</span>
                    <span className="data-text text-xs text-muted">
                      {segment.value}/100 x {Math.round(segment.weight * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">{segment.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Typography" eyebrow="Labels structure the terminal">
          <div className="space-y-6">
            <div>
              <Eyebrow>Display / UI - Space Grotesk</Eyebrow>
              <div className="mt-2 text-5xl font-bold tracking-[-0.05em]">AI Conviction Opportunity</div>
            </div>
            <div>
              <Eyebrow>Data - JetBrains Mono / tabular nums</Eyebrow>
              <div className="data-text mt-2 grid grid-cols-2 gap-2 text-2xl font-semibold sm:grid-cols-4">
                <span>$2.41T</span>
                <span>+12.84%</span>
                <span>0x9a...42EF</span>
                <span>02:28:41</span>
              </div>
            </div>
            <div>
              <Eyebrow>Risk badges</Eyebrow>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="profit">Low</Badge>
                <Badge tone="warn">Moderate</Badge>
                <Badge tone="danger">High</Badge>
                <Badge tone="danger">Avoid</Badge>
                <Badge tone="live">Live</Badge>
                <Badge tone="sample">Sample Data</Badge>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Table styles" eyebrow="Dense, readable rows">
          <div className="terminal-scrollbar overflow-x-auto">
            <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  <th className="border-b border-border px-3 py-2 font-semibold">Token</th>
                  <th className="border-b border-border px-3 py-2 font-semibold">Price</th>
                  <th className="border-b border-border px-3 py-2 font-semibold">24h</th>
                  <th className="border-b border-border px-3 py-2 font-semibold">Liquidity</th>
                  <th className="border-b border-border px-3 py-2 font-semibold">Score</th>
                  <th className="border-b border-border px-3 py-2 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row[0]} className="group transition-colors hover:bg-signal/[0.035]">
                    <td className="border-b border-border px-3 py-3 font-semibold text-ink">{row[0]}</td>
                    <td className="data-text border-b border-border px-3 py-3 text-sm text-ink">{row[1]}</td>
                    <td
                      className={`data-text border-b border-border px-3 py-3 text-sm ${
                        row[2].startsWith("+") ? "text-profit" : "text-danger"
                      }`}
                    >
                      {row[2]}
                    </td>
                    <td className="data-text border-b border-border px-3 py-3 text-sm text-ink">{row[3]}</td>
                    <td className="border-b border-border px-3 py-3">
                      <div className="flex items-center gap-2">
                        <ConvictionRing score={Number(row[4])} segments={segments} size="xs" />
                        <span className="data-text text-sm text-ink">{row[4]}</span>
                      </div>
                    </td>
                    <td className="border-b border-border px-3 py-3">
                      <Badge tone={row[5] === "Low" ? "profit" : row[5] === "Moderate" ? "warn" : "danger"}>
                        {row[5]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </main>
  );
}
