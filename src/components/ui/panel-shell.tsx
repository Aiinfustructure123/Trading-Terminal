import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelShellProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PanelShell({
  eyebrow,
  title,
  subtitle,
  badge,
  children,
  className,
}: PanelShellProps) {
  return (
    <section className={cn("panel-surface flex h-full flex-col p-4", className)}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-base font-semibold leading-tight text-ink">{title}</h2>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        {badge}
      </header>
      {children}
    </section>
  );
}
