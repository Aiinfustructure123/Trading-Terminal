"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  DashboardPanelId,
  setDashboardLayout,
  useDashboardLayout,
} from "@/lib/store/dashboard-layout";
import { SourceKey } from "@/lib/datasources/config";
import { Panel } from "@/components/terminal/panel";
import { cn } from "@/lib/utils";
import { TrendingNarratives } from "./trending-narratives";
import { ConvictionOpportunities } from "./conviction-opportunities";
import { NewLaunchesFeed } from "./new-launches";
import { MoversHeatmap } from "./movers-heatmap";

interface PanelDef {
  title: string;
  source: SourceKey;
  span: string;
  body: React.ReactNode;
  bodyClassName?: string;
}

const PANELS: Record<DashboardPanelId, PanelDef> = {
  opportunities: {
    title: "AI Conviction Opportunities",
    source: "market",
    span: "xl:col-span-7",
    body: <ConvictionOpportunities />,
  },
  narratives: {
    title: "Trending Narratives",
    source: "trends",
    span: "xl:col-span-5",
    body: <TrendingNarratives />,
    bodyClassName: "max-h-[324px] overflow-y-auto",
  },
  heatmap: {
    title: "Movers Heatmap",
    source: "market",
    span: "xl:col-span-7",
    body: <MoversHeatmap />,
  },
  launches: {
    title: "New Launches",
    source: "market",
    span: "xl:col-span-5",
    body: <NewLaunchesFeed />,
    bodyClassName: "max-h-[312px] overflow-y-auto",
  },
};

function SortablePanel({ id }: { id: DashboardPanelId }) {
  const def = PANELS[id];
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(def.span, isDragging && "z-30 opacity-90")}
    >
      <Panel
        title={def.title}
        source={def.source}
        bodyClassName={def.bodyClassName}
        className={cn("h-full", isDragging && "border-signal/40")}
        leading={
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${def.title} panel`}
            className="-ml-1 cursor-grab touch-none rounded p-0.5 text-muted/60 hover:text-ink active:cursor-grabbing"
          >
            <GripVertical size={12} />
          </button>
        }
      >
        {def.body}
      </Panel>
    </div>
  );
}

/** Draggable, reorderable dashboard grid — layout persisted to localStorage. */
export function DashboardGrid() {
  const layout = useDashboardLayout();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = layout.indexOf(active.id as DashboardPanelId);
    const newIndex = layout.indexOf(over.id as DashboardPanelId);
    setDashboardLayout(arrayMove(layout, oldIndex, newIndex));
  }

  return (
    <DndContext
      id="dashboard-grid"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={layout} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          {layout.map((id) => (
            <SortablePanel key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
