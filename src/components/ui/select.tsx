import * as React from "react";
import { cn } from "@/lib/utils";

/** Styled native select — keyboard accessible, terminal-dense. */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-8 rounded-[4px] border border-edge bg-bg px-2 pr-6 text-xs text-ink",
      "appearance-none bg-no-repeat bg-[length:12px] bg-[position:right_6px_center]",
      "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7488%22%20d%3D%22M6%208.5%202%204h8z%22%2F%3E%3C%2Fsvg%3E')]",
      "focus:border-signal/50 focus:outline-none focus:ring-1 focus:ring-signal/30 cursor-pointer",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
