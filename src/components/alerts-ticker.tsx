"use client";

import Link from "next/link";
import type { AlertSeverity } from "@/lib/datasources";
import { useAlertsTicker } from "@/lib/queries";
import { SourceBadge } from "@/components/source-badge";
import { cn } from "@/lib/utils";

const DOT: Record<AlertSeverity, string> = {
  info: "bg-muted",
  profit: "bg-profit",
  warn: "bg-warn",
  danger: "bg-danger",
};

export function AlertsTicker() {
  const { data, isLoading } = useAlertsTicker();
  const items = data ?? [];

  return (
    <div className="flex h-9 items-center gap-3 border-t border-edge bg-panel/80 px-3 backdrop-blur-terminal">
      <div className="flex shrink-0 items-center gap-2">
        <span className="eyebrow">Alerts</span>
        <SourceBadge sourceKey="market" />
      </div>
      <div className="relative flex-1 overflow-hidden">
        {isLoading || items.length === 0 ? (
          <span className="text-[12px] text-muted">Listening for signals…</span>
        ) : (
          <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap will-change-transform">
            {[...items, ...items].map((item, i) => (
              <Link
                key={`${item.id}-${i}`}
                href={item.tokenId ? `/token/${item.tokenId}` : "/alerts"}
                className="group flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-ink"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", DOT[item.severity])} />
                <span className="tabular">{item.text}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
