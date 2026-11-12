export interface UniverseEntry {
  symbol: string;
  name: string;
}

/** Names offered on the free desk's tape picker (first 12 are the "core" set). */
export const UNIVERSE: UniverseEntry[] = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "META", name: "Meta" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMD", name: "AMD" },
  { symbol: "AVGO", name: "Broadcom" },
  { symbol: "JPM", name: "JPMorgan" },
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "Nasdaq 100" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "COST", name: "Costco" },
  { symbol: "UNH", name: "UnitedHealth" },
  { symbol: "CRM", name: "Salesforce" },
  { symbol: "PLTR", name: "Palantir" },
  { symbol: "COIN", name: "Coinbase" },
  { symbol: "IWM", name: "Russell 2000" },
  { symbol: "V", name: "Visa" },
  { symbol: "XOM", name: "Exxon" },
  { symbol: "DIS", name: "Disney" },
];

export const CORE_SYMBOLS = UNIVERSE.slice(0, 12).map((e) => e.symbol);
export const KNOWN_SYMBOLS = new Set(UNIVERSE.map((e) => e.symbol));
export const NAME_BY_SYMBOL: Record<string, string> = Object.fromEntries(
  UNIVERSE.map((e) => [e.symbol, e.name]),
);

/** Upper-case, strip anything that isn't a ticker character, max 10 chars. */
export function normalizeSymbol(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9.\-]/g, "")
    .slice(0, 10);
}
