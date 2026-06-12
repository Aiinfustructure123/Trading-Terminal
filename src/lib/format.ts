/** Number / address / time formatters. All numeric output is tabular-friendly. */

export function formatUsd(value: number, opts?: { compact?: boolean; maxFrac?: number }): string {
  const { compact = false, maxFrac } = opts ?? {};
  if (!Number.isFinite(value)) return "—";
  if (compact) {
    return "$" + formatCompact(value);
  }
  const fractionDigits = maxFrac ?? (value < 1 ? 6 : 2);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 2 : 2,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "$0";
  if (value >= 1) {
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  // Sub-dollar tokens: show significant digits
  const decimals = Math.min(12, Math.max(4, Math.ceil(-Math.log10(value)) + 3));
  return "$" + value.toFixed(decimals);
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(2) + "T";
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + "K";
  return sign + abs.toFixed(0);
}

export function formatPct(value: number, opts?: { sign?: boolean; digits?: number }): string {
  const { sign = true, digits = 2 } = opts ?? {};
  if (!Number.isFinite(value)) return "—";
  const s = sign && value > 0 ? "+" : "";
  return `${s}${value.toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatAge(createdAtMs: number, now = Date.now()): string {
  const diff = Math.max(0, now - createdAtMs);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

export function formatRelativeTime(timestampMs: number, now = Date.now()): string {
  const diff = now - timestampMs;
  const seconds = Math.floor(Math.abs(diff) / 1000);
  const future = diff < 0;
  const fmt = (n: number, unit: string) => (future ? `in ${n}${unit}` : `${n}${unit} ago`);
  if (seconds < 60) return future ? "soon" : "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return fmt(mins, "m");
  const hours = Math.floor(mins / 60);
  if (hours < 24) return fmt(hours, "h");
  const days = Math.floor(hours / 24);
  return fmt(days, "d");
}

export function formatTime(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
