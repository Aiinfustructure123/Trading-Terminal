import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Screener } from "@/components/screener/screener";

export default function ScreenerPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        eyebrow="The Workhorse"
        title="Token Screener"
        description="Filter 1,000+ tokens across chains by market cap, liquidity, age, volume, and risk. Sort any column. Save presets. Click the ring for the score breakdown."
      />
      <div className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-5 text-[13px] text-muted">Loading screener…</div>}>
          <Screener />
        </Suspense>
      </div>
    </div>
  );
}
