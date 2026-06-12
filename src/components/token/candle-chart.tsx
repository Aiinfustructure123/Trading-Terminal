"use client";

import * as React from "react";
import { createChart, ColorType, type IChartApi, type UTCTimestamp } from "lightweight-charts";
import type { Candle } from "@/lib/datasources";

export function CandleChart({ candles, height = 360 }: { candles: Candle[]; height?: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6B7488",
        fontFamily: "var(--font-mono), monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(28,34,48,0.5)" },
        horzLines: { color: "rgba(28,34,48,0.5)" },
      },
      rightPriceScale: { borderColor: "#1C2230" },
      timeScale: { borderColor: "#1C2230", timeVisible: true, secondsVisible: false },
      crosshair: {
        vertLine: { color: "#5CE1E6", width: 1, style: 2, labelBackgroundColor: "#0E1117" },
        horzLine: { color: "#5CE1E6", width: 1, style: 2, labelBackgroundColor: "#0E1117" },
      },
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#3DDC97",
      downColor: "#FF4D5E",
      borderVisible: false,
      wickUpColor: "#3DDC97",
      wickDownColor: "#FF4D5E",
    });
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? "rgba(61,220,151,0.35)" : "rgba(255,77,94,0.35)",
      })),
    );

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, height]);

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}
