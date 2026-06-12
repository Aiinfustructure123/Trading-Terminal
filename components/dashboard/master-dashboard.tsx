"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ConvictionRing } from "@/components/ui/conviction-ring";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/ui/source-badge";
import { dataSources } from "@/lib/datasources";
import type { AlertEvent, LaunchEvent, MarketPulse, NarrativeTrend, SourceMode, Token } from "@/lib/datasources/types";
import { cn, formatCompactNumber, formatPercent, formatUsd } from "@/lib/utils";

type DashboardData = {
  pulse: MarketPulse;
  narratives: NarrativeTrend[];
  opportunities: Token[];
  launches: LaunchEvent[];
  movers: Token[];
  alerts: AlertEvent[];
};

type PanelId = "market-pulse" | "narratives" | "opportunities" | "launches" | "movers";

const defaultPanelOrder: PanelId[] = ["market-pulse", "narratives", "opportunities", "launches", "movers"];
const storageKey = "alpha-terminal.dashboard.panel-order";
const panelClasses: Record<PanelId, string> = {
  "market-pulse": "lg:col-span-6",
  narratives: "lg:col-span-2",
  opportunities: "lg:col-span-4",
  launches: "lg:col-span-2",
  movers: "lg:col-span-4",
};

function riskTone(tier: Token["riskTier"]): BadgeTone {
  if (tier === "Low") return "profit";
  if (tier === "Moderate") return "warn";
  return "danger";
}

function deltaClass(value: number) {
  if (value > 0) return "text-profit";
  if (value < 0) return "text-danger";
  return "text-muted";
}

function panelMode<T extends { source: { mode: SourceMode } }>(items: T[] | T): SourceMode {
  if (Array.isArray(items)) return items[0]?.source.mode ?? "sample";
  return items.source.mode;
}

async function fetchDashboard(): Promise<DashboardData> {
  const [pulse, narratives, tokens, launches, movers, alerts] = await Promise.all([
    dataSources.market.getMarketPulse(),
    dataSources.market.getTrendingNarratives(),
    dataSources.market.getTokens(1_000),
    dataSources.market.getNewLaunches(),
    dataSources.market.getMovers(),
    dataSources.market.getAlertsTicker(),
  ]);

  return {
    pulse,
    narratives,
    opportunities: tokens.slice(0, 5),
    launches,
    movers,
    alerts,
  };
}

function SortablePanel({
  id,
  title,
  eyebrow,
  mode,
  className,
  children,
}: {
  id: PanelId;
  title: string;
  eyebrow: string;
  mode: SourceMode;
  className?: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(className, isDragging && "relative z-20 opacity-80")}>
      <Panel
        title={title}
        eyebrow={eyebrow}
        mode={mode}
        action={
          <button
            type="button"
            className="rounded-lg border border-line px-2 py-1 text-muted transition hover:border-signal/50 hover:text-signal"
            aria-label={`Reorder ${title}`}
            {...attributes}
            {...listeners}
          >
            <GripHorizontal size={15} />
          </button>
        }
      >
        {children}
      </Panel>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-6">
        <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl lg:col-span-4" />
      </div>
    </div>
  );
}

