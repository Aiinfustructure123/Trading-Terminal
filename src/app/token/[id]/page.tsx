"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToken } from "@/lib/hooks/queries";
import { Panel } from "@/components/terminal/panel";
import { Skeleton } from "@/components/terminal/skeleton";
import { ScoreBreakdownTable } from "@/components/terminal/score-breakdown";
import { TokenHeader } from "@/components/token/token-header";
import { CandleChart } from "@/components/token/candle-chart";
import { ForensicsPanel } from "@/components/token/forensics-panel";
import { HoldersPanel } from "@/components/token/holders-panel";
import { ScenarioPanel } from "@/components/token/scenario-panel";
import { ResearchBrief } from "@/components/token/research-brief";

export default function TokenPage() {
  const params = useParams<{ id: string }>();
  const tokenId = params.id;
  const { data: token, isPending } = useToken(tokenId);

  if (isPending) {
    return (
      <div className="space-y-3 p-3 sm:p-4">
        <Skeleton className="h-48" />
        <div className="grid gap-3 lg:grid-cols-12">
          <Skeleton className="h-[380px] lg:col-span-8" />
          <Skeleton className="h-[380px] lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="eyebrow">Unknown token</p>
        <p className="max-w-sm text-sm text-muted">
          No case file exists for <span className="num text-ink">{tokenId}</span>.
          It may have been removed from the sample universe.
        </p>
        <Link href="/screener" className="text-xs text-signal hover:underline">
          Back to the screener →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 sm:p-4">
      <TokenHeader token={token} />

      <div className="grid gap-3 lg:grid-cols-12">
        <Panel
          title={`$${token.symbol} / USD`}
          source="market"
          className="h-[420px] lg:col-span-8"
          bodyClassName="min-h-0"
        >
          <CandleChart tokenId={token.id} />
        </Panel>

        <Panel
          title="Score Breakdown"
          source="market"
          className="lg:col-span-4"
          bodyClassName="max-h-[383px] overflow-y-auto"
        >
          <ScoreBreakdownTable score={token.score} />
        </Panel>

        <Panel
          title="Forensics"
          source="security"
          className="h-[360px] lg:col-span-4"
          bodyClassName="min-h-0"
        >
          <ForensicsPanel tokenId={token.id} />
        </Panel>

        <Panel
          title="Holders"
          source="onchain"
          className="h-[360px] lg:col-span-4"
          bodyClassName="overflow-y-auto"
        >
          <HoldersPanel tokenId={token.id} />
        </Panel>

        <Panel
          title="Scenario Analysis"
          source="ai"
          className="h-[360px] lg:col-span-4"
          bodyClassName="min-h-0"
        >
          <ScenarioPanel tokenId={token.id} />
        </Panel>
      </div>

      <div id="brief" className="scroll-mt-16">
        <Panel title="AI Research Brief" source="ai" bodyClassName="min-h-0">
          <ResearchBrief tokenId={token.id} />
        </Panel>
      </div>
    </div>
  );
}
