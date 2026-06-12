const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const fullCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatCompactUsd(value: number): string {
  return compactCurrency.format(value);
}

export function formatPrice(value: number): string {
  if (value >= 1) {
    return fullCurrency.format(value);
  }

  return `$${value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;
}

export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${percent.format(value)}%`;
}

export function formatAgeHours(hours: number): string {
  if (hours >= 24) {
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  }

  return `${hours}h`;
}
