"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { aiSource } from "@/lib/datasources";
import { timeAgo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/terminal/skeleton";

function BriefSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="eyebrow mb-1.5">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs leading-5 text-ink/90">
            <span className="num shrink-0 text-signal/70">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResearchBrief({ tokenId }: { tokenId: string }) {
  const [nonce, setNonce] = React.useState(0);

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["brief", tokenId, nonce],
    queryFn: () => aiSource.getResearchBrief(tokenId, { regenerate: nonce > 0 }),
    staleTime: 60 * 60_000,
    placeholderData: (prev) => prev,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-edge px-3 py-2">
        {data ? (
          <span className="num text-[10px] text-muted">
            {data.model} · generated {timeAgo(data.generatedAt)}
          </span>
        ) : (
          <span className="num text-[10px] text-muted">assembling context…</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          disabled={isFetching}
          onClick={() => setNonce((n) => n + 1)}
          title="Stub — Phase 2 routes this through the Anthropic API with structured token context."
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : undefined} />
          {isFetching ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>

      {isPending || !data ? (
        <PanelSkeleton rows={6} />
      ) : (
        <div className="grid gap-x-8 gap-y-5 p-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <h3 className="eyebrow mb-1.5">Executive Summary</h3>
            <p className="max-w-3xl text-xs leading-5 text-ink/90">{data.executiveSummary}</p>
          </div>
          <BriefSection title="What the Data Shows" items={data.whatTheDataShows} />
          <BriefSection title="Key Risks" items={data.keyRisks} />
          <BriefSection title="Bull Case" items={data.bullCase} />
          <BriefSection title="Bear Case" items={data.bearCase} />
          <div className="lg:col-span-2">
            <BriefSection
              title="What Would Change the Picture"
              items={data.whatWouldChangeThePicture}
            />
          </div>
        </div>
      )}
    </div>
  );
}
