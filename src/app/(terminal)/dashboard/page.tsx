"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { MarketPulseStrip } from "@/components/dashboard/MarketPulseStrip";
import { NarrativesPanel } from "@/components/dashboard/NarrativesPanel";
import { ConvictionOpportunities } from "@/components/dashboard/ConvictionOpportunities";
import { NewLaunchesFeed } from "@/components/dashboard/NewLaunchesFeed";
import { MoversHeatmap } from "@/components/dashboard/MoversHeatmap";

// ── Panel registry ───────────────────────────────────────────────────────────

const PANELS = {
  narratives:    { label: "Narratives",     height: "h-[420px]",  component: NarrativesPanel },
  opportunities: { label: "Opportunities",  height: "h-[420px]",  component: ConvictionOpportunities },
  launches:      { label: "New Launches",   height: "h-[420px]",  component: NewLaunchesFeed },
  heatmap:       { label: "Heatmap",        height: "h-[300px]",  component: MoversHeatmap },
} as const;

type PanelId = keyof typeof PANELS;
const DEFAULT_ORDER: PanelId[] = ["opportunities", "narratives", "launches", "heatmap"];
const STORAGE_KEY = "alpha-terminal-panel-order";

// ── Sortable panel wrapper ────────────────────────────────────────────────────

function SortablePanel({ id }: { id: PanelId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const panel = PANELS[id];
  const Component = panel.component;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : "auto",
      }}
      className={`${panel.height} relative`}
    >
      {/* Drag handle — top-right corner */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1 rounded text-muted hover:text-ink
                   hover:bg-border/50 cursor-grab active:cursor-grabbing transition-colors"
        aria-label="Drag to reorder panel"
      >
        <GripVertical size={14} />
      </div>
      <Component />
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [order, setOrder] = useState<PanelId[]>(DEFAULT_ORDER);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PanelId[];
        // Validate that the saved order is still valid
        if (parsed.every(id => id in PANELS)) setOrder(parsed);
      }
    } catch {}
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder(prev => {
        const next = arrayMove(prev, prev.indexOf(active.id as PanelId), prev.indexOf(over.id as PanelId));
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Market Pulse — fixed top strip */}
      <MarketPulseStrip />

      {/* Draggable panel grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {order.map(id => (
                <SortablePanel key={id} id={id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
