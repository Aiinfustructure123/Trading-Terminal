import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatUsd(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    notation: Math.abs(value) >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value < 1 ? 6 : 2,
    ...options,
  }).format(value);
}

export function formatPercent(value: number, options?: Intl.NumberFormatOptions) {
  return `${value >= 0 ? "+" : ""}${new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    ...options,
  }).format(value)}%`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
