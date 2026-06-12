"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { marketSource } from "@/lib/datasources";
import { fmtPct } from "@/lib/utils";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import type { HeatmapCell } from "@/lib/datasources/types";

function changeColor(pct: number): string {
  const abs = Math.min(Math.abs(pct), 30);
  const intensity = abs / 30;
  if (pct > 0) {
    const g = Math.round(61 + (220 - 61) * intensity);
    const b = Math.round(151 * (1 - intensity * 0.6));
    return `rgba(61, ${g}, ${b}, ${0.3 + intensity * 0.5})`;
  }
  const r = Math.round(180 + (255 - 180) * intensity);
  return `rgba(${r}, 77, 94, ${0.3 + intensity * 0.5})`;
}

interface TreemapNode {
  cell: HeatmapCell;
  x: number; y: number; w: number; h: number;
}

function buildTreemap(cells: HeatmapCell[], width: number, height: number): TreemapNode[] {
  const nodes: TreemapNode[] = [];

  function layout(items: HeatmapCell[], x: number, y: number, w: number, h: number) {
    if (!items.length) return;
    if (items.length === 1) {
      nodes.push({ cell: items[0], x, y, w, h });
      return;
    }
    const localTotal = items.reduce((s, c) => s + c.mcap, 0);
    let sumA = 0;
    let split = 0;
    for (let i = 0; i < items.length - 1; i++) {
      sumA += items[i].mcap;
      if (sumA / localTotal >= 0.5) { split = i + 1; break; }
    }
    split = split || 1;

    const ratio = items.slice(0, split).reduce((s, c) => s + c.mcap, 0) / localTotal;
    if (w >= h) {
      layout(items.slice(0, split), x, y, w * ratio, h);
      layout(items.slice(split), x + w * ratio, y, w * (1 - ratio), h);
    } else {
      layout(items.slice(0, split), x, y, w, h * ratio);
      layout(items.slice(split), x, y + h * ratio, w, h * (1 - ratio));
    }
  }

  const sorted = [...cells].sort((a, b) => b.mcap - a.mcap).slice(0, 60);
  layout(sorted, 0, 0, width, height);
  return nodes;
}

const W = 480, H = 220;

export function MoversHeatmap() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["heatmap"],
    queryFn:  () => marketSource.getHeatmap(),
    refetchInterval: 60_000,
  });

  const nodes = useMemo(
    () => data ? buildTreemap(data.cells, W, H) : [],
    [data]
  );

  if (isLoading) return (
    <div className="panel-surface overflow-hidden h-full flex flex-col">
      <PanelHeader label="Movers Heatmap" />
      <Skeleton className="flex-1 m-3 rounded" />
    </div>
  );

  return (
    <div className="panel-surface overflow-hidden h-full flex flex-col">
      <PanelHeader label="Movers Heatmap" mode={data?.source.mode ?? "sample"} />
      <div className="flex-1 p-3 min-h-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          style={{ maxHeight: 240 }}
        >
          {nodes.map(({ cell, x, y, w, h }) => {
            const pad = 1.5;
            const fontSize = Math.max(8, Math.min(14, w * 0.18));
            return (
              <g
                key={cell.address}
                onClick={() => router.push(`/token/${cell.address}`)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x + pad} y={y + pad}
                  width={w - pad * 2} height={h - pad * 2}
                  fill={changeColor(cell.change24h)}
                  rx={3}
                  className="transition-opacity hover:opacity-80"
                />
                {w > 40 && h > 24 && (
                  <>
                    <text
                      x={x + w / 2} y={y + h / 2 - (h > 36 ? 5 : 0)}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="#E8ECF4" fontSize={fontSize}
                      fontFamily="Space Grotesk, sans-serif" fontWeight="600"
                    >
                      {cell.symbol}
                    </text>
                    {h > 36 && (
                      <text
                        x={x + w / 2} y={y + h / 2 + fontSize}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={cell.change24h >= 0 ? "#3DDC97" : "#FF4D5E"}
                        fontSize={Math.max(7, fontSize * 0.75)}
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {fmtPct(cell.change24h)}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
