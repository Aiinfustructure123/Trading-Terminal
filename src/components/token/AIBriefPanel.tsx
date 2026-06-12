"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { aiSource } from "@/lib/datasources";
import type { Chain } from "@/lib/datasources/types";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { fmtRelTime } from "@/lib/utils";

interface Section {
  label: string;
  content: string | string[];
}

function BriefSection({ label, content }: Section) {
  const [open, setOpen] = useState(true);
  const isArray = Array.isArray(content);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-bg/40 hover:bg-border/30 transition-colors"
      >
        <span className="label-eyebrow">{label}</span>
        {open ? <ChevronUp size={12} className="text-muted" /> : <ChevronDown size={12} className="text-muted" />}
      </button>
      {open && (
        <div className="px-3 py-3">
          {isArray ? (
            <ul className="space-y-1.5">
              {(content as string[]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted">
                  <span className="text-danger mt-0.5 flex-shrink-0">·</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted leading-relaxed">{content as string}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  address: string;
  chain: Chain;
}

export function AIBriefPanel({ address, chain }: Props) {
  const qc = useQueryClient();
  const [regenerating, setRegenerating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-brief", address, chain],
    queryFn:  () => aiSource.getBrief(address, chain),
    staleTime: 3600_000,
  });

  const handleRegenerate = async () => {
    setRegenerating(true);
    await qc.invalidateQueries({ queryKey: ["ai-brief", address, chain] });
    setTimeout(() => setRegenerating(false), 800);
  };

  return (
    <div className="panel-surface overflow-hidden flex flex-col">
      <PanelHeader
        label="AI Research Brief"
        mode={data?.source.mode ?? "sample"}
        actions={
          <div className="flex items-center gap-2">
            {data?.generatedAt && (
              <span className="text-2xs text-muted">Generated {fmtRelTime(data.generatedAt)}</span>
            )}
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="btn-terminal text-xs py-1"
            >
              <RefreshCw size={11} className={regenerating ? "animate-spin" : ""} />
              Regenerate
            </button>
          </div>
        }
      />
      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : data ? (
          <>
            <BriefSection label="Executive Summary" content={data.executiveSummary} />
            <BriefSection label="What the Data Shows" content={data.whatDataShows} />
            <BriefSection label="Bull Case" content={data.bullCase} />
            <BriefSection label="Bear Case" content={data.bearCase} />
            <BriefSection label="Key Risks" content={data.keyRisks} />
            <BriefSection label="What Would Change the Picture" content={data.whatWouldChange} />

            <div className="text-2xs text-muted border-t border-border pt-2">
              Model: {data.model} · Data-grounded analysis only · No price predictions · Not financial advice
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
