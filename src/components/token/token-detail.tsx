"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToken } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { TokenHeader } from "@/components/token/token-header";
import { ChartPanel } from "@/components/token/chart-panel";
import { ForensicsPanel } from "@/components/token/forensics-panel";
import { HoldersPanel } from "@/components/token/holders-panel";
import { ScenarioPanel } from "@/components/token/scenario-panel";
import { ResearchBriefPanel } from "@/components/token/research-brief-panel";

export function TokenDetail({ id }: { id: string }) {
  const { data: token, isLoading } = useToken(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-[420px] lg:col-span-2" />
          <Skeleton className="h-[420px]" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="font-display text-data-lg text-ink">Token not found</p>
        <p className="text-[13px] text-muted">No token matches this identifier in the sample universe.</p>
        <Link href="/screener" className="text-[13px] text-signal hover:underline">
          ← Back to screener
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 pt-4">
        <Link
          href="/screener"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Screener
        </Link>
      </div>
      <TokenHeader token={token} />

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartPanel tokenId={token.id} />
        </div>
        <HoldersPanel tokenId={token.id} />

        <div className="lg:col-span-2">
          <Panel title="Score Breakdown" sourceKey="ai">
            <ScoreBreakdown score={token.conviction} />
          </Panel>
        </div>
        <ForensicsPanel tokenId={token.id} />

        <div className="lg:col-span-3">
          <ScenarioPanel tokenId={token.id} />
        </div>

        <div id="brief" className="lg:col-span-3">
          <ResearchBriefPanel tokenId={token.id} />
        </div>
      </div>
    </div>
  );
}
