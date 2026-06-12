import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-8 w-full rounded-[4px] border border-edge bg-bg px-2.5 text-xs text-ink placeholder:text-muted/70",
      "focus:border-signal/50 focus:outline-none focus:ring-1 focus:ring-signal/30",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
