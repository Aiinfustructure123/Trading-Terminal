import * as React from "react";
import { SourceKey } from "@/lib/datasources/config";
import { cn } from "@/lib/utils";
import { SourceBadge } from "./badges";

interface PanelProps {
  title: string;
  source?: SourceKey;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Extra node rendered left of the title (e.g. a drag handle). */
  leading?: React.ReactNode;
}

/**
 * Standard terminal panel: dark surface, 1px edge, eyebrow header with an
 * automatic SAMPLE/LIVE badge, 150ms fade-slide on mount.
 */
export function Panel({
  title,
  source,
  actions,
  children,
  className,
  bodyClassName,
  leading,
}: PanelProps) {
  return (
    <section className={cn("panel animate-panel-in flex flex-col overflow-hidden", className)}>
      <header className="flex h-9 shrink-0 items-center gap-2 border-b border-edge px-3">
        {leading}
        <h2 className="eyebrow truncate">{title}</h2>
        {source ? <SourceBadge source={source} /> : null}
        <div className="ml-auto flex items-center gap-1.5">{actions}</div>
      </header>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
