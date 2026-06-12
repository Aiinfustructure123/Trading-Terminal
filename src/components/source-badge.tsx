"use client";

import { getSourceStatus, SOURCE_META } from "@/lib/datasources";
import type { SourceKey, SourceStatus } from "@/lib/datasources";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<SourceStatus, { label: string; variant: "signal" | "warn" | "neutral"; dot: string }> = {
  live: { label: "LIVE", variant: "signal", dot: "bg-signal animate-pulse-soft" },
  sample: { label: "SAMPLE", variant: "warn", dot: "bg-warn" },
  degraded: { label: "DEGRADED", variant: "neutral", dot: "bg-danger" },
};

/**
 * The honesty contract: every panel declares which source feeds it and renders
 * its live/sample status. There is no way to show data without saying where it
 * came from. Status is read from the single config map, never hard-coded.
 */
export function SourceBadge({ sourceKey, className }: { sourceKey: SourceKey; className?: string }) {
  const status = getSourceStatus(sourceKey);
  const copy = STATUS_COPY[status];
  const meta = SOURCE_META[sourceKey];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex outline-none">
          <Badge variant={copy.variant} className={cn("cursor-help", className)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", copy.dot)} />
            {copy.label}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-display text-[12px] text-ink">
          {meta.label} — {copy.label}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          {status === "sample"
            ? `Generated sample data. Goes live via ${meta.liveProviders.join(", ")}.`
            : status === "degraded"
              ? "Upstream source degraded — showing last good state, never stale-as-fresh."
              : `Live data via ${meta.liveProviders.join(", ")}.`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
