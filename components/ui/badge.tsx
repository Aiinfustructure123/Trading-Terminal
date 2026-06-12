import { cn } from "@/lib/utils";

export type BadgeTone = "sample" | "live" | "muted" | "profit" | "warn" | "danger" | "signal";

const toneClasses: Record<BadgeTone, string> = {
  sample: "border-warn/35 bg-warn/10 text-warn",
  live: "border-signal/45 bg-signal/10 text-signal shadow-[0_0_18px_rgba(92,225,230,0.16)]",
  muted: "border-border bg-white/[0.03] text-muted",
  profit: "border-profit/35 bg-profit/10 text-profit",
  warn: "border-warn/35 bg-warn/10 text-warn",
  danger: "border-danger/35 bg-danger/10 text-danger",
  signal: "border-signal/35 bg-signal/10 text-signal"
};

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ children, tone = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.18em]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
