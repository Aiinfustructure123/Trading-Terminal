import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] tabular-nums",
  {
    variants: {
      variant: {
        neutral: "border-edge bg-panel-2 text-muted",
        signal: "border-signal/40 bg-signal/10 text-signal",
        profit: "border-profit/40 bg-profit/10 text-profit",
        danger: "border-danger/40 bg-danger/10 text-danger",
        warn: "border-warn/40 bg-warn/10 text-warn",
        outline: "border-edge bg-transparent text-ink",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
