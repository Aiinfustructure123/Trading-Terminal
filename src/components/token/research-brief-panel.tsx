"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import type { ResearchBrief } from "@/lib/datasources";
import { dataSources } from "@/lib/datasources";
import { useResearchBrief } from "@/lib/queries";
import { Panel, Eyebrow } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/format";

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <Eyebrow>{title}</Eyebrow>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-signal" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResearchBriefPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useResearchBrief(tokenId);
  const queryClient = useQueryClient();

  const regen = useMutation({
    mutationFn: () => dataSources.ai.regenerateBrief(tokenId),
    onSuccess: (brief: ResearchBrief) => {
      queryClient.setQueryData(["brief", tokenId], brief);
    },
  });

  return (
    <Panel
      title="AI Research Brief"
      sourceKey="ai"
      actions={
        <div className="flex items-center gap-2">
          {data && <span className="text-micro text-muted">{formatRelativeTime(data.generatedAt)}</span>}
          <Button size="xs" variant="outline" onClick={() => regen.mutate()} disabled={regen.isPending}>
            <RefreshCw className={regen.isPending ? "h-3 w-3 animate-spin" : "h-3 w-3"} /> Regenerate
          </Button>
        </div>
      }
    >
      {isLoading || !data || regen.isPending ? (
        <div className="flex flex-col gap-4">
          {regen.isPending && (
            <div className="flex items-center gap-2 text-[13px] text-signal">
              <Sparkles className="h-4 w-4 animate-pulse-soft" /> Assembling structured context and regenerating…
            </div>
          )}
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <Eyebrow>Executive Summary</Eyebrow>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{data.sections.executiveSummary}</p>
          </div>
          <Section title="What the Data Shows" items={data.sections.whatTheDataShows} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Section title="Bull Case" items={data.sections.bullCase} />
            <Section title="Bear Case" items={data.sections.bearCase} />
          </div>
          <Section title="Key Risks" items={data.sections.keyRisks} />
          <Section title="What Would Change the Picture" items={data.sections.whatWouldChangeThePicture} />
          <p className="border-t border-edge pt-3 text-[11px] text-muted">
            Generated from provided on-chain & market data only. No price predictions; speculation is labeled.
            Analytical tooling, not financial advice.
          </p>
        </div>
      )}
    </Panel>
  );
}
