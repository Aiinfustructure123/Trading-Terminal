"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRegenerateBrief, useResearchBrief } from "@/lib/hooks/queries";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function BriefSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="eyebrow">{title}</h3>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink/90">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-signal/60" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BriefPanel({ tokenId }: { tokenId: string }) {
  const { data, isLoading } = useResearchBrief(tokenId);
  const regenerate = useRegenerateBrief(tokenId);
  const [regenerating, setRegenerating] = useState(false);

  const onRegenerate = async () => {
    setRegenerating(true);
    try {
      await regenerate();
    } finally {
      setRegenerating(false);
    }
  };

  const busy = isLoading || regenerating;

  return (
    <Panel
      title="AI research brief"
      source="ai"
      actions={
        <div className="flex items-center gap-2">
          {data && !busy && (
            <span className="font-mono text-[10px] text-muted" data-numeric>
              generated {timeAgo(data.generatedAt)}
            </span>
          )}
          <button
            onClick={onRegenerate}
            disabled={busy}
            className="flex items-center gap-1.5 rounded border border-panel-border px-2 py-1 text-[11px] text-signal transition-colors hover:bg-signal/10 disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3", regenerating && "animate-spin")} aria-hidden />
            Regenerate
          </button>
        </div>
      }
      bodyClassName="flex flex-col gap-5 p-4"
    >
      {busy || !data ? (
        <>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-5/6" />
          <Skeleton className="h-24 w-full" />
        </>
      ) : (
        <>
          <section className="flex flex-col gap-1.5">
            <h3 className="eyebrow">Executive summary</h3>
            <p className="text-[13px] leading-relaxed text-ink/90">{data.executiveSummary}</p>
          </section>
          <BriefSection title="What the data shows" items={data.whatTheDataShows} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <BriefSection title="Bull case" items={data.bullCase} />
            <BriefSection title="Bear case" items={data.bearCase} />
          </div>
          <BriefSection title="Key risks" items={data.keyRisks} />
          <BriefSection title="What would change the picture" items={data.whatWouldChangeThePicture} />
          <p className="border-t border-panel-border pt-3 text-[11px] text-muted">
            Generated from the structured dataset shown on this page — the model cites only
            provided data, makes no price predictions, and labels speculation. In Phase 0 this is
            a sample brief demonstrating the live format.
          </p>
        </>
      )}
    </Panel>
  );
}
