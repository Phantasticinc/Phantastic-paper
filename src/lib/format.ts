const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(
  value: number,
  opts?: { compact?: boolean; whole?: boolean },
): string {
  return opts?.compact
    ? usdCompact.format(value)
    : opts?.whole
      ? usdWhole.format(value)
      : usd.format(value);
}

export function formatPct(value: number, digits = 2): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatShares(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString("en-US")
    : value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

/** Tailwind text colour class for a signed number. */
export function toneClass(value: number): string {
  return value > 1e-4
    ? "text-gain"
    : value < -1e-4
      ? "text-loss"
      : "text-muted";
}

export function timeAgo(ts: number): string {
  const secs = Math.round((Date.now() - ts) / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}
