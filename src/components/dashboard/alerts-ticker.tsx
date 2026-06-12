"use client";

import Link from "next/link";
import { useTickerAlerts } from "@/lib/hooks/queries";
import { TickerAlert } from "@/lib/datasources/types";
import { timeAgo } from "@/lib/format";
import { SourceBadge } from "@/components/terminal/badges";
import { cn } from "@/lib/utils";

const SEVERITY_DOT: Record<TickerAlert["severity"], string> = {
  info: "bg-muted",
  signal: "bg-signal",
  caution: "bg-warn",
  severe: "bg-danger",
};

function TickerRun({ alerts }: { alerts: TickerAlert[] }) {
  return (
    <div className="flex shrink-0 items-center">
      {alerts.map((a) => (
        <Link
          key={a.id}
          href={a.tokenId ? `/token/${a.tokenId}` : "/alerts"}
          className="group flex shrink-0 items-center gap-2 px-5 text-xs text-muted transition-colors hover:text-ink"
        >
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", SEVERITY_DOT[a.severity])} />
          <span className="whitespace-nowrap">{a.text}</span>
          <span className="num whitespace-nowrap text-[10px] text-muted/60">
            {timeAgo(a.at)}
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Bloomberg-style scrolling alert line pinned to the dashboard's bottom edge. */
export function AlertsTicker() {
  const { data } = useTickerAlerts();
  const alerts = data?.slice(0, 16) ?? [];

  return (
    <div className="sticky bottom-16 z-30 flex h-9 items-center border-t border-edge bg-panel/95 backdrop-blur-sm lg:bottom-0">
      <div className="flex h-full shrink-0 items-center gap-2 border-r border-edge bg-panel px-3">
        <span className="eyebrow !text-[9px]">Alerts</span>
        <SourceBadge source="market" />
      </div>
      <div className="group relative flex-1 overflow-hidden" aria-live="off">
        {alerts.length > 0 ? (
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            <TickerRun alerts={alerts} />
            <TickerRun alerts={alerts} />
          </div>
        ) : (
          <span className="px-4 text-2xs text-muted">Listening for signals…</span>
        )}
      </div>
    </div>
  );
}
