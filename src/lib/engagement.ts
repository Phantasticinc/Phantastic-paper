import type { CycleRecord, Position, Quote, Trade } from "./types";

/** Streaks, "while you were away" briefing and trophies. */

export const BIG_MOVE_PCT = 2.5;

export const TROPHIES: Record<string, { title: string; line: string }> = {
  "first-fill": {
    title: "Ink on the blotter",
    line: "First paper fill printed.",
  },
  "ten-fills": {
    title: "Ten prints",
    line: "The tape is starting to know your name.",
  },
  "first-cycle": {
    title: "Grok took the conn",
    line: "First cycle is on the book.",
  },
  "book-open": {
    title: "You’re in a name",
    line: "Something to check tomorrow.",
  },
  "first-green": {
    title: "Green on the book",
    line: "NAV cleared the starting line.",
  },
  "streak-3": {
    title: "Three days on the tape",
    line: "The desk is becoming a habit.",
  },
  "streak-7": {
    title: "A week of opens",
    line: "Seven mornings. The blotter noticed.",
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Local YYYY-MM-DD */
export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function yesterdayKey(d = new Date()): string {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return dayKey(y);
}

/** True once the user has been away at least 45 minutes. */
export const isAwayLongEnough = (lastSeenAt: number, now = Date.now()) =>
  lastSeenAt > 0 && now - lastSeenAt >= 45 * 60 * 1000;

export function advanceStreak(
  streak: number,
  streakDay: string,
  today = dayKey(),
  yesterday = yesterdayKey(),
) {
  if (streakDay === today)
    return { streak: Math.max(1, streak), streakDay: today };
  if (streakDay === yesterday)
    return { streak: Math.max(1, streak) + 1, streakDay: today };
  return { streak: 1, streakDay: today };
}

export function marksFromQuotes(quotes: Quote[]): Record<string, number> {
  const marks: Record<string, number> = {};
  for (const q of quotes) if (q.price > 0) marks[q.symbol] = q.price;
  return marks;
}

export function formatAway(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60_000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  return hours < 36 ? `${hours}h` : `${Math.round(hours / 24)}d`;
}

/** % distance down to the stop (negative when through it). */
export function pctToStop(
  stop: number | undefined,
  price: number,
): number | null {
  return !stop || !(price > 0) || stop <= 0
    ? null
    : ((price - stop) / price) * 100;
}

/** % distance up to the target (negative when through it). */
export function pctToTarget(
  target: number | undefined,
  price: number,
): number | null {
  return !target || !(price > 0) || target <= 0
    ? null
    : ((target - price) / price) * 100;
}

export const isBigMove = (pct: number) => Math.abs(pct) >= BIG_MOVE_PCT;

export interface Briefing {
  awayMs: number;
  navDelta: number;
  navPct: number;
  story: string;
  heat: string | null;
  topMoves: { symbol: string; changePct: number; sincePct: number | null }[];
  streak: number;
  cycledToday: boolean;
  held: number;
}

export function buildBriefing(args: {
  now?: number;
  lastSeenAt: number;
  lastSeenNav: number;
  lastSeenMarks: Record<string, number>;
  nav: number;
  quotes: Quote[];
  positions: Position[];
  streak: number;
  cycledToday: boolean;
}): Briefing | null {
  const now = args.now ?? Date.now();
  if (!isAwayLongEnough(args.lastSeenAt, now) || args.quotes.length === 0)
    return null;
  const navDelta = args.lastSeenNav > 0 ? args.nav - args.lastSeenNav : 0;
  const navPct = args.lastSeenNav > 0 ? (navDelta / args.lastSeenNav) * 100 : 0;
  const bySymbol = new Map(args.quotes.map((q) => [q.symbol, q]));
  const held: { symbol: string; changePct: number; sincePct: number | null }[] =
    [];
  let heat: string | null = null;
  let closestStop = 99;
  for (const p of args.positions) {
    const q = bySymbol.get(p.symbol);
    const price = q?.price ?? p.avgCost;
    const mark = args.lastSeenMarks[p.symbol];
    const sincePct = mark && mark > 0 ? ((price - mark) / mark) * 100 : null;
    held.push({ symbol: p.symbol, changePct: q?.changePct ?? 0, sincePct });
    const toStop = pctToStop(p.stopPrice, price);
    if (toStop !== null && toStop <= 3 && toStop < closestStop) {
      closestStop = toStop;
      heat =
        toStop <= 0
          ? `${p.symbol} is through its stop.`
          : `${p.symbol} is ${toStop.toFixed(1)}% from its stop.`;
    }
  }
  const tape = args.quotes.map((q) => {
    const mark = args.lastSeenMarks[q.symbol];
    return {
      symbol: q.symbol,
      changePct: q.changePct,
      sincePct: mark && mark > 0 ? ((q.price - mark) / mark) * 100 : null,
    };
  });
  const move = (m: { sincePct: number | null; changePct: number }) =>
    Math.abs(m.sincePct ?? m.changePct);
  const topMoves = [...tape].sort((a, b) => move(b) - move(a)).slice(0, 3);

  let story: string;
  if (args.positions.length === 0) {
    const top = topMoves[0];
    if (top && move(top) >= 0.4) {
      const pct = top.sincePct ?? top.changePct;
      const verb = pct >= 0 ? "ran" : "slid";
      story = `Flat book. ${top.symbol} ${verb} ${Math.abs(pct).toFixed(1)}% without you. Run Grok so tomorrow has a plot.`;
    } else {
      story = "Flat book, quiet tape. A cycle now is something to check later.";
    }
  } else {
    const noisy = held
      .map((h) => ({ ...h, score: h.sincePct ?? h.changePct }))
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0];
    story =
      navDelta > 4
        ? noisy
          ? `${noisy.symbol} carried the book while you were out.`
          : "The book marked up while you were out."
        : navDelta < -4
          ? noisy
            ? `${noisy.symbol} leaked. The rest of the book felt it.`
            : "The book marked down while you were out."
          : noisy && Math.abs(noisy.score) >= 1
            ? `${noisy.symbol} was the noisy name. NAV barely budged.`
            : "Quiet session. The names you hold mostly sat still.";
  }
  return {
    awayMs: now - args.lastSeenAt,
    navDelta,
    navPct,
    story,
    heat,
    topMoves,
    streak: args.streak,
    cycledToday: args.cycledToday,
    held: args.positions.length,
  };
}

export function earnedTrophies(args: {
  trades: Trade[];
  positions: Position[];
  nav: number;
  initialCash: number;
  lastCycle: CycleRecord | null;
  streak: number;
  already: string[];
}): string[] {
  const have = new Set(args.already);
  const earned: string[] = [];
  const add = (id: string) => {
    if (!have.has(id)) earned.push(id);
  };
  if (args.trades.length >= 1) add("first-fill");
  if (args.trades.length >= 10) add("ten-fills");
  if (args.lastCycle) add("first-cycle");
  if (args.positions.length >= 1) add("book-open");
  if (args.nav > args.initialCash + 0.5) add("first-green");
  if (args.streak >= 3) add("streak-3");
  if (args.streak >= 7) add("streak-7");
  return earned;
}
