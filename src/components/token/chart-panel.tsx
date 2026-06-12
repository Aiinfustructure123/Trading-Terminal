"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Timeframe } from "@/lib/datasources";
import { useCandles } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const CandleChart = dynamic(() => import("@/components/token/candle-chart").then((m) => m.CandleChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[360px] w-full" />,
});

const TIMEFRAMES: Timeframe[] = ["15m", "1h", "4h", "1d"];

export function ChartPanel({ tokenId }: { tokenId: string }) {
  const [tf, setTf] = React.useState<Timeframe>("1h");
  const { data, isLoading } = useCandles(tokenId, tf);

  return (
    <Panel
      title="Price"
      sourceKey="market"
      live
      actions={
        <Tabs value={tf} onValueChange={(v) => setTf(v as Timeframe)}>
          <TabsList className="h-7 p-0.5">
            {TIMEFRAMES.map((t) => (
              <TabsTrigger key={t} value={t} className="px-2 py-0.5 text-[11px]">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      {isLoading || !data ? <Skeleton className="h-[360px] w-full" /> : <CandleChart candles={data} />}
    </Panel>
  );
}
