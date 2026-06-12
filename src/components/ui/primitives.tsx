"use client";

import { cn } from "@/lib/utils";
import type { SourceKey } from "@/lib/datasources/types";
import { SourceBadge } from "@/components/ui/source-badge";

/** 11px uppercase letterspaced label — the terminal's structural eyebrow. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("eyebrow", className)}>{children}</div>;
}

export function Panel({
  children,
  className,
  title,
  source,
  action,
  dense,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  source?: SourceKey;
  action?: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <section className={cn("panel animate-panel-in flex flex-col", className)}>
      {(title || source || action) && (
        <header className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {title && <Eyebrow className="truncate">{title}</Eyebrow>}
            {source && <SourceBadge source={source} />}
          </div>
          {action}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", dense ? "" : "p-3.5")}>{children}</div>
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

export function StatBlock({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Eyebrow>{label}</Eyebrow>
      <div className="font-mono text-lg tabular-nums text-ink">{value}</div>
      {sub && <div className="font-mono text-xs">{sub}</div>}
    </div>
  );
}
