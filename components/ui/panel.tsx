import { cn } from "@/lib/utils";
import { SourceBadge } from "@/components/source-badge";
import type { SourceMode } from "@/lib/datasources/types";

type PanelProps = {
  title: string;
  eyebrow?: string;
  mode?: SourceMode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Panel({
  title,
  eyebrow,
  mode = "sample",
  action,
  children,
  className,
  contentClassName
}: PanelProps) {
  return (
    <section
      className={cn(
        "animate-fade-slide rounded-2xl border border-border bg-panel shadow-panel",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          {eyebrow ? (
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SourceBadge mode={mode} />
          {action}
        </div>
      </div>
      <div className={cn("p-4", contentClassName)}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-semibold uppercase tracking-[0.22em] text-muted", className)}>
      {children}
    </div>
  );
}

export function MetricBlock({
  label,
  value,
  delta,
  tone,
  className
}: {
  label: string;
  value: React.ReactNode;
  delta?: React.ReactNode;
  tone?: "profit" | "danger" | "warn" | "signal" | "muted";
  className?: string;
}) {
  const toneClass = {
    profit: "text-profit",
    danger: "text-danger",
    warn: "text-warn",
    signal: "text-signal",
    muted: "text-muted"
  }[tone ?? "muted"];

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</div>
      <div className="data-text truncate text-xl font-semibold text-ink">{value}</div>
      {delta ? <div className={cn("data-text mt-1 text-xs", toneClass)}>{delta}</div> : null}
    </div>
  );
}
