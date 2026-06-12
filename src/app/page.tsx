import { MarketPulseStrip } from "@/components/dashboard/market-pulse";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Master Dashboard"
        title="Signals Overview"
        description="Live-feeling sample feeds across market, on-chain, and AI sources. Every panel is built against the same typed interfaces that will carry live data in Phase 1."
      />
      <div className="flex flex-col gap-4 p-5">
        <MarketPulseStrip />
        <DashboardGrid />
      </div>
    </div>
  );
}
