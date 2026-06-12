"use client";

import * as React from "react";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RotateCcw } from "lucide-react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/panel";
import { TrendingNarrativesPanel } from "@/components/dashboard/trending-narratives";
import { ConvictionOpportunitiesPanel } from "@/components/dashboard/conviction-opportunities";
import { NewLaunchesPanel } from "@/components/dashboard/new-launches";
import { MoversHeatmapPanel } from "@/components/dashboard/movers-heatmap";
import { cn } from "@/lib/utils";

type PanelId = "narratives" | "opportunities" | "movers" | "launches";

const PANELS: Record<PanelId, { span: string; render: (handle: React.ReactNode) => React.ReactNode }> = {
  opportunities: {
    span: "lg:col-span-3",
    render: (h) => <ConvictionOpportunitiesPanel dragHandle={h} />,
  },
  narratives: {
    span: "lg:col-span-3",
    render: (h) => <TrendingNarrativesPanel dragHandle={h} />,
  },
  movers: {
    span: "lg:col-span-4",
    render: (h) => <MoversHeatmapPanel dragHandle={h} />,
  },
  launches: {
    span: "lg:col-span-2",
    render: (h) => <NewLaunchesPanel dragHandle={h} />,
  },
};

const DEFAULT_ORDER: PanelId[] = ["opportunities", "narratives", "movers", "launches"];

type SortableState = ReturnType<typeof useSortable>;

function DragHandle({ attributes, listeners }: { attributes: SortableState["attributes"]; listeners: SortableState["listeners"] }) {
  return (
    <button
      className="cursor-grab touch-none rounded-sm p-1 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 active:cursor-grabbing"
      aria-label="Drag to reorder panel"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

function SortablePanel({ id }: { id: PanelId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("min-w-0", PANELS[id].span, isDragging && "z-20 opacity-80")}
    >
      {PANELS[id].render(<DragHandle attributes={attributes} listeners={listeners} />)}
    </div>
  );
}

export function DashboardGrid() {
  const [order, setOrder, hydrated] = useLocalStorage<PanelId[]>("alpha:dashboard-order", DEFAULT_ORDER);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Guard against stale/invalid persisted ids.
  const safeOrder = React.useMemo(() => {
    const valid = order.filter((id): id is PanelId => id in PANELS);
    const missing = DEFAULT_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  }, [order]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = safeOrder.indexOf(active.id as PanelId);
    const newIndex = safeOrder.indexOf(over.id as PanelId);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...safeOrder];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved!);
    setOrder(next);
  };

  if (!hydrated) {
    return <div className="grid grid-cols-1 gap-4 lg:grid-cols-6" aria-hidden />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="mb-2 flex items-center justify-between">
        <Eyebrow>Workspace · drag panels to reorder · layout saved locally</Eyebrow>
        <Button variant="ghost" size="xs" onClick={() => setOrder(DEFAULT_ORDER)}>
          <RotateCcw className="h-3 w-3" /> Reset layout
        </Button>
      </div>
      <SortableContext items={safeOrder} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
          {safeOrder.map((id) => (
            <SortablePanel key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
