"use client";

import * as React from "react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  createChart,
} from "lightweight-charts";
import { CandleInterval } from "@/lib/datasources/types";
import { useCandles } from "@/lib/hooks/queries";
import { COLORS } from "@/lib/theme";
import { Skeleton } from "@/components/terminal/skeleton";
import { cn } from "@/lib/utils";

const INTERVALS: CandleInterval[] = ["15m", "1h", "4h", "1d"];

export function CandleChart({ tokenId }: { tokenId: string }) {
  const [interval, setInterval] = React.useState<CandleInterval>("1h");
  const { data, isPending } = useCandles(tokenId, interval);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const candleRef = React.useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: COLORS.muted,
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: COLORS.edge },
        horzLines: { color: COLORS.edge },
      },
      rightPriceScale: { borderColor: COLORS.edge },
      timeScale: { borderColor: COLORS.edge, timeVisible: true, secondsVisible: false },
      crosshair: {
        vertLine: { color: COLORS.signal, width: 1, labelBackgroundColor: COLORS.panel2 },
        horzLine: { color: COLORS.signal, width: 1, labelBackgroundColor: COLORS.panel2 },
      },
      autoSize: true,
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.profit,
      downColor: COLORS.danger,
      borderUpColor: COLORS.profit,
      borderDownColor: COLORS.danger,
      wickUpColor: COLORS.profit,
      wickDownColor: COLORS.danger,
      priceFormat: { type: "price", precision: 8, minMove: 0.00000001 },
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: COLORS.edgeBright,
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candles;
    volumeRef.current = volume;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  const lastCountRef = React.useRef(0);
  React.useEffect(() => {
    if (!data || !candleRef.current || !volumeRef.current) return;
    candleRef.current.setData(
      data.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    volumeRef.current.setData(
      data.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? "rgba(61,220,151,0.28)" : "rgba(255,77,94,0.28)",
      })),
    );
    if (lastCountRef.current !== data.length) {
      chartRef.current?.timeScale().fitContent();
      lastCountRef.current = data.length;
    }
  }, [data]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-edge px-2 py-1.5">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            type="button"
            onClick={() => setInterval(iv)}
            className={cn(
              "num cursor-pointer rounded-[3px] px-2 py-1 text-[10px] uppercase tracking-wider transition-colors",
              interval === iv
                ? "bg-signal/10 text-signal"
                : "text-muted hover:bg-edge/60 hover:text-ink",
            )}
          >
            {iv}
          </button>
        ))}
      </div>
      <div className="relative min-h-0 flex-1">
        {isPending && !data ? (
          <Skeleton className="absolute inset-2" />
        ) : null}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
