import { cn } from "@/lib/utils";
import type { SourceKey } from "@/lib/datasources/config";
import { SourceBadge } from "./badge";

interface PanelProps {
  title?: string;
  source?: SourceKey;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/**
 * Standard terminal panel: dark surface, 1px border, 11px uppercase eyebrow
 * title, and the SAMPLE/LIVE source badge in the header.
 */
export function Panel({ title, source, actions, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={cn("panel animate-panel-in flex flex-col overflow-hidden", className)}>
      {(title || source || actions) && (
        <header className="flex min-h-9 items-center justify-between gap-2 border-b border-panel-border px-3 py-1.5">
          <div className="flex items-center gap-2 overflow-hidden">
            {title && <h2 className="eyebrow truncate">{title}</h2>}
            {source && <SourceBadge source={source} />}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
