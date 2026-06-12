import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "signal" | "profit" | "warn" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-line bg-white/[0.03] text-muted",
  signal: "border-signal/40 bg-signal/10 text-signal",
  profit: "border-profit/35 bg-profit/10 text-profit",
  warn: "border-warn/40 bg-warn/10 text-warn",
  danger: "border-danger/40 bg-danger/10 text-danger",
};

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
