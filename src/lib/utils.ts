import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact USD: $1.2K, $3.4M, $1.1B */
export function fmtUsd(value: number, opts?: { decimals?: number }): string {
  const sign = value < 0 ? "-" : "";
  const v = Math.abs(value);
  if (v >= 1_000_000_000) return `${sign}$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${sign}$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${sign}$${(v / 1_000).toFixed(1)}K`;
  const d = opts?.decimals ?? (v < 1 ? 4 : 2);
  return `${sign}$${v.toFixed(d)}`;
}

/** Price formatting that keeps precision for sub-cent tokens */
export function fmtPrice(value: number): string {
  if (value === 0) return "$0.00";
  if (value >= 1) return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  // very small: show significant digits via subscript-style notation
  const str = value.toFixed(12).replace(/0+$/, "");
  const match = str.match(/^0\.(0+)(\d+)$/);
  if (match) {
    const zeros = match[1].length;
    const digits = match[2].slice(0, 4);
    return `$0.0${subscript(zeros)}${digits}`;
  }
  return `$${value.toPrecision(3)}`;
}

function subscript(n: number): string {
  const map: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  return String(n).split("").map((c) => map[c] ?? c).join("");
}

export function fmtPct(value: number, opts?: { sign?: boolean }): string {
  const sign = opts?.sign === false ? "" : value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function fmtNum(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

export function fmtAge(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}d`;
  return `${Math.round(days / 30)}mo`;
}

export function fmtTimeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function shortAddr(addr: string, lead = 4, tail = 4): string {
  if (addr.length <= lead + tail + 2) return addr;
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`;
}

/** Map a -x..x change to a signal color class */
export function changeColor(change: number): string {
  if (change > 0.01) return "text-profit";
  if (change < -0.01) return "text-danger";
  return "text-muted";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
