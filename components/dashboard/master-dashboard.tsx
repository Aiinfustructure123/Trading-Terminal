"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConvictionRing, type ConvictionSegment } from "@/components/ui/conviction-ring";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { PanelShell } from "@/components/ui/panel-shell";
import { RiskBadge } from "@/components/ui/risk-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent, formatUsd } from "@/lib/format";
import {
  useAlertsTicker,
  useConvictionOpportunities,
  useMarketPulse,
  useMoversHeatmap,
  useNewLaunches,
  useTrendingNarratives,
} from "@/lib/queries/market";
import { getSourceMode } from "@/lib/datasources/source-config";
import { NewLaunch, RankedToken, RiskTier } from "@/lib/datasources/types";
import { ReactNode, useMemo, useState } from "react";
import { GripVertical } from "lucide-react";

const STORAGE_KEY = "alpha-terminal.dashboard-layout.v1";
const DEFAULT_LAYOUT = ["narratives", "opportunities", "launches", "movers"] as const;
type PanelId = (typeof DEFAULT_LAYOUT)[number];

function SortablePanel({
  id,
  children,
}: {
  id: PanelId;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
      <div className="mb-2 flex justify-end text-muted">
        <button
          className="inline-flex h-6 items-center gap-1 rounded border border-border px-2 text-[10px] uppercase tracking-[0.12em] hover:text-signal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
          move
        </button>
      </div>
      {children}
    </section>
  );
}

function riskToBadge(level: RiskTier) {
  return <RiskBadge tier={level} />;
}

function toSegments(token: RankedToken): ConvictionSegment[] {
  return token.breakdown.map((part) => ({
    key: part.component,
    label: part.component,
    value: part.score,
    color:
      part.component === "riskInverse"
        ? "var(--danger)"
        : part.component === "holders"
          ? "var(--warn)"
          : part.component === "liquidity"
            ? "var(--profit)"
            : "var(--signal)",
  }));
}

