import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(value: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", opts).format(value);
}

export function fmtUsd(value: number, compact = true): string {
  if (compact) {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function fmtPct(value: number, plus = true): string {
  const s = value.toFixed(2) + "%";
  return plus && value > 0 ? `+${s}` : s;
}

export function fmtPrice(value: number): string {
  if (value < 0.00001)  return `$${value.toExponential(3)}`;
  if (value < 0.001)    return `$${value.toFixed(6)}`;
  if (value < 1)        return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}

export function fmtAge(days: number): string {
  if (days < 1/24)  return `${Math.floor(days * 24 * 60)}m`;
  if (days < 1)     return `${Math.floor(days * 24)}h`;
  if (days < 30)    return `${Math.floor(days)}d`;
  if (days < 365)   return `${Math.floor(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function fmtRelTime(isoDate: string): string {
  const delta = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (delta < 60)   return `${Math.floor(delta)}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400)return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

export function pctColor(value: number): string {
  if (value > 0) return "text-profit";
  if (value < 0) return "text-danger";
  return "text-muted";
}

export function scoreColor(score: number): string {
  if (score >= 70) return "#3DDC97";
  if (score >= 45) return "#FFB020";
  if (score >= 20) return "#FF4D5E";
  return "#6B7488";
}

export function riskColor(tier: string): string {
  switch (tier) {
    case "Low":      return "#3DDC97";
    case "Moderate": return "#FFB020";
    case "High":     return "#FF4D5E";
    case "Avoid":    return "#FF4D5E";
    default:         return "#6B7488";
  }
}

export function truncateAddress(addr: string, chars = 6): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}
