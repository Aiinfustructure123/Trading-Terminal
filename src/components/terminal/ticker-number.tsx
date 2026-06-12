"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TickerNumberProps {
  value: number;
  format: (value: number) => string;
  className?: string;
  /** "direction": green/red flash by delta. "signal": cyan flash on any change. */
  flash?: "direction" | "signal" | "none";
}

/** Number that flashes briefly when its value ticks — restrained, purposeful. */
export function TickerNumber({
  value,
  format,
  className,
  flash = "direction",
}: TickerNumberProps) {
  const prevRef = React.useRef(value);
  const [anim, setAnim] = React.useState<{ cls: string; nonce: number } | null>(null);

  React.useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;
    prevRef.current = value;
    if (flash === "none") return;
    const cls =
      flash === "signal" ? "tick-flash" : value > prev ? "tick-up" : "tick-down";
    setAnim((a) => ({ cls, nonce: (a?.nonce ?? 0) + 1 }));
  }, [value, flash]);

  return (
    <span key={anim?.nonce ?? 0} className={cn("num", anim?.cls, className)}>
      {format(value)}
    </span>
  );
}
