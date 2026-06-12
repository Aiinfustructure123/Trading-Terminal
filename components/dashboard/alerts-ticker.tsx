"use client";

import Link from "next/link";
import { useNotifications } from "@/lib/hooks/queries";
import { SourceBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-signal",
  warning: "bg-warn",
  critical: "bg-danger",
};

/** Bloomberg-style scrolling alert line, pinned to the bottom of the dashboard. */
export function AlertsTicker() {
  const { data } = useNotifications(12);
  const items = data ?? [];

  return (
    <div className="panel flex h-9 items-center overflow-hidden">
      <div className="flex h-full shrink-0 items-center gap-2 border-r border-panel-border bg-panel px-3">
        <span className="eyebrow">Alerts</span>
        <SourceBadge source="alerts" />
      </div>
      <div className="relative h-full min-w-0 flex-1 overflow-hidden" aria-live="off">
        {items.length > 0 && (
          <div className="absolute inset-y-0 flex w-max animate-ticker items-center gap-10 pl-4 hover:[animation-play-state:paused]">
            {[...items, ...items].map((n, i) => (
              <Link
                key={`${n.id}-${i}`}
                href={`/token/${n.tokenId}`}
                className="flex shrink-0 items-center gap-2 text-xs text-ink/85 hover:text-signal"
              >
                <span className={cn("size-1.5 rounded-full", SEVERITY_DOT[n.severity])} />
                <span className="font-mono font-semibold" data-numeric>
                  {n.tokenSymbol}
                </span>
                <span className="text-muted">{n.message}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
