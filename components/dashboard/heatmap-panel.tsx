"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTopMovers } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompact, formatPct } from "@/lib/format";
import type { Token } from "@/lib/datasources/types";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  token: Token;
}

/** Squarified treemap layout (Bruls et al.) — sized by mcap. */
function squarify(tokens: Token[], width: number, height: number): Rect[] {
  const total = tokens.reduce((a, t) => a + t.marketCap, 0);
  const scaled = tokens.map((t) => ({ token: t, area: (t.marketCap / total) * width * height }));
  const rects: Rect[] = [];

  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let row: typeof scaled = [];
  let i = 0;

  const worst = (r: typeof scaled, length: number) => {
    const sum = r.reduce((a, s) => a + s.area, 0);
    const max = Math.max(...r.map((s) => s.area));
    const min = Math.min(...r.map((s) => s.area));
    const s2 = sum * sum;
    const l2 = length * length;
    return Math.max((l2 * max) / s2, s2 / (l2 * min));
  };

  const layoutRow = (r: typeof scaled) => {
    const sum = r.reduce((a, s) => a + s.area, 0);
    const horizontal = w >= h;
    const length = horizontal ? h : w;
    const thickness = sum / length;
    let offset = 0;
    for (const s of r) {
      const side = s.area / thickness;
      rects.push(
        horizontal
          ? { x, y: y + offset, w: thickness, h: side, token: s.token }
          : { x: x + offset, y, w: side, h: thickness, token: s.token }
      );
      offset += side;
    }
    if (horizontal) {
      x += thickness;
      w -= thickness;
    } else {
      y += thickness;
      h -= thickness;
    }
  };

  while (i < scaled.length) {
    const length = Math.min(w, h);
    const next = scaled[i];
    if (row.length === 0 || worst([...row, next], length) <= worst(row, length)) {
      row.push(next);
      i++;
    } else {
      layoutRow(row);
      row = [];
    }
  }
  if (row.length) layoutRow(row);
  return rects;
}

function heatColor(change: number): string {
  const t = Math.max(-1, Math.min(1, change / 30));
  if (t >= 0) {
    return `rgba(61, 220, 151, ${0.12 + t * 0.55})`;
  }
  return `rgba(255, 77, 94, ${0.12 + -t * 0.55})`;
}

export function HeatmapPanel() {
  const { data, isLoading } = useTopMovers(40);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 320 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rects = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.marketCap - a.marketCap);
    return squarify(sorted, size.w, size.h);
  }, [data, size]);

  return (
    <Panel title="Movers heatmap — top 40 by mcap, colored by 24h" source="market" bodyClassName="relative p-0">
      <div ref={containerRef} className="relative h-full min-h-[300px] w-full overflow-hidden">
        {isLoading || !data ? (
          <Skeleton className="absolute inset-2" />
        ) : (
          rects.map(({ x, y, w, h, token }) => {
            const showText = w > 52 && h > 30;
            return (
              <button
                key={token.id}
                onClick={() => router.push(`/token/${token.id}`)}
                title={`${token.symbol} · $${formatCompact(token.marketCap)} · ${formatPct(token.change24h)} 24h`}
                className="absolute overflow-hidden border border-bg/90 text-left transition-[filter] hover:brightness-150 focus-visible:z-10"
                style={{
                  left: x,
                  top: y,
                  width: Math.max(0, w - 1),
                  height: Math.max(0, h - 1),
                  background: heatColor(token.change24h),
                }}
              >
                {showText && (
                  <span className="flex h-full flex-col justify-center px-1.5">
                    <span className="truncate font-mono text-[11px] font-semibold text-ink">
                      {token.symbol}
                    </span>
                    <span className="truncate font-mono text-[10px] text-ink/75" data-numeric>
                      {formatPct(token.change24h)}
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
