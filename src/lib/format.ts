/** Compact USD for caps/volume/liquidity: $1.24B, $530.2M, $48.1K */
export function formatUsdCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/**
 * Token price with subscript-zero notation for micro-caps:
 * $0.0₅4821 means $0.000004821. Keeps 4 significant digits.
 */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0.00";
  if (value >= 1000) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (value >= 1) return `$${value.toFixed(value >= 100 ? 2 : 3)}`;
  if (value >= 0.001) return `$${value.toFixed(5)}`;
  const zeros = Math.floor(-Math.log10(value)) - 1;
  const digits = Math.round(value * Math.pow(10, zeros + 5));
  const sub = "₀₁₂₃₄₅₆₇₈₉";
  const subscript = String(zeros)
    .split("")
    .map((d) => sub[Number(d)])
    .join("");
  return `$0.0${subscript}${digits}`;
}

export function formatPercent(value: number, opts?: { sign?: boolean }): string {
  const sign = opts?.sign === false ? "" : value > 0 ? "+" : "";
  const abs = Math.abs(value);
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function shortAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** Age like "42m", "7h", "3d", "5mo" from an ISO timestamp. */
export function formatAge(iso: string, now: number = Date.now()): string {
  const ms = now - new Date(iso).getTime();
  const m = Math.max(1, Math.floor(ms / 60_000));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 60) return `${d}d`;
  const mo = Math.floor(d / 30);
  if (mo < 24) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

export function timeAgo(iso: string, now: number = Date.now()): string {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatClock(date: Date): string {
  return date.toISOString().slice(11, 19);
}

export function ageInDays(iso: string, now: number = Date.now()): number {
  return (now - new Date(iso).getTime()) / 86_400_000;
}
