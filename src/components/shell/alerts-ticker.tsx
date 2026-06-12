"use client";

import { useAlerts } from "@/lib/hooks/use-data";
import { cn } from "@/lib/utils";

const dot: Record<string, string> = {
  info: "bg-muted",
  caution: "bg-warn",
  danger: "bg-danger",
  profit: "bg-profit",
};

export function AlertsTicker() {
  const { data } = useAlerts();
  const items = data ?? [];
  const doubled = [...items, ...items];

  return (
    <div className="relative flex h-8 shrink-0 items-center overflow-hidden border-t border-border bg-panel">
      <div className="z-10 flex h-full shrink-0 items-center gap-1.5 border-r border-border bg-panel px-3">
        <span className="size-1.5 animate-pulse rounded-full bg-signal" />
        <span className="eyebrow text-signal" style={{ color: "var(--color-signal)" }}>Live Alerts</span>
      </div>
      <div className="relative flex-1 overflow-hidden no-scrollbar">
        {items.length === 0 ? (
          <div className="px-3 font-mono text-[11px] text-muted">Awaiting alert stream…</div>
        ) : (
          <div className="animate-marquee flex w-max items-center whitespace-nowrap">
            {doubled.map((a, i) => (
              <span key={`${a.id}-${i}`} className="flex items-center gap-2 px-5 font-mono text-[11px] text-ink/90">
                <span className={cn("size-1.5 rounded-full", dot[a.severity])} />
                {a.message}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
