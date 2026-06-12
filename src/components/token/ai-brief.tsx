"use client";

import { Sparkles, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useBrief } from "@/lib/hooks/use-data";
import { Panel, Skeleton } from "@/components/ui/primitives";
import { fmtTimeAgo } from "@/lib/utils";

export function AIBriefPanel({ address }: { address: string }) {
  const { data, isLoading, isFetching } = useBrief(address);
  const qc = useQueryClient();

  return (
    <Panel
      title="AI Research Brief"
      source="ai"
      className="h-full"
      action={
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["brief", address] })}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-[10px] text-muted transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-50"
        >
          <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} /> Regenerate
        </button>
      }
    >
      {isLoading || !data ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-md border border-signal/20 bg-signal/5 px-3 py-2">
            <Sparkles className="size-3.5 text-signal" />
            <span className="font-mono text-[10px] text-muted">
              {data.model} · generated {fmtTimeAgo(data.generatedAt)} · cites only provided data, no price predictions
            </span>
          </div>
          {data.sections.map((s) => (
            <div key={s.title} className="flex flex-col gap-1">
              <div className="eyebrow text-signal" style={{ color: "var(--color-signal)" }}>{s.title}</div>
              <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink/90">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