function MarketPulsePanel({ pulse }: { pulse: MarketPulse }) {
  const metrics = [
    { label: "Global MCAP", value: formatUsd(pulse.globalMarketCapUsd), accent: "text-ink" },
    { label: "24h Volume", value: formatUsd(pulse.volume24hUsd), accent: "text-signal" },
    { label: "BTC Dominance", value: `${pulse.btcDominance.toFixed(2)}%`, accent: "text-muted" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_180px]">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-line bg-bg/55 p-4">
          <p className="eyebrow mb-3">{metric.label}</p>
          <p className={cn("number animate-cyan-flash text-2xl font-semibold", metric.accent)}>{metric.value}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-line bg-bg/55 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">Fear / Greed</p>
            <p className="number text-2xl font-semibold text-warn">{pulse.fearGreed}</p>
          </div>
          <div
            className="relative h-20 w-20 rounded-full border border-line"
            style={{
              background: `conic-gradient(var(--warn) ${pulse.fearGreed * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            }}
          >
            <div className="absolute inset-2 grid place-items-center rounded-full bg-panel">
              <span className="number text-xs text-muted">100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NarrativesPanel({ narratives }: { narratives: NarrativeTrend[] }) {
  const maxFlow = Math.max(...narratives.map((item) => item.flow7dUsd));

  return (
    <div className="grid gap-3">
      {narratives.map((item) => (
        <article key={item.id} className="rounded-2xl border border-line bg-bg/55 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Rank #{item.rank}</p>
              <h3 className="text-xl font-semibold tracking-[-0.04em]">{item.label}</h3>
            </div>
            <p className="number text-lg text-signal">{item.momentum}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <div>
              <div className="mb-1 flex justify-between gap-3 text-xs text-muted">
                <span>24h capital flow</span>
                <span className="number text-profit">{formatUsd(item.flow24hUsd)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-2 rounded-full bg-profit"
                  style={{ width: `${Math.max(12, (item.flow24hUsd / maxFlow) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between gap-3 text-xs text-muted">
                <span>7d capital flow</span>
                <span className="number text-signal">{formatUsd(item.flow7dUsd)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-2 rounded-full bg-signal"
                  style={{ width: `${Math.max(12, (item.flow7dUsd / maxFlow) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function OpportunitiesPanel({ tokens }: { tokens: Token[] }) {
  return (
    <div className="grid gap-3">
      {tokens.map((token) => (
        <article
          key={token.id}
          className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-2xl border border-line bg-bg/55 p-4 transition hover:border-signal/35"
        >
          <ConvictionRing score={token.conviction} size={62} label={`${token.symbol} conviction`} />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold tracking-[-0.04em]">{token.symbol}</h3>
              <Badge tone="signal">{token.narrative}</Badge>
              <Badge tone={riskTone(token.riskTier)}>{token.riskTier}</Badge>
            </div>
            <p className="truncate text-sm text-muted">{token.name}</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="eyebrow mb-1">MCAP</p>
                <p className="number">{formatUsd(token.marketCapUsd)}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Vol 24h</p>
                <p className="number">{formatUsd(token.volume24h)}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">24h</p>
                <p className={cn("number", deltaClass(token.deltas.h24))}>{formatPercent(token.deltas.h24)}</p>
              </div>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="eyebrow mb-2">Why ranked</p>
            <p className="max-w-36 text-xs leading-5 text-muted">
              {token.conviction.components
                .slice()
                .sort((a, b) => b.score * b.weight - a.score * a.weight)
                .slice(0, 2)
                .map((item) => item.label)
                .join(" + ")}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function LaunchesPanel({ launches }: { launches: LaunchEvent[] }) {
  return (
    <div className="grid gap-2">
      {launches.map((launch, index) => (
        <article
          key={launch.id}
          className="animate-feed-in rounded-2xl border border-line bg-bg/55 p-3"
          style={{ animationDelay: `${index * 22}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold tracking-[-0.03em]">{launch.token.symbol}</h3>
                <Badge tone={riskTone(launch.token.riskTier)}>{launch.token.riskTier}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{launch.token.name}</p>
            </div>
            <div className="number text-right text-xs">
              <p className="text-ink">{Math.round(launch.token.ageHours)}h old</p>
              <p className="text-muted">{formatUsd(launch.liquiditySeedUsd)} seed</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {launch.riskFlags.length === 0 ? (
              <Badge tone="profit">No sample flags</Badge>
            ) : (
              launch.riskFlags.map((flag) => (
                <Badge key={flag} tone={flag.includes("authority") ? "danger" : "warn"}>
                  {flag}
                </Badge>
              ))
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function MoversPanel({ movers }: { movers: Token[] }) {
  const maxMcap = Math.max(...movers.map((token) => token.marketCapUsd));

  return (
    <div className="grid auto-rows-[72px] grid-cols-6 gap-2 sm:grid-cols-8">
      {movers.slice(0, 24).map((token) => {
        const span = Math.max(1, Math.min(3, Math.round((token.marketCapUsd / maxMcap) * 3)));
        const isPositive = token.deltas.h24 >= 0;
        return (
          <div
            key={token.id}
            className="group relative overflow-hidden rounded-xl border border-line p-3"
            style={{
              gridColumn: `span ${span}`,
              background: isPositive
                ? `rgba(61, 220, 151, ${Math.min(0.34, 0.08 + Math.abs(token.deltas.h24) / 120)})`
                : `rgba(255, 77, 94, ${Math.min(0.34, 0.08 + Math.abs(token.deltas.h24) / 120)})`,
            }}
          >
            <p className="truncate text-sm font-semibold">{token.symbol}</p>
            <p className={cn("number mt-2 text-xs", isPositive ? "text-profit" : "text-danger")}>
              {formatPercent(token.deltas.h24)}
            </p>
            <p className="number absolute bottom-2 right-2 text-[10px] text-muted">{formatCompactNumber(token.marketCapUsd)}</p>
          </div>
        );
      })}
    </div>
  );
}

function AlertsTicker({ alerts }: { alerts: AlertEvent[] }) {
  const repeated = [...alerts, ...alerts];
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 overflow-hidden px-4 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <SourceBadge mode={panelMode(alerts)} />
          <span className="eyebrow">Alerts</span>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker gap-8">
            {repeated.map((alert, index) => (
              <span key={`${alert.id}-${index}`} className="flex items-center gap-2 text-xs text-muted">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    alert.severity === "danger"
                      ? "bg-danger"
                      : alert.severity === "warn"
                        ? "bg-warn"
                        : alert.severity === "profit"
                          ? "bg-profit"
                          : "bg-signal",
                  )}
                />
                <span className="number text-ink">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                {alert.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MasterDashboard() {
  const [panelOrder, setPanelOrder] = useState<PanelId[]>(() => {
    if (typeof window === "undefined") return defaultPanelOrder;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return defaultPanelOrder;
    try {
      const parsed = JSON.parse(stored) as PanelId[];
      const valid = parsed.filter((id): id is PanelId => defaultPanelOrder.includes(id));
      return valid.length === defaultPanelOrder.length ? valid : defaultPanelOrder;
    } catch {
      return defaultPanelOrder;
    }
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const dashboardQuery = useQuery({
    queryKey: ["master-dashboard"],
    queryFn: fetchDashboard,
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(panelOrder));
  }, [panelOrder]);

  const panels = useMemo(() => {
    if (!dashboardQuery.data) return null;
    const data = dashboardQuery.data;
    return {
      "market-pulse": (
        <SortablePanel
          id="market-pulse"
          title="Market Pulse"
          eyebrow="Global strip"
          mode={panelMode(data.pulse)}
          className={panelClasses["market-pulse"]}
        >
          <MarketPulsePanel pulse={data.pulse} />
        </SortablePanel>
      ),
      narratives: (
        <SortablePanel
          id="narratives"
          title="Trending Narratives"
          eyebrow="Capital flow"
          mode={panelMode(data.narratives)}
          className={panelClasses.narratives}
        >
          <NarrativesPanel narratives={data.narratives} />
        </SortablePanel>
      ),
      opportunities: (
        <SortablePanel
          id="opportunities"
          title="AI Conviction Opportunities"
          eyebrow="Ranked tokens"
          mode={panelMode(data.opportunities)}
          className={panelClasses.opportunities}
        >
          <OpportunitiesPanel tokens={data.opportunities} />
        </SortablePanel>
      ),
      launches: (
        <SortablePanel
          id="launches"
          title="New Launches"
          eyebrow="Live-feeling feed"
          mode={panelMode(data.launches)}
          className={panelClasses.launches}
        >
          <LaunchesPanel launches={data.launches} />
        </SortablePanel>
      ),
      movers: (
        <SortablePanel
          id="movers"
          title="Movers Heatmap"
          eyebrow="Treemap by mcap"
          mode={panelMode(data.movers)}
          className={panelClasses.movers}
        >
          <MoversPanel movers={data.movers} />
        </SortablePanel>
      ),
    };
  }, [dashboardQuery.data]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPanelOrder((items) => {
      const oldIndex = items.indexOf(active.id as PanelId);
      const newIndex = items.indexOf(over.id as PanelId);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  if (dashboardQuery.isLoading || !dashboardQuery.data || !panels) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="panel-grid min-h-[calc(100vh-73px)] pb-16">
      <section className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Master Dashboard</p>
            <h1 className="text-4xl font-semibold tracking-[-0.06em] md:text-6xl">Signal command deck</h1>
          </div>
          <div className="text-right">
            <SourceBadge mode="sample" />
            <p className="mt-2 text-xs text-muted">Panel order persists locally. Drag handles reorder modules.</p>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={panelOrder} strategy={rectSortingStrategy}>
            <div className="grid gap-4 lg:grid-cols-6">{panelOrder.map((id) => panels[id])}</div>
          </SortableContext>
        </DndContext>
      </section>
      <AlertsTicker alerts={dashboardQuery.data.alerts} />
    </div>
  );
}
