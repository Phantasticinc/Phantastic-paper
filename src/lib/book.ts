import { RISK_PROFILES } from "./plans";
import type {
  Book,
  CycleRecord,
  Order,
  Position,
  Quote,
  RiskLevel,
  StanceName,
  Trade,
  TradeInput,
  TradeResult,
} from "./types";

/** Paper-book maths: fills, position sizing, stops/targets, NAV. Pure functions only. */

export const indexQuotes = (quotes: Quote[]) =>
  new Map(quotes.map((q) => [q.symbol, q]));

/** Cash plus positions marked at last quote (falling back to cost basis). */
export function computeNav(book: Book, quotes: Quote[]): number {
  const bySymbol = indexQuotes(quotes);
  let marked = 0;
  for (const p of book.positions) {
    marked += p.shares * (bySymbol.get(p.symbol)?.price ?? p.avgCost);
  }
  return book.cash + marked;
}

export const positionPnl = (p: Position, price: number) =>
  (price - p.avgCost) * p.shares;

/** Share of NAV this position represents, in percent. */
export const positionWeightPct = (p: Position, price: number, nav: number) =>
  nav <= 0 ? 0 : ((p.shares * price) / nav) * 100;

const newTradeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const wholeShares = (n: number) => Math.max(0, Math.floor(n));

/** Cap a buy by available cash and by the per-name concentration limit. */
export function sizeBuy(args: {
  requested: number;
  price: number;
  cash: number;
  symbol: string;
  positions: Position[];
  nav: number;
  maxPositionPct: number;
}): number {
  const { price, cash, symbol, positions, nav, maxPositionPct } = args;
  if (price <= 0) return 0;
  const affordable = Math.floor(cash / price);
  const held = positions.find((p) => p.symbol === symbol);
  const heldValue = held ? held.shares * price : 0;
  const room = Math.max(0, nav * maxPositionPct - heldValue);
  const roomShares = Math.floor(room / price);
  return Math.max(0, Math.min(args.requested, affordable, roomShares));
}

/** Apply one fill at the quoted price. Sells are capped at the held size. */
export function applyTrade(book: Book, input: TradeInput): TradeResult {
  const shares = wholeShares(input.shares);
  if (shares <= 0) return { book, trade: null, reason: "size rounded to zero" };

  if (input.side === "buy") {
    const cost = shares * input.price;
    if (cost > book.cash + 1e-6)
      return { book, trade: null, reason: "not enough cash" };
    const existing = book.positions.find((p) => p.symbol === input.symbol);
    let positions: Position[];
    if (existing) {
      const total = existing.shares + shares;
      const avgCost =
        (existing.avgCost * existing.shares + input.price * shares) / total;
      positions = book.positions.map((p) =>
        p.symbol === input.symbol
          ? {
              ...p,
              shares: total,
              avgCost,
              stopPrice: input.stopPrice ?? p.stopPrice,
              targetPrice: input.targetPrice ?? p.targetPrice,
            }
          : p,
      );
    } else {
      positions = [
        ...book.positions,
        {
          symbol: input.symbol,
          shares,
          avgCost: input.price,
          stopPrice: input.stopPrice,
          targetPrice: input.targetPrice,
        },
      ];
    }
    const trade: Trade = {
      id: newTradeId(),
      ts: Date.now(),
      symbol: input.symbol,
      side: "buy",
      shares,
      price: input.price,
      thesis: input.thesis,
      confidence: input.confidence,
      source: input.source,
      realized: 0,
    };
    return { book: { ...book, cash: book.cash - cost, positions }, trade };
  }

  const held = book.positions.find((p) => p.symbol === input.symbol);
  if (!held || held.shares <= 0)
    return { book, trade: null, reason: "no position" };
  const sold = Math.min(shares, held.shares);
  const proceeds = sold * input.price;
  const realized = (input.price - held.avgCost) * sold;
  const remaining = held.shares - sold;
  const positions =
    remaining <= 0
      ? book.positions.filter((p) => p.symbol !== input.symbol)
      : book.positions.map((p) =>
          p.symbol === input.symbol ? { ...p, shares: remaining } : p,
        );
  const trade: Trade = {
    id: newTradeId(),
    ts: Date.now(),
    symbol: input.symbol,
    side: "sell",
    shares: sold,
    price: input.price,
    thesis: input.thesis,
    confidence: input.confidence,
    source: input.source,
    realized,
  };
  return { book: { ...book, cash: book.cash + proceeds, positions }, trade };
}

