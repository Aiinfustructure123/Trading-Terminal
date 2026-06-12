"use client";

import { modeFor } from "@/lib/datasources";
import type { SourceKey } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

/* The honesty badge. Every panel declares which source backs it; the
   badge reads the central config and renders SAMPLE or LIVE. The user
   always knows which data is real. */
export function SourceBadge({ source, className }: { source: SourceKey; className?: string }) {
  const mode = modeFor(source);
  const live = mode === "live";
  return (
    <span
      title={live ? "Live data from a connected source" : "Generated sample data — not live"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
        live
          ? "border-signal/40 text-signal live-glow"
          : "border-warn/30 bg-warn/5 text-warn",
        className,
      )}
    >
      <span className={cn("inline-block size-1.5 rounded-full", live ? "bg-signal animate-pulse" : "bg-warn/70")} />
      {live ? "LIVE" : "SAMPLE"}
    </span>
  );
}
