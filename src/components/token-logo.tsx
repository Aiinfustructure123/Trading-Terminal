import { cn } from "@/lib/utils";

export function TokenLogo({
  symbol,
  accent,
  size = 24,
  className,
}: {
  symbol: string;
  accent: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-sm font-mono font-bold text-bg", className)}
      style={{ backgroundColor: accent, width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {symbol.slice(0, 2)}
    </span>
  );
}
