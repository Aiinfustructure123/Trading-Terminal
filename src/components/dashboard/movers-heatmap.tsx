"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMovers } from "@/lib/hooks/use-data";
import { Panel, Skeleton } from "@/components/ui/primitives";
import type { MoverCell } from "@/lib/datasources/types";
import { clamp } from "@/lib/utils";

interface Rect {
  cell: MoverCell;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Slice-and-dice treemap: recursively split the value-sorted set in
    half along alternating axes. Robust and gap-free. */
function treemap(cells: MoverCell[], x: number, y: number, w: number, h: number, horizontal: boolean): Rect[] {
  if (cells.length === 0) return [];
  if (cells.length === 1) return [{ cell: cells[0], x, y, w, h }];
  const total = cells.reduce((s, c) => s + c.marketCap, 0);
  let acc = 0;
  let i = 0;
  for (; i < cells.length - 1; i++) {
    acc += cells[i].marketCap;
    if (acc >= total / 2) break;
  }
  const left = cells.slice(0, i + 1);
  const right = cells.slice(i + 1);
  const leftVal = left.reduce((s, c) => s + c.marketCap, 0);
  const ratio = leftVal / total;
  if (horizontal) {
    const lw = w * ratio;
    return [...treemap(left, x, y, lw, h, !horizontal), ...treemap(right, x + lw, y, w - lw, h, !horizontal)];
  }
  const lh = h * ratio;
  return [...treemap(left, x, y, w, lh, !horizontal), ...treemap(right, x, y + lh, w, h - lh, !horizontal)];
}

function cellColor(change: number): string {
  const mag = clamp(Math.abs(change) / 30, 0.12, 0.85);
  if (change >= 0) return `color-mix(in srgb, #3DDC97 ${mag * 100}%, #0E1117)`;
  return `color-mix(in srgb, #FF4D5E ${mag * 100}%, #0E1117)`;
}

export function MoversHeatmap() {
  const { data, isLoading } = useMovers();
  const rects = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => b.marketCap - a.marketCap).slice(0, 32);
    return treemap(sorted, 0, 0, 100, 100, true);
  }, [data]);

  return (
    <Panel title="Movers — Heatmap by Market Cap" source="market" className="h-full" dense>
      <div className="p-2">
        {isLoading || !data ? (
          <Skeleton className="aspect-[16/9] w-full rounded-md" />
        ) : (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md">
            {rects.map((r) => (
              <Link
                key={r.cell.address}
                href={`/token/${r.cell.address}`}
                className="absolute overflow-hidden border border-bg/60 p-1 transition-opacity hover:opacity-80"
                style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`, background: cellColor(r.cell.change24h) }}
                title={`${r.cell.symbol} ${r.cell.change24h >= 0 ? "+" : ""}${r.cell.change24h.toFixed(1)}%`}
              >
                {r.w > 8 && r.h > 12 && (
                  <div className="flex h-full flex-col justify-center">
                    <span className="truncate font-mono text-[10px] font-bold leading-tight text-ink">{r.cell.symbol}</span>
                    {r.h > 20 && <span className="font-mono text-[9px] tabular-nums text-ink/80">{r.cell.change24h >= 0 ? "+" : ""}{r.cell.change24h.toFixed(1)}%</span>}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
