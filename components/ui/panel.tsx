import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { SourceMode } from "@/lib/datasources/types";
import { SourceBadge } from "@/components/ui/source-badge";

type PanelProps = {
  title: string;
  eyebrow?: string;
  mode?: SourceMode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function Panel({ title, eyebrow, mode = "sample", children, className, action }: PanelProps) {
  return (
    <section
      className={cn(
        "animate-fade-slide rounded-2xl border border-line bg-panel/95 shadow-panel",
        "supports-[backdrop-filter]:bg-panel/90",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
        <div>
          {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
          <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <SourceBadge mode={mode} />
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