/** Fill a list of proposed tickets against the tape under the risk profile. */
export function applyOrders(
  book: Book,
  orders: Order[],
  quotes: Quote[],
  risk: RiskLevel,
) {
  const bySymbol = indexQuotes(quotes);
  const maxPositionPct = RISK_PROFILES[risk].maxPositionPct;
  let current = book;
  const fills: Trade[] = [];
  const skipped: string[] = [];
  for (const order of orders) {
    const quote = bySymbol.get(order.symbol);
    if (!quote) {
      skipped.push(`${order.symbol}: no quote`);
      continue;
    }
    const nav = computeNav(current, quotes);
    let shares = wholeShares(order.shares);
    let stopPrice: number | undefined;
    let targetPrice: number | undefined;
    if (order.side === "buy") {
      shares = sizeBuy({
        requested: shares,
        price: quote.price,
        cash: current.cash,
        symbol: order.symbol,
        positions: current.positions,
        nav,
        maxPositionPct,
      });
      if (order.stopPct && order.stopPct > 0)
        stopPrice = quote.price * (1 - order.stopPct / 100);
      if (order.targetPct && order.targetPct > 0)
        targetPrice = quote.price * (1 + order.targetPct / 100);
    }
    const result = applyTrade(current, {
      symbol: order.symbol,
      side: order.side,
      shares,
      price: quote.price,
      thesis: order.thesis,
      confidence: order.confidence,
      source: "grok",
      stopPrice,
      targetPrice,
    });
    if (!result.trade) {
      skipped.push(`${order.symbol}: ${result.reason ?? "unfilled"}`);
      continue;
    }
    current = result.book;
    fills.push(result.trade);
  }
  return { book: current, fills, skipped };
}

/** Sell any position whose stop or target has been crossed by the latest quote. */
export function applyStops(book: Book, quotes: Quote[]) {
  const bySymbol = indexQuotes(quotes);
  let current = book;
  const fills: Trade[] = [];
  for (const position of book.positions) {
    const quote = bySymbol.get(position.symbol);
    if (!quote) continue;
    const live = current.positions.find((p) => p.symbol === position.symbol);
    if (!live) continue;
    if (live.stopPrice && quote.price <= live.stopPrice) {
      const r = applyTrade(current, {
        symbol: live.symbol,
        side: "sell",
        shares: live.shares,
        price: quote.price,
        thesis: `Stop hit at ${live.stopPrice.toFixed(2)}`,
        confidence: 1,
        source: "stop",
      });
      if (r.trade) {
        current = r.book;
        fills.push(r.trade);
      }
      continue;
    }
    if (live.targetPrice && quote.price >= live.targetPrice) {
      const r = applyTrade(current, {
        symbol: live.symbol,
        side: "sell",
        shares: live.shares,
        price: quote.price,
        thesis: `Target hit at ${live.targetPrice.toFixed(2)}`,
        confidence: 1,
        source: "target",
      });
      if (r.trade) {
        current = r.book;
        fills.push(r.trade);
      }
    }
  }
  return { book: current, fills };
}

/** Append a NAV sample (de-duplicated within 15s / 50c), keeping the last `max` points. */
export function appendEquity(
  points: { ts: number; nav: number }[],
  nav: number,
  max = 180,
) {
  const last = points[points.length - 1];
  const now = Date.now();
  if (last && now - last.ts < 15_000 && Math.abs(last.nav - nav) < 0.5)
    return points;
  const next = [...points, { ts: now, nav }];
  return next.length > max ? next.slice(next.length - max) : next;
}

export function tradeStats(trades: Trade[]) {
  const sells = trades.filter((t) => t.side === "sell");
  const wins = sells.filter((t) => t.realized > 0).length;
  const realized = sells.reduce((sum, t) => sum + t.realized, 0);
  return {
    closed: sells.length,
    wins,
    winRate: sells.length ? wins / sells.length : 0,
    realized,
  };
}

export function makeCycleRecord(
  outlook: string,
  stance: StanceName,
  orders: Order[],
  fills: Trade[],
  skipped: string[],
): CycleRecord {
  return { ts: Date.now(), outlook, stance, orders, fills, skipped };
}
