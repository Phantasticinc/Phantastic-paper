import { computeNav } from "@/lib/book";
import { RISK_PROFILES } from "@/lib/plans";
import type {
  Order,
  Position,
  Quote,
  RiskLevel,
  StanceName,
} from "@/lib/types";

/**
 * "Run Grok" cycle adapter.
 *
 * The original called a Grok-backed server function that returned an outlook, a stance and
 * proposed tickets. That model call isn't available in this static build, so the default
 * provider is a transparent RULES AUTOPILOT: momentum on the tape, sized by the risk profile.
 * It is labelled as such in every outlook string. Swap `setCycleProvider()` to call a real model.
 */
export interface CycleRequest {
  risk: RiskLevel;
  maxOrders: number;
  autonomy: boolean;
  book: { cash: number; nav: number; positions: Position[] };
  quotes: Quote[];
}

export type CycleResponse =
  | { ok: true; outlook: string; stance: StanceName; orders: Order[] }
  | { ok: false; error: string };

export interface CycleProvider {
  status(): Promise<{ available: boolean; label: string }>;
  run(req: CycleRequest): Promise<CycleResponse>;
}

const fmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export const rulesAutopilot: CycleProvider = {
  async status() {
    return {
      available: true,
      label: "Local rules autopilot (Grok not connected)",
    };
  },
  async run({ risk, maxOrders, book, quotes }) {
    if (!quotes.length) return { ok: false, error: "No quotes on the tape." };
    const profile = RISK_PROFILES[risk];
    const index = quotes.filter(
      (q) => q.symbol === "SPY" || q.symbol === "QQQ",
    );
    const tone =
      (index.length ? index : quotes).reduce((s, q) => s + q.changePct, 0) /
      (index.length ? index.length : quotes.length);
    const stance: StanceName =
      tone > 0.3 ? "risk-on" : tone < -0.3 ? "risk-off" : "neutral";
    const held = new Map(book.positions.map((p) => [p.symbol, p]));
    const orders: Order[] = [];

    // 1) trim losers when the tape is weak
    for (const p of book.positions) {
      const q = quotes.find((x) => x.symbol === p.symbol);
      if (!q || orders.length >= maxOrders) continue;
      if (stance === "risk-off" && q.changePct < -1) {
        orders.push({
          symbol: p.symbol,
          side: "sell",
          shares: p.shares,
          thesis: `Rules autopilot: ${p.symbol} ${fmt(q.changePct)} on a risk-off tape — step aside.`,
          confidence: 0.6,
        });
      }
    }

    // 2) add the strongest names we don't hold (none in risk-off)
    if (stance !== "risk-off") {
      const budget = Math.min(
        book.cash,
        book.nav * profile.maxPositionPct * 0.8,
      );
      const ranked = quotes
        .filter(
          (q) =>
            !held.has(q.symbol) &&
            q.symbol !== "SPY" &&
            q.symbol !== "QQQ" &&
            q.symbol !== "IWM" &&
            q.changePct > 0,
        )
        .sort((a, b) => b.changePct - a.changePct);
      for (const q of ranked) {
        if (orders.length >= maxOrders) break;
        const shares = Math.floor(budget / q.price);
        if (shares < 1) continue;
        orders.push({
          symbol: q.symbol,
          side: "buy",
          shares,
          thesis: `Rules autopilot: ${q.symbol} leads the tape at ${fmt(q.changePct)}.`,
          confidence: Math.min(0.9, 0.5 + q.changePct / 10),
          stopPct: risk === "aggressive" ? 6 : 4,
          targetPct: risk === "conservative" ? 5 : 9,
        });
      }
    }

    const nav = computeNav(
      { cash: book.cash, initialCash: book.nav, positions: book.positions },
      quotes,
    );
    const outlook =
      `Local rules autopilot (Grok not connected). Tape reads ${stance.replace("-", " ")} (${fmt(tone)} index drift). ` +
      (orders.length
        ? `${orders.length} ticket${orders.length === 1 ? "" : "s"} within the ${profile.label.toLowerCase()} profile.`
        : `Nothing clears the bar at NAV ${nav.toFixed(0)}.`);
    return { ok: true, outlook, stance, orders };
  },
};

let provider: CycleProvider = rulesAutopilot;
export const setCycleProvider = (p: CycleProvider) => {
  provider = p;
};

export const fetchGrokStatus = async () => {
  const s = await provider.status();
  return { available: s.available, label: s.label };
};
export const runCycle = ({ data }: { data: CycleRequest }) =>
  provider.run(data);
