"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useToken } from "@/lib/hooks/use-data";
import { TokenHeader } from "@/components/token/token-header";
import { PriceChart } from "@/components/token/price-chart";
import { ForensicsPanel } from "@/components/token/forensics-panel";
import { HoldersPanel } from "@/components/token/holders-panel";
import { ScenarioPanel } from "@/components/token/scenario-panel";
import { AIBriefPanel } from "@/components/token/ai-brief";
import { ScoreBreakdown } from "@/components/score/score-breakdown";
import { Panel, Skeleton } from "@/components/ui/primitives";

export default function TokenDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { data: token, isLoading, isError } = useToken(address);

  return (
    <div className="flex flex-col gap-3 p-3 md:p-4">
      <Link href="/screener" className="flex w-fit items-center gap-1.5 font-mono text-[11px] text-muted hover:text-signal">
        <ArrowLeft className="size-3.5" /> Back to screener
      </Link>

      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-[10px]" />
      ) : isError || !token ? (
        <Panel className="p-10">
          <div className="text-center">
            <p className="font-display text-lg text-ink">Token not found</p>
            <p className="mt-1 text-sm text-muted">This address isn&apos;t in the sample universe. Try one from the screener.</p>
          </div>
        </Panel>
      ) : (
        <>
          <TokenHeader token={token} />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PriceChart address={address} />
            </div>
            <Panel title="Score Breakdown" source="market" className="lg:col-span-1">
              <ScoreBreakdown score={token.conviction} ringSize={108} />
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ForensicsPanel address={address} />
            <HoldersPanel address={address} />
          </div>

          <ScenarioPanel address={address} />

          <div id="brief">
            <AIBriefPanel address={address} />
          </div>
        </>
      )}
    </div>
  );
}
