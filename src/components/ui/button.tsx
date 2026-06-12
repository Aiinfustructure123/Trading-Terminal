import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-display text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default: "bg-signal text-bg hover:bg-signal/85 font-semibold",
        outline: "border border-edge bg-transparent text-ink hover:bg-panel-2 hover:border-muted/40",
        ghost: "bg-transparent text-muted hover:text-ink hover:bg-panel-2",
        subtle: "bg-panel-2 text-ink hover:bg-edge",
        danger: "bg-danger/90 text-bg hover:bg-danger font-semibold",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-[12px]",
        xs: "h-6 px-2 text-[11px] rounded-sm",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
