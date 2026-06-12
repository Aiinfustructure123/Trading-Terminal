"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { alertsSource } from "@/lib/datasources";
import { fmtRelTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-danger",
  warn:     "text-warn",
  info:     "text-signal",
};

export function AlertTicker() {
  const { data } = useQuery({
    queryKey: ["alert-events"],
    queryFn:  () => alertsSource.getEvents(),
    refetchInterval: 30_000,
  });

  const events = data ?? [];
  const items = [...events, ...events]; // duplicate for seamless loop

  return (
    <div className="h-8 bg-panel border-t border-border flex items-center overflow-hidden flex-shrink-0">
      <div className="flex-shrink-0 px-3 border-r border-border h-full flex items-center">
        <span className="label-eyebrow text-signal">ALERTS</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex gap-12 animate-ticker-scroll whitespace-nowrap">
          {items.map((evt, i) => (
            <span
              key={`${evt.id}-${i}`}
              className={cn("text-xs font-mono flex items-center gap-2", SEVERITY_COLORS[evt.severity] ?? "text-muted")}
            >
              <span className="text-muted">{fmtRelTime(evt.at)}</span>
              <span className="text-muted">·</span>
              {evt.tokenSymbol && (
                <span className="text-ink font-semibold">[{evt.tokenSymbol}]</span>
              )}
              <span>{evt.message}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
