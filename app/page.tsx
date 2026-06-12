import { MarketPulseStrip } from "@/components/dashboard/market-pulse";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { AlertsTicker } from "@/components/dashboard/alerts-ticker";

export default function DashboardPage() {
  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col gap-3 p-3 sm:p-4">
      <MarketPulseStrip />
      <div className="flex-1">
        <DashboardGrid />
      </div>
      <AlertsTicker />
    </div>
  );
}
