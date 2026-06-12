import * as React from "react";
import type { SourceKey } from "@/lib/datasources";
import { SourceBadge } from "@/components/source-badge";
import { cn } from "@/lib/utils";

/** The 11px uppercase eyebrow — the structural labeling unit of the terminal. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  sourceKey?: SourceKey;
  actions?: React.ReactNode;
  headerSlot?: React.ReactNode;
  bodyClassName?: string;
  live?: boolean;
}

export function Panel({
  title,
  sourceKey,
  actions,
  headerSlot,
  children,
  className,
  bodyClassName,
  live,
  ...props
}: PanelProps) {
  return (
    <section className={cn("panel flex min-h-0 flex-col animate-fade-slide-in", live && "live-edge", className)} {...props}>
      {(title || sourceKey || actions) && (
        <header className="flex items-center justify-between gap-2 border-b border-edge px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            {title && <Eyebrow>{title}</Eyebrow>}
            {sourceKey && <SourceBadge sourceKey={sourceKey} />}
          </div>
          <div className="flex items-center gap-1.5">{actions}</div>
        </header>
      )}
      {headerSlot}
      <div className={cn("min-h-0 flex-1", bodyClassName ?? "p-3.5")}>{children}</div>
    </section>
  );
}
