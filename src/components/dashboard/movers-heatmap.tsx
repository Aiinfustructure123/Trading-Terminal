"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { MoverCell } from "@/lib/datasources";
import { useMovers } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { clamp } from "@/lib/utils";

interface Rect {
  cell: MoverCell;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Squarified treemap layout. */
function squarify(cells: MoverCell[], width: number, height: number): Rect[] {
  const total = cells.reduce((a, c) => a + c.marketCapUsd, 0);
  if (total <= 0 || width <= 0 || height <= 0) return [];
  const scale = (width * height) / total;
  const items = cells.map((c) => ({ cell: c, area: c.marketCapUsd * scale }));

  const result: Rect[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;

  const worst = (row: number[], shortSide: number) => {
    const sum = row.reduce((a, b) => a + b, 0);
    const max = Math.max(...row);
    const min = Math.min(...row);
    const s2 = sum * sum;
    return Math.max((shortSide * shortSide * max) / s2, s2 / (shortSide * shortSide * min));
  };

  let i = 0;
  while (i < items.length) {
    const horizontal = w >= h;
    const shortSide = horizontal ? h : w;
    const row: number[] = [];
    let rowStart = i;

    while (i < items.length) {
      const candidate = [...row, items[i]!.area];
      if (row.length === 0 || worst(row, shortSide) >= worst(candidate, shortSide)) {
        row.push(items[i]!.area);
        i++;
      } else {
        break;
      }
    }

    const rowSum = row.reduce((a, b) => a + b, 0);
    const rowThickness = rowSum / shortSide;
    let offset = 0;
    for (let j = rowStart; j < i; j++) {
      const area = items[j]!.area;
      const cellLength = area / rowThickness;
      if (horizontal) {
        result.push({ cell: items[j]!.cell, x, y: y + offset, w: rowThickness, h: cellLength });
      } else {
        result.push({ cell: items[j]!.cell, x: x + offset, y, w: cellLength, h: rowThickness });
      }
      offset += cellLength;
    }

    if (horizontal) {
      x += rowThickness;
      w -= rowThickness;
    } else {
      y += rowThickness;
      h -= rowThickness;
    }
  }

  return result;
}

function tileColor(change: number) {
  const mag = clamp(Math.abs(change) / 30, 0.12, 0.85);
  const c = change >= 0 ? "var(--profit)" : "var(--danger)";
  return `rgb(${c} / ${mag.toFixed(2)})`;
}

export function MoversHeatmapPanel({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const { data, isLoading } = useMovers(36);
  const router = useRouter();
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const rects = React.useMemo(
    () => (data && size.w > 0 ? squarify(data, size.w, size.h) : []),
    [data, size],
  );

  return (
    <Panel title="Movers · by market cap, 24h" sourceKey="market" live bodyClassName="p-2" actions={dragHandle}>
      <div ref={ref} className="relative h-[320px] w-full">
        {isLoading || !data ? (
          <Skeleton className="h-full w-full" />
        ) : (
          rects.map((r) => {
            const showText = r.w > 44 && r.h > 28;
            return (
              <button
                key={r.cell.id}
                onClick={() => router.push(`/token/${r.cell.id}`)}
                className="absolute overflow-hidden border border-bg/60 text-left transition-transform hover:z-10 hover:scale-[1.02] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70"
                style={{ left: r.x, top: r.y, width: r.w, height: r.h, backgroundColor: tileColor(r.cell.change24h) }}
                title={`${r.cell.symbol} ${r.cell.change24h > 0 ? "+" : ""}${r.cell.change24h.toFixed(1)}%`}
              >
                {showText && (
                  <span className="flex h-full flex-col justify-center px-1.5 leading-tight">
                    <span className="truncate font-mono text-[11px] font-bold text-ink">{r.cell.symbol}</span>
                    <span className="tabular text-[10px] text-ink/80">
                      {r.cell.change24h > 0 ? "+" : ""}
                      {r.cell.change24h.toFixed(1)}%
                    </span>
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </Panel>
  );
}
