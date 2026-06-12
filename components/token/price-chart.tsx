"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useCandles } from "@/lib/hooks/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CandleInterval } from "@/lib/datasources/types";

const INTERVALS: CandleInterval[] = ["15m", "1h", "4h", "1d"];

export function PriceChart({ tokenId }: { tokenId: string }) {
  const [interval, setInterval] = useState<CandleInterval>("1h");
  const { data: candles, isLoading } = useCandles(tokenId, interval);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !candles || candles.length === 0) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6B7488",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#13171f" },
        horzLines: { color: "#13171f" },
      },
      rightPriceScale: { borderColor: "#1C2230" },
      timeScale: { borderColor: "#1C2230", timeVisible: true, secondsVisible: false },
      crosshair: {
        vertLine: { color: "#5CE1E6", width: 1, style: 3, labelBackgroundColor: "#0E1117" },
        horzLine: { color: "#5CE1E6", width: 1, style: 3, labelBackgroundColor: "#0E1117" },
      },
      autoSize: true,
    });
    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#3DDC97",
      downColor: "#FF4D5E",
      borderUpColor: "#3DDC97",
      borderDownColor: "#FF4D5E",
      wickUpColor: "#3DDC9788",
      wickDownColor: "#FF4D5E88",
      priceFormat: { type: "price", precision: 8, minMove: 0.00000001 },
    });
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? "#3DDC9733" : "#FF4D5E33",
      }))
    );

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [candles]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-panel-border px-3 py-1.5">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className={cn(
              "rounded px-2 py-0.5 font-mono text-[11px] transition-colors",
              interval === iv ? "bg-signal/15 text-signal" : "text-muted hover:text-ink"
            )}
          >
            {iv}
          </button>
        ))}
      </div>
      <div className="relative min-h-0 flex-1">
        {isLoading && <Skeleton className="absolute inset-2 z-10" />}
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
