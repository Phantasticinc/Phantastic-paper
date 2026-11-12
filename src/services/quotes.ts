import {
  KNOWN_SYMBOLS,
  NAME_BY_SYMBOL,
  UNIVERSE,
  normalizeSymbol,
} from "@/lib/universe";
import type { Quote } from "@/lib/types";

/**
 * Quote service adapter.
 *
 * The original app asked a Grok-hosted server function for last quotes. That backend
 * isn't recoverable, so the default provider here is a clearly labelled SIMULATED tape:
 * deterministic, seeded from fixed reference prices, moving slowly with time.
 *
 * To plug a real feed in later, implement `QuoteProvider` and call `setQuoteProvider()`
 * from main.tsx (keep API keys server-side or behind a proxy — never commit them).
 */
export interface QuoteResult {
  quotes: Quote[];
  /** "live" hides the "Sim tape" badge; anything else shows it. */
  source: "live" | "sim";
}

export interface QuoteProvider {
  getQuotes(symbols: string[]): Promise<QuoteResult>;
  search(query: string): Promise<{ symbol: string; name: string }[]>;
  verify(
    symbol: string,
  ): Promise<
    { ok: true; symbol: string; name: string } | { ok: false; error: string }
  >;
}

/** Fixed reference closes (approximate, for the simulated tape only). */
const REFERENCE_PRICE: Record<string, number> = {
  AAPL: 230,
  MSFT: 450,
  NVDA: 140,
  GOOGL: 185,
  AMZN: 205,
  META: 590,
  TSLA: 330,
  AMD: 150,
  AVGO: 190,
  JPM: 245,
  SPY: 600,
  QQQ: 510,
  NFLX: 880,
  COST: 940,
  UNH: 520,
  CRM: 330,
  PLTR: 75,
  COIN: 280,
  IWM: 225,
  V: 310,
  XOM: 115,
  DIS: 110,
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function referenceFor(symbol: string): number {
  return (
    REFERENCE_PRICE[symbol] ?? 20 + Math.round(hash(`ref:${symbol}`) * 380)
  );
}

/** Price as a smooth deterministic function of (symbol, time): daily drift + two slow waves. */
export function simulatedQuote(symbol: string, now = Date.now()): Quote {
  const ref = referenceFor(symbol);
  const day = Math.floor(now / 86_400_000);
  const phase = hash(`phase:${symbol}`) * Math.PI * 2;
  const vol = 0.006 + hash(`vol:${symbol}`) * 0.012;
  const dayDrift = (hash(`${symbol}:${day}`) - 0.5) * 0.04;
  const wave = (t: number) =>
    Math.sin(t / 5_400_000 + phase) * 0.6 +
    Math.sin(t / 1_700_000 + phase * 2) * 0.4;
  const open = ref * (1 + dayDrift);
  const price = open * (1 + vol * wave(now));
  const dayStart = day * 86_400_000;
  let high = price;
  let low = price;
  for (let t = dayStart; t <= now; t += 1_800_000) {
    const p = open * (1 + vol * wave(t));
    high = Math.max(high, p);
    low = Math.min(low, p);
  }
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    symbol,
    name: NAME_BY_SYMBOL[symbol] ?? symbol,
    price: round(price),
    changePct: ((price - open) / open) * 100,
    high: round(high),
    low: round(low),
  };
}

export const simulatedProvider: QuoteProvider = {
  async getQuotes(symbols) {
    const unique = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];
    return { quotes: unique.map((s) => simulatedQuote(s)), source: "sim" };
  },
  async search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return UNIVERSE.filter(
      (e) =>
        e.symbol.toLowerCase().startsWith(q) ||
        e.name.toLowerCase().includes(q),
    ).slice(0, 8);
  },
  async verify(raw) {
    const symbol = normalizeSymbol(raw);
    if (!symbol) return { ok: false, error: "Enter a ticker." };
    return {
      ok: true,
      symbol,
      name: KNOWN_SYMBOLS.has(symbol)
        ? (NAME_BY_SYMBOL[symbol] ?? symbol)
        : symbol,
    };
  },
};

let provider: QuoteProvider = simulatedProvider;
export const setQuoteProvider = (p: QuoteProvider) => {
  provider = p;
};

export const fetchQuotes = ({ data }: { data: { symbols: string[] } }) =>
  provider.getQuotes(data.symbols);
export const searchSymbols = async ({ data }: { data: { q: string } }) => ({
  hits: await provider.search(data.q),
});
export const verifySymbol = ({ data }: { data: { symbol: string } }) =>
  provider.verify(data.symbol);