function ageText(isoTimestamp: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(isoTimestamp).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

function NewLaunchRow({ item }: { item: NewLaunch }) {
  return (
    <li className="grid animate-slide-in-top grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border py-2 text-xs data-mono">
      <div>
        <p className="text-sm text-ink">{item.symbol}</p>
        <p className="text-[11px] text-muted">
          {item.pair} · {ageText(item.launchedAt)} ago
        </p>
      </div>
      <div className="text-right text-ink">
        <p>{formatUsd(item.marketCapUsd)}</p>
        <p className="text-[11px] text-muted">liq {formatUsd(item.liquidityUsd)}</p>
      </div>
      {riskToBadge(item.riskTier)}
    </li>
  );
}

export function MasterDashboard() {
  const marketMode = getSourceMode("market");
  const pulse = useMarketPulse();
  const narratives = useTrendingNarratives();
  const opportunities = useConvictionOpportunities();
  const launches = useNewLaunches();
  const movers = useMoversHeatmap();
  const alerts = useAlertsTicker();

  const [layout, setLayout] = useState<PanelId[]>(() => {
    if (typeof window === "undefined") {
      return [...DEFAULT_LAYOUT];
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...DEFAULT_LAYOUT];
      const parsed = JSON.parse(raw) as PanelId[];
      if (
        parsed.length === DEFAULT_LAYOUT.length &&
        parsed.every((id) => DEFAULT_LAYOUT.includes(id))
      ) {
        return parsed;
      }
    } catch {
      // ignore corrupted persisted layout
    }
    return [...DEFAULT_LAYOUT];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = layout.indexOf(active.id as PanelId);
    const newIndex = layout.indexOf(over.id as PanelId);
    const next = arrayMove(layout, oldIndex, newIndex);
    setLayout(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const panelById = useMemo(
    () => ({
      narratives: (
        <PanelShell
          eyebrow="Narrative Flow"
          title="Trending Narratives"
          rightSlot={<DataSourceBadge mode={marketMode} />}
          className="h-full animate-slide-in-top"
        >
          {narratives.isLoading || !narratives.data ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {narratives.data.map((item) => {
                const flow24 = Math.max(0, Math.min(100, 40 + item.flow24h * 5));
                const flow7d = Math.max(0, Math.min(100, 35 + item.flow7d * 3.8));
                return (
                  <li key={item.id} className="rounded-md border border-border bg-bg/40 p-2.5">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">{item.name}</span>
                      <span className="data-mono text-xs text-muted">
                        {item.tokenCount} tokens
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                          <span>24h flow</span>
                          <span className="data-mono text-signal">{formatPercent(item.flow24h)}</span>
                        </div>
                        <div className="h-1.5 rounded bg-white/5">
                          <div
                            className="h-full rounded bg-signal transition-all"
                            style={{ width: `${flow24}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                          <span>7d flow</span>
                          <span className="data-mono text-profit">{formatPercent(item.flow7d)}</span>
                        </div>
                        <div className="h-1.5 rounded bg-white/5">
                          <div
                            className="h-full rounded bg-profit transition-all"
                            style={{ width: `${flow7d}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelShell>
      ),
      opportunities: (
        <PanelShell
          eyebrow="AI Conviction"
          title="Top Opportunities"
          rightSlot={<DataSourceBadge mode={marketMode} />}
          className="h-full animate-slide-in-top"
        >
          {opportunities.isLoading || !opportunities.data ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {opportunities.data.slice(0, 6).map((token) => (
                <article
                  key={token.id}
                  className="rounded-md border border-border bg-bg/45 p-2.5 transition-colors hover:border-signal/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{token.symbol}</p>
                      <p className="data-mono text-[11px] text-muted">{formatUsd(token.price)}</p>
                    </div>
                    <ConvictionRing
                      size={44}
                      strokeWidth={5}
                      score={token.conviction}
                      segments={toSegments(token)}
                      showCenterScore={false}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`data-mono text-xs ${
                        token.change24h >= 0 ? "text-profit" : "text-danger"
                      }`}
                    >
                      {formatPercent(token.change24h)}
                    </span>
                    {riskToBadge(token.riskTier)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </PanelShell>
      ),
      launches: (
        <PanelShell
          eyebrow="Launch Monitor"
          title="New Launches"
          rightSlot={<DataSourceBadge mode={marketMode} />}
          className="h-full animate-slide-in-top"
        >
          {launches.isLoading || !launches.data ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-md" />
              ))}
            </div>
          ) : (
            <ul className="max-h-[328px] overflow-y-auto pr-1">
              {launches.data.map((item) => (
                <NewLaunchRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </PanelShell>
      ),
      movers: (
        <PanelShell
          eyebrow="Market Structure"
          title="Movers Heatmap"
          rightSlot={<DataSourceBadge mode={marketMode} />}
          className="h-full animate-slide-in-top"
        >
          {movers.isLoading || !movers.data ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-2">
              {movers.data.map((item) => {
                const blockSize = Math.max(
                  2,
                  Math.min(6, Math.round((item.marketCapUsd / 12_000_000) * 6)),
                );
                const bgTone =
                  item.change24h >= 0
                    ? `rgba(61, 220, 151, ${Math.min(0.42, item.change24h / 60)})`
                    : `rgba(255, 77, 94, ${Math.min(0.42, Math.abs(item.change24h) / 60)})`;

                return (
                  <article
                    key={item.id}
                    className="col-span-6 rounded-md border border-border p-2 sm:col-span-4"
                    style={{ background: bgTone, gridColumn: `span ${blockSize} / span ${blockSize}` }}
                  >
                    <p className="data-mono text-sm font-medium text-ink">{item.symbol}</p>
                    <p
                      className={`data-mono text-xs ${
                        item.change24h >= 0 ? "text-profit" : "text-danger"
                      }`}
                    >
                      {formatPercent(item.change24h)}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </PanelShell>
      ),
    }),
    [launches.data, launches.isLoading, marketMode, movers.data, movers.isLoading, narratives.data, narratives.isLoading, opportunities.data, opportunities.isLoading],
  );

  return (
    <main className="min-h-screen bg-bg px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="panel animate-slide-in-top rounded-xl p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Master Dashboard</p>
              <h1 className="text-xl font-semibold tracking-wide text-ink">ALPHA TERMINAL</h1>
            </div>
            <DataSourceBadge mode={marketMode} />
          </div>
          {pulse.isLoading || !pulse.data ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-md" />
              ))}
            </div>
          ) : (
            <div
              key={pulse.data.updatedAt}
              className="grid animate-flash-update gap-2 rounded-md sm:grid-cols-2 lg:grid-cols-4"
            >
              <article className="rounded-md border border-border bg-bg/45 p-3">
                <p className="eyebrow">Global MCap</p>
                <p className="data-mono mt-1 text-lg text-ink">{formatUsd(pulse.data.globalMarketCap)}</p>
              </article>
              <article className="rounded-md border border-border bg-bg/45 p-3">
                <p className="eyebrow">24h Volume</p>
                <p className="data-mono mt-1 text-lg text-ink">{formatUsd(pulse.data.volume24h)}</p>
              </article>
              <article className="rounded-md border border-border bg-bg/45 p-3">
                <p className="eyebrow">BTC Dominance</p>
                <p className="data-mono mt-1 text-lg text-signal">{pulse.data.btcDominance.toFixed(2)}%</p>
              </article>
              <article className="rounded-md border border-border bg-bg/45 p-3">
                <p className="eyebrow">Fear / Greed</p>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full border border-signal/40 p-1">
                    <div
                      className="h-full rounded-full bg-signal/25"
                      style={{
                        clipPath: `polygon(0 100%, 100% 100%, 100% ${100 - pulse.data.fearGreed}%, 0 ${100 - pulse.data.fearGreed}%)`,
                      }}
                    />
                  </div>
                  <p className="data-mono text-lg text-signal">{pulse.data.fearGreed}</p>
                </div>
              </article>
            </div>
          )}
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={layout} strategy={rectSortingStrategy}>
            <section className="grid gap-4 lg:grid-cols-2">
              {layout.map((panelId) => (
                <SortablePanel key={panelId} id={panelId}>
                  {panelById[panelId]}
                </SortablePanel>
              ))}
            </section>
          </SortableContext>
        </DndContext>

        <footer className="panel glass overflow-hidden rounded-xl p-2">
          <div className="ticker-track data-mono text-xs">
            {(alerts.data ?? []).map((item) => (
              <span key={item.id} className="mr-8">
                <span
                  className={
                    item.level === "danger"
                      ? "text-danger"
                      : item.level === "warn"
                        ? "text-warn"
                        : "text-signal"
                  }
                >
                  ●
                </span>{" "}
                {item.message}
              </span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
