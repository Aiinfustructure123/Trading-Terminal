"use client";

import { useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
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
import { GripVertical } from "lucide-react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { NarrativesPanel } from "./narratives-panel";
import { OpportunitiesPanel } from "./opportunities-panel";
import { LaunchesPanel } from "./launches-panel";
import { HeatmapPanel } from "./heatmap-panel";

const PANELS: Record<string, { node: React.ReactNode; label: string }> = {
  narratives: { node: <NarrativesPanel />, label: "Trending narratives" },
  opportunities: { node: <OpportunitiesPanel />, label: "AI conviction opportunities" },
  launches: { node: <LaunchesPanel />, label: "New launches" },
  heatmap: { node: <HeatmapPanel />, label: "Movers heatmap" },
};

const DEFAULT_ORDER = ["narratives", "opportunities", "launches", "heatmap"];

function SortablePanel({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative h-[400px] min-w-0", isDragging && "z-20 opacity-80")}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${label} panel`}
        className="absolute right-2 top-1.5 z-10 cursor-grab rounded p-1 text-muted/40 opacity-0 transition-opacity hover:text-muted focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-3.5" aria-hidden />
      </button>
      <div className="h-full [&>section]:h-full">{children}</div>
    </div>
  );
}

export function DashboardGrid() {
  const [order, setOrder] = useLocalStorage<string[]>("alpha:dashboard-order", DEFAULT_ORDER);

  // Heal layouts saved by older versions
  const ids = useMemo(() => {
    const known = order.filter((id) => PANELS[id]);
    const missing = DEFAULT_ORDER.filter((id) => !known.includes(id));
    return [...known, ...missing];
  }, [order]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      setOrder(arrayMove(ids, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {ids.map((id) => (
            <SortablePanel key={id} id={id} label={PANELS[id].label}>
              {PANELS[id].node}
            </SortablePanel>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
