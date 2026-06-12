"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full border border-edge-bright transition-colors",
      "data-[state=checked]:border-signal/60 data-[state=checked]:bg-signal/25 data-[state=unchecked]:bg-panel-2",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-3 w-3 rounded-full transition-transform",
        "data-[state=checked]:translate-x-[15px] data-[state=checked]:bg-signal data-[state=unchecked]:translate-x-[2px] data-[state=unchecked]:bg-muted",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
