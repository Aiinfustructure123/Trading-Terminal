"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Chain, RiskTier } from "@/lib/datasources/types";
import { cn } from "@/lib/utils";

export function RiskBadge({ tier, className }: { tier: RiskTier; className?: string }) {
  const map: Record<RiskTier, string> = {
    Low: "border-profit/30 bg-profit/10 text-profit",
    Moderate: "border-warn/30 bg-warn/10 text-warn",
    High: "border-danger/30 bg-danger/10 text-danger",
    Avoid: "border-danger/50 bg-danger/20 text-danger",
  };
  return (
    <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide", map[tier], className)}>
      {tier}
    </span>
  );
}

const CHAIN_LABEL: Record<Chain, string> = { solana: "SOL", ethereum: "ETH", base: "BASE" };
const CHAIN_COLOR: Record<Chain, string> = { solana: "#9B8CFF", ethereum: "#62B6FF", base: "#5CE1E6" };

export function ChainTag({ chain }: { chain: Chain }) {
  return (
    <span className="inline-flex items-center rounded px-1 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide" style={{ color: CHAIN_COLOR[chain], background: `${CHAIN_COLOR[chain]}1a` }}>
      {CHAIN_LABEL[chain]}
    </span>
  );
}

export function TokenAvatar({ symbol, accent, size = 24 }: { symbol: string; accent: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-mono font-bold text-bg"
      style={{ width: size, height: size, background: accent, fontSize: size * 0.4 }}
      aria-hidden
    >
      {symbol.slice(0, 2)}
    </span>
  );
}

/** Number that flashes cyan/green/red on change. */
export function TickerNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const prev = useRef(value);
  const [dir, setDir] = useState<"up" | "down" | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (value > prev.current) {
      setDir("up");
      setKey((k) => k + 1);
    } else if (value < prev.current) {
      setDir("down");
      setKey((k) => k + 1);
    }
    prev.current = value;
  }, [value]);

  return (
    <span key={key} className={cn("font-mono tabular-nums", dir === "up" ? "tick-up" : dir === "down" ? "tick-down" : "", className)}>
      {format(value)}
    </span>
  );
}

export function Sparkline({ data, width = 80, height = 24, color }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (!data.length) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((d, i) => `${(i * stepX).toFixed(1)},${(height - ((d - min) / span) * (height - 2) - 1).toFixed(1)}`);
  const up = data[data.length - 1] >= data[0];
  const stroke = color ?? (up ? "var(--color-profit)" : "var(--color-danger)");
  const id = `spk-${Math.round(data[0] * 1e6)}-${data.length}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${pts.join(" ")} ${width},${height}`} fill={`url(#${id})`} stroke="none" />
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-signal/40 hover:text-signal"
      aria-label={`Copy ${label ?? "value"}`}
    >
      {copied ? <Check className="size-3 text-profit" /> : <Copy className="size-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}
