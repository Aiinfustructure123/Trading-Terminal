import type { Metadata } from "next";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { AlertsTicker } from "@/components/dashboard/alerts-ticker";

export const metadata: Metadata = {
  title: "Master Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
      <div className="flex-1 space-y-3 p-3 sm:p-4">
        <MarketPulse />
        <DashboardGrid />
      </div>
      <AlertsTicker />
    </div>
  );
}
