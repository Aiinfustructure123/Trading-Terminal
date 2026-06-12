"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Numbers tick with a brief cyan/profit/danger flash on update. */
export function TickNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (v: number) => string;
  className?: string;
}) {
  const prev = React.useRef(value);
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);

  React.useEffect(() => {
    if (prev.current !== value) {
      setFlash(value > prev.current ? "up" : "down");
      prev.current = value;
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className={cn(
        "tabular rounded-sm px-0.5 transition-colors",
        flash === "up" && "animate-tick-flash-up",
        flash === "down" && "animate-tick-flash-down",
        className,
      )}
    >
      {format(value)}
    </span>
  );
}
