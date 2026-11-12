import type { BillingInterval, RiskLevel } from "./types";

export const PRODUCT_IDS = {
  monthly: "pro_monthly",
  lifetime: "pro_lifetime",
} as const;
export const FREE_CYCLES_PER_DAY = 3;

export function productIdFor(interval: BillingInterval): string {
  return interval === "monthly" ? PRODUCT_IDS.monthly : PRODUCT_IDS.lifetime;
}

/** Local calendar-independent day key used for the free-cycle counter (UTC date). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function cyclesLeft(
  plan: "free" | "pro",
  cyclesUsed: number,
  cycleDay: string,
): number {
  if (plan === "pro") return Infinity;
  const used = cycleDay === todayIso() ? cyclesUsed : 0;
  return Math.max(0, FREE_CYCLES_PER_DAY - used);
}

export type UpsellReason = "plans" | "capital" | "ticker" | "cycles";

export const UPSELL_COPY: Record<
  UpsellReason,
  { title: string; blurb: string }
> = {
  plans: {
    title: "The Pro desk",
    blurb:
      "Unlimited Grok, any ticker, and capital to $10M. Auto is on the Run Grok control.",
  },
  capital: {
    title: "Larger paper books are Pro",
    blurb:
      "Free desks cap at $100k. Pro funds up to $10M and flattens into a new session.",
  },
  ticker: {
    title: "Custom names are Pro",
    blurb: "The free tape is the core book. Pro adds any listed ticker or ETF.",
  },
  cycles: {
    title: "Today’s free cycles are used",
    blurb: "Free desks get three Grok runs a day. Pro is unlimited.",
  },
};

export const RISK_PROFILES: Record<
  RiskLevel,
  {
    maxPositionPct: number;
    defaultMaxOrders: number;
    label: string;
    blurb: string;
  }
> = {
  conservative: {
    maxPositionPct: 0.12,
    defaultMaxOrders: 2,
    label: "Conservative",
    blurb: "Fewer tickets, smaller size, mega-caps first.",
  },
  balanced: {
    maxPositionPct: 0.22,
    defaultMaxOrders: 4,
    label: "Balanced",
    blurb: "Core names with room for a satellite.",
  },
  aggressive: {
    maxPositionPct: 0.35,
    defaultMaxOrders: 6,
    label: "Aggressive",
    blurb: "Concentrated book, faster turnover.",
  },
};
