"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tokenSource } from "@/lib/datasources";
import type { Chain, CandleInterval } from "@/lib/datasources/types";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const INTERVALS: CandleInterval[] = ["15m", "1h", "4h", "1d"];

interface Props {
  address: string;
  chain: Chain;
}

function useDimensions(ref: React.RefObject<HTMLDivElement>) {
  const [dims, setDims] = useState({ width: 600, height: 260 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return dims;
}

export function CandlestickChart({ address, chain }: Props) {
  const [interval, setInterval] = useState<CandleInterval>("1h");
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimensions(containerRef);

  const { data, isLoading } = useQuery({
    queryKey: ["ohlcv", address, chain, interval],
    queryFn:  () => tokenSource.getOHLCV(address, chain, interval),
  });

  const candles = data?.candles ?? [];

  // Chart geometry
  const CHART_H = height - 60;
  const VOL_H   = 40;
  const MAIN_H  = CHART_H - VOL_H - 8;
  const PAD_L   = 0;
  const PAD_R   = 52;
  const chartW  = width - PAD_L - PAD_R;

  const prices  = candles.flatMap(c => [c.high, c.low]);
  const priceMin = prices.length ? Math.min(...prices) : 0;
  const priceMax = prices.length ? Math.max(...prices) : 1;
  const priceRange = priceMax - priceMin || 1;

  const volumes = candles.map(c => c.volume);
  const volMax  = volumes.length ? Math.max(...volumes) : 1;

  const candleW = Math.max(1, Math.floor((chartW / (candles.length || 1)) * 0.6));

  const py = (p: number) => MAIN_H - ((p - priceMin) / priceRange) * MAIN_H;
  const px = (i: number) => PAD_L + (i / (candles.length - 1 || 1)) * chartW;

  // Y-axis labels
  const yTicks = 5;
  const tickStep = priceRange / yTicks;

  // Format price for axis
  const fmtAxis = (p: number) => {
    if (p < 0.0001) return p.toExponential(2);
    if (p < 0.001)  return p.toFixed(5);
    if (p < 1)      return p.toFixed(4);
    return p.toFixed(2);
  };

  return (
    <div className="panel-surface overflow-hidden flex flex-col">
      <PanelHeader
        label="Price Chart"
        mode={data?.source.mode ?? "sample"}
        actions={
          <div className="flex gap-1">
            {INTERVALS.map(iv => (
              <button
                key={iv}
                onClick={() => setInterval(iv)}
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-mono border transition-colors",
                  iv === interval
                    ? "bg-signal/15 text-signal border-signal/40"
                    : "text-muted border-border hover:text-ink"
                )}
              >
                {iv}
              </button>
            ))}
          </div>
        }
      />
      <div ref={containerRef} className="flex-1 p-3 min-h-[300px]">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <svg width={width} height={CHART_H} className="overflow-visible">
            {/* Grid lines */}
            {Array.from({ length: yTicks + 1 }, (_, i) => {
              const price = priceMin + tickStep * i;
              const y     = py(price);
              return (
                <g key={i}>
                  <line x1={PAD_L} y1={y} x2={PAD_L + chartW} y2={y}
                        stroke="#1C2230" strokeWidth={1} strokeDasharray="4 4" />
                  <text
                    x={PAD_L + chartW + 4} y={y + 4}
                    fill="#6B7488" fontSize={9}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {fmtAxis(price)}
                  </text>
                </g>
              );
            })}

            {/* Candles */}
            {candles.map((c, i) => {
              const x     = px(i);
              const isUp  = c.close >= c.open;
              const color = isUp ? "#3DDC97" : "#FF4D5E";
              const bodyH = Math.max(1, Math.abs(py(c.close) - py(c.open)));
              const bodyY = Math.min(py(c.open), py(c.close));
              const half  = candleW / 2;

              return (
                <g key={c.time}>
                  {/* Wick */}
                  <line
                    x1={x} y1={py(c.high)} x2={x} y2={py(c.low)}
                    stroke={color} strokeWidth={1}
                  />
                  {/* Body */}
                  <rect
                    x={x - half} y={bodyY}
                    width={candleW} height={bodyH}
                    fill={isUp ? color : color}
                    opacity={isUp ? 0.9 : 0.85}
                    rx={0.5}
                  />
                </g>
              );
            })}

            {/* Volume bars */}
            {candles.map((c, i) => {
              const x    = px(i);
              const isUp = c.close >= c.open;
              const barH = (c.volume / volMax) * VOL_H;
              const barY = MAIN_H + 8 + (VOL_H - barH);
              return (
                <rect
                  key={`vol-${c.time}`}
                  x={x - candleW / 2} y={barY}
                  width={candleW} height={barH}
                  fill={isUp ? "#3DDC97" : "#FF4D5E"}
                  opacity={0.4}
                  rx={0.5}
                />
              );
            })}

            {/* Crosshair placeholder label */}
            <text
              x={PAD_L} y={CHART_H - 4}
              fill="#6B7488" fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              {candles.length} candles · {interval}
            </text>
          </svg>
        )}
      </div>
    </div>
  );
}
