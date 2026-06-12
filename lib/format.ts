const compactCurrency = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
  style: "currency",
  currency: "USD",
});

const integerFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatUsd(value: number) {
  return compactCurrency.format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatInteger(value: number) {
  return integerFmt.format(value);
}

export function formatAgeHours(hours: number) {
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}
