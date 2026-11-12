export const DEFAULT_CAPITAL = 100_000;
export const MIN_CAPITAL = 1_000;
export const MAX_CAPITAL = 10_000_000;
export const FREE_CAPITAL_CAP = 100_000;
export const CAPITAL_PRESETS = [
  10_000, 25_000, 50_000, 100_000, 250_000, 1_000_000,
];

export function clampCapital(value: number): number {
  return Number.isFinite(value)
    ? Math.min(MAX_CAPITAL, Math.max(MIN_CAPITAL, Math.round(value)))
    : DEFAULT_CAPITAL;
}

/** Parse "25k", "1.5m", "$100,000" style input. Returns null if unusable. */
export function parseCapital(input: string): number | null {
  const cleaned = input.trim().replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const lower = cleaned.toLowerCase();
  const value = lower.endsWith("m")
    ? Number(lower.slice(0, -1)) * 1e6
    : lower.endsWith("k")
      ? Number(lower.slice(0, -1)) * 1e3
      : Number(lower);
  return !Number.isFinite(value) || value <= 0 ? null : clampCapital(value);
}

export function formatCapital(value: number): string {
  return value >= 1e6 && value % 1e6 === 0
    ? `$${value / 1e6}M`
    : value >= 1e3 && value % 1e3 === 0
      ? `$${value / 1e3}k`
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value);
}
