import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelShellProps = {
  eyebrow: string;
  title: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PanelShell({
  eyebrow,
  title,
  rightSlot,
  children,
  className,
}: PanelShellProps) {
  return (
    <section className={cn("panel rounded-xl p-4", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-sm font-semibold tracking-wide text-ink">{title}</h2>
        </div>
        {rightSlot}
      </header>
      {children}
    </section>
  );
}
