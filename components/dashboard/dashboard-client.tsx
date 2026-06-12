"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { GripVertical, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ConvictionRing } from "@/components/conviction-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow, MetricBlock, Panel } from "@/components/ui/panel";
import { datasources } from "@/lib/datasources";
import type {
  ConvictionSegment,
  DashboardSnapshot,
  NewLaunch,
  Narrative,
  RiskTier,
  Token
} from "@/lib/datasources/types";
import { cn, formatCompact, formatCurrency, formatPercent } from "@/lib/utils";

const layoutStorageKey = "alpha-terminal-dashboard-layout-v1";
const defaultPanelOrder = ["pulse", "narratives", "opportunities", "launches", "heatmap"] as const;
type PanelId = (typeof defaultPanelOrder)[number];

type ScoreSelection = {
  token: Token;
  segment?: ConvictionSegment;
};

export function DashboardClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: () => datasources.market.getDashboardSnapshot(),
    refetchInterval: 5_000
  });
  const [panelOrder, setPanelOrder] = useState<PanelId[]>([...defaultPanelOrder]);
  const [scoreSelection, setScoreSelection] = useState<ScoreSelection | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(layoutStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as PanelId[];
      const known = parsed.filter((id): id is PanelId => defaultPanelOrder.includes(id));
      const missing = defaultPanelOrder.filter((id) => !known.includes(id));
      setPanelOrder([...known, ...missing]);
    } catch {
      setPanelOrder([...defaultPanelOrder]);
    }
  }, []);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setPanelOrder((current) => {
      const oldIndex = current.indexOf(active.id as PanelId);
      const newIndex = current.indexOf(over.id as PanelId);
      const next = arrayMove(current, oldIndex, newIndex);
      window.localStorage.setItem(layoutStorageKey, JSON.stringify(next));
      return next;
    });
  }

  const panelMap = useMemo(() => {
    if (!data) return null;

    return {
      pulse: <MarketPulsePanel snapshot={data} />,
      narratives: <NarrativesPanel snapshot={data} />,
      opportunities: <OpportunitiesPanel snapshot={data} onScoreSelect={setScoreSelection} />,
      launches: <NewLaunchesPanel snapshot={data} />,
      heatmap: <HeatmapPanel snapshot={data} />
    } satisfies Record<PanelId, React.ReactNode>;
  }, [data]);

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 pb-20 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Phase 0 terminal interface</Eyebrow>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-ink md:text-6xl">Master Dashboard</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Modular signal panels running on typed sample sources. Every panel is explicitly marked SAMPLE DATA
            until its datasource mode is switched live.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-panel px-4 py-3">
          <Eyebrow>Operator hint</Eyebrow>
          <div className="mt-1 text-sm text-ink">Drag panel handles to reorder. Layout persists locally.</div>
        </div>
      </div>

      {isLoading || !data || !panelMap ? (
        <DashboardSkeleton />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={panelOrder} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              {panelOrder.map((id) => (
                <SortablePanel key={id} id={id} className={id === "pulse" ? "xl:col-span-12" : "xl:col-span-6"}>
                  {panelMap[id]}
                </SortablePanel>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {data ? <AlertsTicker snapshot={data} /> : null}
      {scoreSelection ? <ScoreBreakdownModal selection={scoreSelection} onClose={() => setScoreSelection(null)} /> : null}
    </main>
  );
}

function SortablePanel({
  id,
  children,
  className
}: {
  id: PanelId;
  children: React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging && "z-30 scale-[1.01] opacity-90", className)}
    >
      <button
        type="button"
        className="absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-full border border-border bg-bg/80 text-muted transition-colors hover:border-signal/40 hover:text-signal"
        aria-label="Drag panel"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      {children}
    </div>
  );
}

function MarketPulsePanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  const { pulse, source } = snapshot;

  return (
    <Panel title="Market Pulse" eyebrow="Global tape" mode={source.mode} contentClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricBlock
        label="Global mcap"
        value={formatCurrency(pulse.globalMarketCap)}
        delta="+1.84% 24h"
        tone="profit"
        className="animate-cyan-flash"
      />
      <MetricBlock label="24h volume" value={formatCurrency(pulse.volume24h)} delta="+8.31% vs 7d avg" tone="signal" />
      <MetricBlock label="BTC dominance" value={`${pulse.btcDominance.toFixed(2)}%`} delta="-0.18 pts" tone="warn" />
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Fear / greed</div>
        <div className="flex items-center gap-3">
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-bg">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-signal shadow-[0_0_18px_rgba(92,225,230,0.32)]"
              style={{ width: `${pulse.fearGreed}%` }}
            />
          </div>
          <span className="data-text text-xl font-semibold text-ink">{Math.round(pulse.fearGreed)}</span>
        </div>
        <div className="data-text mt-2 text-xs text-muted">{new Date(pulse.updatedAt).toLocaleTimeString()}</div>
      </div>
    </Panel>
  );
}

function NarrativesPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  const maxFlow = Math.max(...snapshot.narratives.map((narrative) => narrative.flow7d));

  return (
    <Panel title="Trending Narratives" eyebrow="Capital-flow ranks" mode={snapshot.source.mode}>
      <div className="grid gap-3 sm:grid-cols-2">
        {snapshot.narratives.map((narrative) => (
          <NarrativeCard key={narrative.id} narrative={narrative} maxFlow={maxFlow} />
        ))}
      </div>
    </Panel>
  );
}

function NarrativeCard({ narrative, maxFlow }: { narrative: Narrative; maxFlow: number }) {
  return (
    <div className="rounded-xl border border-border bg-bg/45 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Rank #{narrative.rank}</div>
          <div className="mt-1 text-xl font-bold text-ink">{narrative.name}</div>
        </div>
        <span className="data-text text-2xl font-bold text-signal">{narrative.conviction}</span>
      </div>
      <FlowBar label="24h flow" value={narrative.flow24h} max={maxFlow} tone="signal" />
      <FlowBar label="7d flow" value={narrative.flow7d} max={maxFlow} tone="profit" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {narrative.leaders.map((leader) => (
          <Badge key={leader} tone="muted">
            {leader}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function FlowBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "signal" | "profit" }) {
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted">
        <span>{label}</span>
        <span className="data-text">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-panel">
        <div className={cn("h-full rounded-full", tone === "signal" ? "bg-signal" : "bg-profit")} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function OpportunitiesPanel({
  snapshot,
  onScoreSelect
}: {
  snapshot: DashboardSnapshot;
  onScoreSelect: (selection: ScoreSelection) => void;
}) {
  return (
    <Panel title="AI Conviction Opportunities" eyebrow="Explainable rank" mode={snapshot.source.mode}>
      <div className="grid gap-3">
        {snapshot.opportunities.map((token) => (
          <div
            key={token.id}
            role="button"
            tabIndex={0}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-border bg-bg/45 p-3 text-left transition-colors hover:border-signal/35 hover:bg-signal/[0.035]"
            onClick={() => onScoreSelect({ token })}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onScoreSelect({ token });
              }
            }}
          >
            <ConvictionRing score={token.conviction} segments={token.segments} size="md" onOpenBreakdown={(segment) => onScoreSelect({ token, segment })} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-lg font-bold text-ink">{token.symbol}</div>
                <Badge tone={riskTone(token.riskTier)}>{token.riskTier}</Badge>
              </div>
              <div className="mt-1 truncate text-sm text-muted">{token.name} / {token.chain.toUpperCase()}</div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{token.summary}</p>
            </div>
            <div className="hidden text-right sm:block">
              <div className="data-text text-sm font-semibold text-ink">{formatCurrency(token.marketCap)}</div>
              <div className={cn("data-text mt-1 text-xs", token.deltas.h24 >= 0 ? "text-profit" : "text-danger")}>
                {formatPercent(token.deltas.h24)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NewLaunchesPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <Panel title="New Launches" eyebrow="Live-style feed" mode={snapshot.source.mode}>
      <div className="space-y-2">
        {snapshot.newLaunches.map((launch, index) => (
          <LaunchRow key={launch.id} launch={launch} index={index} />
        ))}
      </div>
    </Panel>
  );
}

function LaunchRow({ launch, index }: { launch: NewLaunch; index: number }) {
  return (
    <div
      className="animate-feed-in rounded-xl border border-border bg-bg/45 p-3"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">{launch.symbol}</span>
            <Badge tone={riskTone(launch.riskTier)}>{launch.riskTier}</Badge>
          </div>
          <div className="mt-1 text-xs text-muted">{launch.name} / {launch.chain.toUpperCase()} / {launch.ageMinutes}m old</div>
        </div>
        <div className="text-right">
          <div className="data-text text-sm text-ink">{formatCurrency(launch.volume1h)}</div>
          <div className="data-text mt-1 text-xs text-muted">1h volume</div>
        </div>
      </div>
      <div className="mt-2 text-xs leading-5 text-muted">{launch.riskReason}</div>
      <div className="data-text mt-2 text-xs text-signal">Liquidity {formatCurrency(launch.liquidity)}</div>
    </div>
  );
}

function HeatmapPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  const totalCap = snapshot.heatmap.reduce((sum, tile) => sum + tile.marketCap, 0);

  return (
    <Panel title="Movers Heatmap" eyebrow="Treemap by mcap / colored by 24h" mode={snapshot.source.mode}>
      <div className="flex h-[360px] flex-wrap gap-2 overflow-hidden rounded-xl border border-border bg-bg p-2">
        {snapshot.heatmap.map((tile) => {
          const basis = Math.max(18, (tile.marketCap / totalCap) * 240);
          const tone = tile.change24h >= 0 ? "rgba(61, 220, 151," : "rgba(255, 77, 94,";
          const opacity = Math.min(0.5, Math.max(0.12, Math.abs(tile.change24h) / 100));

          return (
            <div
              key={tile.id}
              className="min-h-20 flex-1 rounded-lg border border-white/10 p-3"
              style={{
                flexBasis: `${basis}%`,
                background: `${tone} ${opacity})`
              }}
            >
              <div className="text-sm font-bold text-ink">{tile.symbol}</div>
              <div className={cn("data-text mt-1 text-xs", tile.change24h >= 0 ? "text-profit" : "text-danger")}>
                {formatPercent(tile.change24h)}
              </div>
              <div className="data-text mt-3 text-[11px] text-muted">{formatCompact(tile.marketCap)}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function AlertsTicker({ snapshot }: { snapshot: DashboardSnapshot }) {
  const items = [...snapshot.alerts, ...snapshot.alerts];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/92 backdrop-blur-xl">
      <div className="overflow-hidden py-2">
        <div className="flex w-max animate-ticker gap-6 px-4">
          {items.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center gap-2 text-xs uppercase tracking-[0.16em]">
              <span className={cn("size-2 rounded-full", severityDot(item.severity))} />
              <span className="text-muted">{new Date(item.timestamp).toLocaleTimeString()}</span>
              <span className="text-ink">{item.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdownModal({ selection, onClose }: { selection: ScoreSelection; onClose: () => void }) {
  const { token, segment } = selection;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/62 p-4 backdrop-blur-xl" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-panel shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <Eyebrow>Score explanation</Eyebrow>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink">{token.symbol} conviction inputs</h2>
            {segment ? <p className="mt-2 text-sm text-muted">Focused segment: {segment.label}</p> : null}
          </div>
          <Button aria-label="Close score breakdown" className="size-9 rounded-full px-0" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[140px_1fr]">
          <div className="grid place-items-center rounded-2xl border border-border bg-bg/55 p-4">
            <ConvictionRing score={token.conviction} segments={token.segments} size="lg" />
            <div className="data-text mt-3 text-sm text-muted">{Math.round(token.conviction)} / 100</div>
          </div>
          <div className="space-y-2">
            {token.segments.map((item) => (
              <div
                key={item.key}
                className={cn(
                  "rounded-xl border border-border bg-bg/45 p-3",
                  segment?.key === item.key && "border-signal/45 shadow-signal"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-ink">{item.label}</div>
                  <div className="data-text text-xs text-muted">
                    {Math.round(item.value)} score x {Math.round(item.weight * 100)}% weight
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">{item.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {[0, 1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className={cn(
            "min-h-[260px] animate-pulse rounded-2xl border border-border bg-panel",
            item === 0 ? "xl:col-span-12" : "xl:col-span-6"
          )}
        >
          <div className="border-b border-border p-4">
            <div className="h-3 w-28 rounded bg-white/10" />
            <div className="mt-3 h-5 w-48 rounded bg-white/10" />
          </div>
          <div className="grid gap-3 p-4">
            <div className="h-16 rounded-xl bg-white/5" />
            <div className="h-16 rounded-xl bg-white/5" />
            <div className="h-16 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function riskTone(risk: RiskTier) {
  if (risk === "Low") return "profit";
  if (risk === "Moderate") return "warn";
  return "danger";
}

function severityDot(severity: "info" | "warn" | "danger" | "profit") {
  if (severity === "profit") return "bg-profit";
  if (severity === "warn") return "bg-warn";
  if (severity === "danger") return "bg-danger";
  return "bg-signal";
}
