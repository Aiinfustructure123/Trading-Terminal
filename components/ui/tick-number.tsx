"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Numeric cell that flashes cyan on uptick / red on downtick when its
 * underlying value changes — the terminal's heartbeat.
 */
export function TickNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (v: number) => string;
  className?: string;
}) {
  const prev = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value !== prev.current) {
      setFlash(value > prev.current ? "up" : "down");
      prev.current = value;
      const id = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(id);
    }
  }, [value]);

  return (
    <span
      className={cn(
        "font-mono",
        flash === "up" && "animate-tick-up",
        flash === "down" && "animate-tick-down",
        className
      )}
      data-numeric
    >
      {format(value)}
    </span>
  );
}
