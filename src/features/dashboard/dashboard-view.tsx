"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { ConvictionRing } from "@/components/ui/conviction-ring";
import { PanelShell } from "@/components/ui/panel-shell";
import { SourceBadge } from "@/components/ui/source-badge";
import { datasources } from "@/lib/datasources";
import { HeatmapCell, LaunchFeedItem, RiskTier } from "@/lib/datasources/types";
import { formatCompactUsd, formatPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const DASHBOARD_LAYOUT_KEY = "alpha-terminal.master-dashboard.layout.v1";
const defaultPanelOrder = ["trending", "opportunities", "launches", "heatmap"] as const;
type DashboardPanelKey = (typeof defaultPanelOrder)[number];

const panelSpans: Record<DashboardPanelKey, string> = {
  trending: "md:col-span-2 xl:col-span-3",
  opportunities: "md:col-span-2 xl:col-span-3",
  launches: "md:col-span-2 xl:col-span-2",
  heatmap: "md:col-span-2 xl:col-span-4",
};

type SortablePanelProps = {
  id: DashboardPanelKey;
  className?: string;
  children: ReactNode;
};

function SortablePanel({ id, className, children }: SortablePanelProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", className, isDragging && "z-50 opacity-90")}
      {...attributes}
    >
      <button
        type="button"
        aria-label={`Reorder ${id} panel`}
        className="absolute right-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-bg/80 text-muted transition hover:border-signal/60 hover:text-signal"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

function metricDeltaClass(value: number): string {
  if (value > 0) return "text-profit";
  if (value < 0) return "text-danger";
  return "text-muted";
}

function riskBadgeClass(risk: RiskTier): string {
  switch (risk) {
    case "low":
      return "border-profit/40 bg-profit/10 text-profit";
    case "moderate":
      return "border-warn/50 bg-warn/10 text-warn";
    case "high":
      return "border-danger/45 bg-danger/10 text-danger";
    default:
      return "border-danger/70 bg-danger/20 text-danger";
  }
}

function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const maxCap = Math.max(...cells.map((cell) => cell.marketCapUsd), 1);

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
      {cells.map((cell) => {
        const intensity = Math.max(0.25, cell.marketCapUsd / maxCap);
        const isPositive = cell.change24hPct >= 0;
        return (
          <div
            key={cell.id}
            className={cn(
              "rounded-lg border p-3 transition",
              isPositive ? "border-profit/30 bg-profit/10" : "border-danger/30 bg-danger/10",
            )}
            style={{ opacity: 0.65 + intensity * 0.35 }}
          >
            <p className="data-mono text-xs text-muted">{formatCompactUsd(cell.marketCapUsd)}</p>
            <p className="mt-2 text-sm font-semibold text-ink">{cell.symbol}</p>
            <p className={cn("data-mono mt-1 text-sm", metricDeltaClass(cell.change24hPct))}>
              {formatPercent(cell.change24hPct)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function LaunchFeed({ launches }: { launches: LaunchFeedItem[] }) {
  return (
    <div className="space-y-2">
      {launches.map((launch) => (
        <article
          key={launch.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-bg/80 px-3 py-2 transition hover:border-signal/40"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink">{launch.token.symbol}</p>
              <p className="text-xs text-muted">{launch.token.chain.toUpperCase()}</p>
            </div>
            <p className="data-mono mt-1 text-xs text-muted">
              Age {Math.max(1, Math.round(launch.token.ageHours))}h · Liq {formatCompactUsd(launch.token.liquidityUsd)}
            </p>
          </div>
          <div className="text-right">
            <p className={cn("data-mono text-sm", metricDeltaClass(launch.token.change24hPct))}>
              {formatPercent(launch.token.change24hPct)}
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold tracking-[0.11em]",
                riskBadgeClass(launch.token.riskTier),
              )}
            >
              {launch.token.riskTier.toUpperCase()}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-md bg-border/40" />
      ))}
    </div>
  );
}

export function DashboardView() {
  const [panelOrder, setPanelOrder] = useState<DashboardPanelKey[]>(() => {
    if (typeof window === "undefined") {
      return [...defaultPanelOrder];
    }

    const stored = window.localStorage.getItem(DASHBOARD_LAYOUT_KEY);
    if (!stored) {
      return [...defaultPanelOrder];
    }

    try {
      const parsed = JSON.parse(stored) as DashboardPanelKey[];
      if (Array.isArray(parsed) && parsed.every((item) => defaultPanelOrder.includes(item))) {
        return parsed;
      }
    } catch {
      return [...defaultPanelOrder];
    }

    return [...defaultPanelOrder];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    window.localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(panelOrder));
  }, [panelOrder]);

  const marketPulseQuery = useQuery({
    queryKey: ["dashboard", "market-pulse"],
    queryFn: () => datasources.market.getMarketPulse(),
    refetchInterval: 15_000,
  });
  const narrativesQuery = useQuery({
    queryKey: ["dashboard", "narratives"],
    queryFn: () => datasources.market.getTrendingNarratives(),
    refetchInterval: 20_000,
  });
  const opportunitiesQuery = useQuery({
    queryKey: ["dashboard", "opportunities"],
    queryFn: () => datasources.market.getConvictionOpportunities(6),
    refetchInterval: 16_000,
  });
  const launchesQuery = useQuery({
    queryKey: ["dashboard", "launches"],
    queryFn: () => datasources.market.getNewLaunches(7),
    refetchInterval: 12_000,
  });
  const heatmapQuery = useQuery({
    queryKey: ["dashboard", "heatmap"],
    queryFn: () => datasources.market.getMoversHeatmap(12),
    refetchInterval: 18_000,
  });
  const alertsQuery = useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => datasources.market.getAlertsTicker(6),
    refetchInterval: 11_000,
  });

  const tickerTape = useMemo(() => {
    const messages =
      alertsQuery.data?.map((item) => `${item.severity.toUpperCase()} · ${item.message}`) ?? [
        "INFO · Loading alert stream...",
      ];
    return [...messages, ...messages].join("     ·     ");
  }, [alertsQuery.data]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = panelOrder.indexOf(active.id as DashboardPanelKey);
    const newIndex = panelOrder.indexOf(over.id as DashboardPanelKey);
    if (oldIndex === -1 || newIndex === -1) return;
    setPanelOrder((current) => arrayMove(current, oldIndex, newIndex));
  };

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-4 px-3 py-4 md:px-5 md:py-5">
      <header className="panel-surface px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Master Dashboard</p>
            <h1 className="text-lg font-semibold text-ink">ALPHA TERMINAL / SIGNALS GRID</h1>
          </div>
          <SourceBadge source="market" />
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-4">
        {marketPulseQuery.data ? (
          <>
            <article className="panel-surface space-y-2 px-4 py-3">
              <p className="eyebrow">Global MCap</p>
              <p className="data-mono text-xl font-semibold text-ink">
                {formatCompactUsd(marketPulseQuery.data.globalMarketCapUsd)}
              </p>
            </article>
            <article className="panel-surface space-y-2 px-4 py-3">
              <p className="eyebrow">24h Volume</p>
              <p className="data-mono text-xl font-semibold text-ink">
                {formatCompactUsd(marketPulseQuery.data.volume24hUsd)}
              </p>
            </article>
            <article className="panel-surface space-y-2 px-4 py-3">
              <p className="eyebrow">BTC Dominance</p>
              <p className="data-mono text-xl font-semibold text-ink">{marketPulseQuery.data.btcDominancePct}%</p>
            </article>
            <article className="panel-surface space-y-2 px-4 py-3">
              <p className="eyebrow">Fear / Greed</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full border border-border"
                  style={{
                    background: `conic-gradient(var(--signal) ${marketPulseQuery.data.fearGreed}%, rgba(107,116,136,0.25) 0)`,
                  }}
                />
                <p className="data-mono text-xl font-semibold text-ink">{marketPulseQuery.data.fearGreed}</p>
              </div>
            </article>
          </>
        ) : (
          <div className="panel-surface col-span-full p-4">
            <PanelSkeleton rows={1} />
          </div>
        )}
      </section>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={panelOrder} strategy={verticalListSortingStrategy}>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
            {panelOrder.map((panel) => {
              if (panel === "trending") {
                return (
                  <SortablePanel key={panel} id={panel} className={panelSpans[panel]}>
                    <PanelShell
                      eyebrow="Narratives"
                      title="Trending Capital Flow"
                      subtitle="24h and 7d trend pressure by category"
                      badge={<SourceBadge source="market" />}
                    >
                      {narrativesQuery.data ? (
                        <div className="space-y-3">
                          {narrativesQuery.data.map((narrative) => (
                            <div key={narrative.id} className="rounded-lg border border-border/70 bg-bg/80 p-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-ink">{narrative.name}</p>
                                <p className="data-mono text-xs text-muted">score {narrative.score}</p>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="h-2 overflow-hidden rounded-full bg-border/60">
                                  <div
                                    className="h-full rounded-full bg-signal"
                                    style={{ width: `${Math.max(8, Math.min(100, narrative.flow24hPct * 4))}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="data-mono text-signal">24h {formatPercent(narrative.flow24hPct)}</span>
                                  <span className="data-mono text-muted">7d {formatPercent(narrative.flow7dPct)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <PanelSkeleton />
                      )}
                    </PanelShell>
                  </SortablePanel>
                );
              }

              if (panel === "opportunities") {
                return (
                  <SortablePanel key={panel} id={panel} className={panelSpans[panel]}>
                    <PanelShell
                      eyebrow="AI Conviction Opportunities"
                      title="Top Ranked Tokens"
                      subtitle="Explainable scores on sample streams"
                      badge={<SourceBadge source="market" />}
                    >
                      {opportunitiesQuery.data ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          {opportunitiesQuery.data.map((opportunity) => (
                            <article key={opportunity.token.address} className="rounded-lg border border-border/80 bg-bg/80 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-ink">{opportunity.token.symbol}</p>
                                  <p className="data-mono text-xs text-muted">{formatPrice(opportunity.token.priceUsd)}</p>
                                </div>
                                <ConvictionRing
                                  size={56}
                                  score={Math.round(opportunity.conviction.total)}
                                  components={opportunity.conviction.components}
                                  showCenterValue
                                />
                              </div>
                              <p className="mt-3 text-xs text-muted">{opportunity.rationale[0]}</p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <PanelSkeleton />
                      )}
                    </PanelShell>
                  </SortablePanel>
                );
              }

              if (panel === "launches") {
                return (
                  <SortablePanel key={panel} id={panel} className={panelSpans[panel]}>
                    <PanelShell
                      eyebrow="New Launches"
                      title="Live Feed"
                      subtitle="Newest pools with instant risk tags"
                      badge={<SourceBadge source="market" />}
                    >
                      {launchesQuery.data ? <LaunchFeed launches={launchesQuery.data} /> : <PanelSkeleton />}
                    </PanelShell>
                  </SortablePanel>
                );
              }

              return (
                <SortablePanel key={panel} id={panel} className={panelSpans[panel]}>
                  <PanelShell
                    eyebrow="Movers Heatmap"
                    title="MCap-weighted 24h Change"
                    subtitle="Color indicates change direction; intensity indicates relative size"
                    badge={<SourceBadge source="market" />}
                  >
                    {heatmapQuery.data ? <Heatmap cells={heatmapQuery.data} /> : <PanelSkeleton rows={4} />}
                  </PanelShell>
                </SortablePanel>
              );
            })}
          </section>
        </SortableContext>
      </DndContext>

      <section className="panel-surface overflow-hidden px-0 py-2">
        <div className="eyebrow px-4 pb-2">Alerts Ticker</div>
        <div className="relative border-t border-border/70 py-1">
          <p className="ticker-track data-mono whitespace-nowrap pl-4 pr-6 text-xs text-signal">{tickerTape}</p>
        </div>
      </section>
    </main>
  );
}
