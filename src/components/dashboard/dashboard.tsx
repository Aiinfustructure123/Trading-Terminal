"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, rectSortingStrategy, sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RotateCcw } from "lucide-react";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { TrendingNarratives } from "@/components/dashboard/trending-narratives";
import { ConvictionOpportunities } from "@/components/dashboard/conviction-opportunities";
import { NewLaunches } from "@/components/dashboard/new-launches";
import { MoversHeatmap } from "@/components/dashboard/movers-heatmap";
import { Eyebrow } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type PanelId = "opportunities" | "narratives" | "launches" | "movers";

const PANEL_META: Record<PanelId, { span: string; render: () => React.ReactNode }> = {
  opportunities: { span: "lg:col-span-2", render: () => <ConvictionOpportunities /> },
  narratives: { span: "lg:col-span-1 lg:row-span-2", render: () => <TrendingNarratives /> },
  launches: { span: "lg:col-span-1 lg:row-span-2", render: () => <NewLaunches /> },
  movers: { span: "lg:col-span-2", render: () => <MoversHeatmap /> },
};

const DEFAULT_ORDER: PanelId[] = ["opportunities", "narratives", "launches", "movers"];
const STORAGE_KEY = "alpha.dashboard.order";

function SortableCard({ id }: { id: PanelId }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const meta = PANEL_META[id];
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative", meta.span, isDragging && "z-50 opacity-80")}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder panel"
        className="absolute right-2 top-1.5 z-20 hidden rounded p-1 text-muted/50 transition-colors hover:bg-panel-2 hover:text-signal group-hover/dash:block"
      >
        <GripVertical className="size-3.5" />
      </button>
      {meta.render()}
    </div>
  );
}

export function Dashboard() {
  const [order, setOrder] = useState<PanelId[]>(DEFAULT_ORDER);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length === DEFAULT_ORDER.length) setOrder(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const next = arrayMove(prev, prev.indexOf(active.id as PanelId), prev.indexOf(over.id as PanelId));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    setOrder(DEFAULT_ORDER);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="group/dash flex flex-col gap-3 p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>Master Dashboard</Eyebrow>
          <h1 className="font-display text-xl font-semibold text-ink">Signals Overview</h1>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-mono text-[10px] text-muted hover:border-signal/40 hover:text-signal">
          <RotateCcw className="size-3" /> Reset layout
        </button>
      </div>

      <MarketPulse />

      {mounted && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToParentElement]}>
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:[grid-auto-rows:minmax(0,auto)]">
              {order.map((id) => (
                <SortableCard key={id} id={id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <p className="font-mono text-[10px] text-muted">Hover a panel and drag the grip to reorder. Layout persists to localStorage.</p>
    </div>
  );
}
