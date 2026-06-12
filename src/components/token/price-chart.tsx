"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  type IChartApi,
  type CandlestickData,
  type HistogramData,
  type UTCTimestamp,
} from "lightweight-charts";
import { useCandles } from "@/lib/hooks/use-data";
import type { CandleInterval } from "@/lib/datasources/types";
import { SourceBadge } from "@/components/ui/source-badge";
import { Eyebrow, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const INTERVALS: CandleInterval[] = ["15m", "1h", "4h", "1d"];

export function PriceChart({ address }: { address: string }) {
  const [interval, setInterval] = useState<CandleInterval>("1h");
  const { data, isLoading } = useCandles(address, interval);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6B7488",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(28,34,48,0.5)" },
        horzLines: { color: "rgba(28,34,48,0.5)" },
      },
      rightPriceScale: { borderColor: "#1C2230" },
      timeScale: { borderColor: "#1C2230", timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
      autoSize: true,
    });
    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#3DDC97",
      downColor: "#FF4D5E",
      borderUpColor: "#3DDC97",
      borderDownColor: "#FF4D5E",
      wickUpColor: "#3DDC97",
      wickDownColor: "#FF4D5E",
    });
    candleSeries.setData(
      data.map((c): CandlestickData => ({ time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close })),
    );

    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volSeries.setData(
      data.map((c): HistogramData => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? "rgba(61,220,151,0.3)" : "rgba(255,77,94,0.3)",
      })),
    );

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <section className="panel animate-panel-in flex flex-col">
      <header className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Eyebrow>Price</Eyebrow>
          <SourceBadge source="market" />
        </div>
        <div className="flex gap-0.5 rounded-md border border-border bg-bg p-0.5">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={cn("rounded px-2 py-0.5 font-mono text-[11px] transition-colors", iv === interval ? "bg-signal/15 text-signal" : "text-muted hover:text-ink")}
            >
              {iv}
            </button>
          ))}
        </div>
      </header>
      <div className="relative p-2">
        {isLoading && <Skeleton className="absolute inset-2 z-10" />}
        <div ref={containerRef} className="h-[340px] w-full" />
      </div>
    </section>
  );
}
