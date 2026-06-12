import { ConvictionSegment, ConvictionRing } from "@/components/ui/conviction-ring";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PanelShell } from "@/components/ui/panel-shell";
import { RiskBadge } from "@/components/ui/risk-badge";
import { getSourceStatuses } from "@/lib/datasources/source-config";

const palette = [
  { name: "--bg", value: "#07080C" },
  { name: "--panel", value: "#0E1117" },
  { name: "--ink", value: "#E8ECF4" },
  { name: "--muted", value: "#6B7488" },
  { name: "--signal", value: "#5CE1E6" },
  { name: "--danger", value: "#FF4D5E" },
  { name: "--warn", value: "#FFB020" },
  { name: "--profit", value: "#3DDC97" },
] as const;

const ringSegments: ConvictionSegment[] = [
  { key: "momentum", label: "Momentum", value: 80, color: "var(--signal)" },
  { key: "liquidity", label: "Liquidity", value: 76, color: "var(--profit)" },
  { key: "holders", label: "Holders", value: 61, color: "var(--warn)" },
  { key: "riskInverse", label: "Risk Inverse", value: 58, color: "var(--danger)" },
  { key: "volumeTrend", label: "Volume Trend", value: 72, color: "var(--signal)" },
];

const tableRows = [
  { symbol: "NOVA", price: "$0.4381", delta: "+12.4%", vol: "$3.4M", risk: "moderate" },
  { symbol: "RIFT", price: "$0.2194", delta: "-6.2%", vol: "$1.8M", risk: "high" },
  { symbol: "ORBT", price: "$0.0728", delta: "+4.1%", vol: "$940K", risk: "low" },
] as const;

export default function StyleguidePage() {
  const sourceStatuses = getSourceStatuses();

  return (
    <main className="min-h-screen bg-bg px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div className="panel rounded-xl px-4 py-4 sm:px-5">
          <p className="eyebrow">ALPHA TERMINAL</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-[0.02em] text-ink">
              Phase 0 Styleguide
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {sourceStatuses.map((status) => (
                <DataSourceBadge key={status.key} mode={status.mode} />
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <PanelShell eyebrow="Palette" title="Signal Colors">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {palette.map((token) => (
                <div key={token.name} className="rounded-lg border border-border bg-bg/80 p-2">
                  <div
                    className="h-16 rounded-md border border-border"
                    style={{ backgroundColor: token.value }}
                  />
                  <p className="mt-2 data-mono text-xs text-muted">{token.name}</p>
                  <p className="data-mono text-xs text-ink">{token.value}</p>
                </div>
              ))}
            </div>
          </PanelShell>
          <PanelShell eyebrow="Typography" title="Space Grotesk + JetBrains Mono">
            <div className="space-y-3">
              <div>
                <p className="eyebrow">Display</p>
                <p className="text-3xl font-semibold text-ink">Market Intelligence Terminal</p>
              </div>
              <div>
                <p className="eyebrow">Body</p>
                <p className="text-sm text-ink/90">
                  Dense information hierarchy with muted labels and high-contrast numeric signal.
                </p>
              </div>
              <div>
                <p className="eyebrow">Data mono</p>
                <p className="data-mono text-sm text-signal">$0.4381  +12.40%  2026-06-12 02:32:18</p>
              </div>
            </div>
          </PanelShell>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <PanelShell eyebrow="Signature Component" title="Conviction Ring Variants">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-center gap-2">
                <p className="eyebrow">16px</p>
                <ConvictionRing
                  size={16}
                  strokeWidth={3}
                  score={78}
                  segments={ringSegments}
                  showCenterScore={false}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="eyebrow">40px</p>
                <ConvictionRing
                  size={40}
                  strokeWidth={5}
                  score={78}
                  segments={ringSegments}
                  showCenterScore={false}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="eyebrow">72px</p>
                <ConvictionRing
                  size={72}
                  strokeWidth={7}
                  score={78}
                  segments={ringSegments}
                  showCenterScore
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="eyebrow">120px</p>
                <ConvictionRing
                  size={120}
                  strokeWidth={11}
                  score={78}
                  segments={ringSegments}
                  showCenterScore
                />
              </div>
            </div>
          </PanelShell>

          <PanelShell eyebrow="Badges" title="Status + Risk Tiers">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <DataSourceBadge mode="sample" />
                <DataSourceBadge mode="live" />
              </div>
              <div className="flex flex-wrap gap-2">
                <RiskBadge tier="low" />
                <RiskBadge tier="moderate" />
                <RiskBadge tier="high" />
                <RiskBadge tier="avoid" />
              </div>
            </div>
          </PanelShell>
        </section>

        <PanelShell eyebrow="Table Styles" title="Dense Terminal Table">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="terminal-table data-mono min-w-full bg-panel text-xs">
              <thead>
                <tr>
                  <th className="text-left">Token</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">24h</th>
                  <th className="text-right">Volume</th>
                  <th className="text-right">Risk</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.symbol} className="animate-slide-in-top">
                    <td className="text-ink">{row.symbol}</td>
                    <td className="text-right text-ink">{row.price}</td>
                    <td
                      className={`text-right ${
                        row.delta.startsWith("+") ? "text-profit" : "text-danger"
                      }`}
                    >
                      {row.delta}
                    </td>
                    <td className="text-right text-ink">{row.vol}</td>
                    <td className="text-right">
                      <RiskBadge tier={row.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelShell>
      </div>
    </main>
  );
}
