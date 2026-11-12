import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  appendEquity,
  applyOrders,
  applyStops,
  applyTrade,
  computeNav,
  makeCycleRecord,
} from "@/lib/book";
import { clampCapital, DEFAULT_CAPITAL } from "@/lib/capital";
import {
  advanceStreak,
  dayKey,
  marksFromQuotes,
  yesterdayKey,
} from "@/lib/engagement";
import { RISK_PROFILES } from "@/lib/plans";
import { CORE_SYMBOLS, normalizeSymbol } from "@/lib/universe";
import type {
  Book,
  CycleRecord,
  EquityPoint,
  Order,
  Position,
  Quote,
  RiskLevel,
  Side,
  StanceName,
  Trade,
} from "@/lib/types";

const MAX_UNIVERSE = 32;
const MIN_UNIVERSE = 4;
const MAX_TRADES = 200;

export interface DeskState {
  funded: boolean;
  mode: "paper" | null;
  risk: RiskLevel;
  riskAcked: boolean;
  autonomy: "auto" | "confirm";
  maxOrders: number;
  universe: string[];
  customNames: Record<string, string>;
  // engagement
  lastSeenAt: number;
  lastSeenNav: number;
  lastSeenMarks: Record<string, number>;
  streak: number;
  streakDay: string;
  bestStreak: number;
  cycledDay: string;
  trophies: string[];
  // book
  cash: number;
  initialCash: number;
  positions: Position[];
  trades: Trade[];
  equity: EquityPoint[];
  lastCycle: CycleRecord | null;

  fund: (capital?: number) => void;
  openPaper: (capital?: number) => void;
  leaveDesk: () => void;
  reset: () => void;
  setCapital: (capital: number) => void;
  setRisk: (risk: RiskLevel) => void;
  setMaxOrders: (n: number) => void;
  toggleSymbol: (symbol: string) => void;
  addSymbol: (symbol: string, name?: string) => boolean;
  removeCustom: (symbol: string) => void;
  applyCycle: (
    outlook: string,
    stance: StanceName,
    orders: Order[],
    quotes: Quote[],
  ) => CycleRecord;
  proposeCycle: (
    outlook: string,
    stance: StanceName,
    orders: Order[],
  ) => CycleRecord;
  applyProposed: (order: Order, quotes: Quote[]) => Trade | null;
  applyProposedAll: (quotes: Quote[]) => Trade[];
  applyManual: (
    symbol: string,
    side: Side,
    shares: number,
    quotes: Quote[],
    thesis?: string,
  ) => Trade | null;
  applyStops: (quotes: Quote[]) => Trade[];
  snapshot: (quotes: Quote[]) => void;
  ackRisk: () => void;
  setAutonomy: (mode: "auto" | "confirm") => void;
  bumpStreak: () => void;
  checkIn: (nav: number, quotes: Quote[]) => void;
  markCycled: () => void;
  unlockTrophies: (ids: string[]) => string[];
}

const freshBook = (capital: number) => ({
  cash: capital,
  initialCash: capital,
  positions: [] as Position[],
  trades: [] as Trade[],
  equity: [{ ts: Date.now(), nav: capital }] as EquityPoint[],
  lastCycle: null as CycleRecord | null,
});

const bookOf = (
  s: Pick<DeskState, "cash" | "initialCash" | "positions">,
): Book => ({
  cash: s.cash,
  initialCash: s.initialCash,
  positions: s.positions,
});

/** Fill in engagement fields for state saved by older versions. */
function normalizeEngagement(s: Partial<DeskState>) {
  const streak = typeof s.streak === "number" && s.streak > 0 ? s.streak : 0;
  return {
    lastSeenAt: typeof s.lastSeenAt === "number" ? s.lastSeenAt : 0,
    lastSeenNav: typeof s.lastSeenNav === "number" ? s.lastSeenNav : 0,
    lastSeenMarks:
      s.lastSeenMarks && typeof s.lastSeenMarks === "object"
        ? s.lastSeenMarks
        : {},
    streak,
    streakDay: typeof s.streakDay === "string" ? s.streakDay : "",
    bestStreak:
      typeof s.bestStreak === "number" && s.bestStreak > 0
        ? s.bestStreak
        : streak,
    cycledDay: typeof s.cycledDay === "string" ? s.cycledDay : "",
    trophies: Array.isArray(s.trophies) ? s.trophies : [],
  };
}

/** The paper book + desk settings. localStorage key/version kept identical to the original app. */
export const useDeskStore = create<DeskState>()(
  persist(
    (set, get) => ({
      funded: false,
      mode: null,
      risk: "balanced",
      riskAcked: false,
      autonomy: "auto",
      maxOrders: RISK_PROFILES.balanced.defaultMaxOrders,
      universe: CORE_SYMBOLS.slice(),
      customNames: {},
      lastSeenAt: 0,
      lastSeenNav: 0,
      lastSeenMarks: {},
      streak: 0,
      streakDay: "",
      bestStreak: 0,
      cycledDay: "",
      trophies: [],
      ...freshBook(DEFAULT_CAPITAL),

      fund: (capital) =>
        set({
          funded: true,
          mode: "paper",
          ...freshBook(
            clampCapital(capital ?? get().initialCash ?? DEFAULT_CAPITAL),
          ),
        }),
      openPaper: (capital) => {
        const s = get();
        if (!s.funded) {
          set({
            funded: true,
            mode: "paper",
            ...freshBook(
              clampCapital(capital ?? s.initialCash ?? DEFAULT_CAPITAL),
            ),
          });
          return;
        }
        set({ mode: "paper" });
      },
      leaveDesk: () => set({ mode: null }),
      reset: () => set({ ...freshBook(get().initialCash) }),
      setCapital: (capital) => set({ ...freshBook(clampCapital(capital)) }),
      setRisk: (risk) =>
        set({ risk, maxOrders: RISK_PROFILES[risk].defaultMaxOrders }),
      setMaxOrders: (n) =>
        set({ maxOrders: Math.min(6, Math.max(1, Math.round(n))) }),
      toggleSymbol: (symbol) =>
        set((s) => {
          const on = s.universe.includes(symbol);
          if (on && s.universe.length <= MIN_UNIVERSE) return s;
          return {
            universe: on
              ? s.universe.filter((x) => x !== symbol)
              : s.universe.length >= MAX_UNIVERSE
                ? s.universe
                : [...s.universe, symbol],
          };
        }),
      addSymbol: (raw, name) => {
        const symbol = normalizeSymbol(raw);
        if (!symbol) return false;
        const s = get();
        if (s.universe.includes(symbol)) return true;
        if (s.universe.length >= MAX_UNIVERSE) return false;
        set({
          universe: [...s.universe, symbol],
          customNames: name
            ? { ...s.customNames, [symbol]: name }
            : s.customNames,
        });
        return true;
      },
      removeCustom: (symbol) =>
        set((s) => {
          const customNames = { ...s.customNames };
          delete customNames[symbol];
          const universe = s.universe.filter((x) => x !== symbol);
          return {
            customNames,
            universe: universe.length >= MIN_UNIVERSE ? universe : s.universe,
          };
        }),

      applyCycle: (outlook, stance, orders, quotes) => {
        const s = get();
        const filled = applyOrders(bookOf(s), orders, quotes, s.risk);
        const record = makeCycleRecord(
          outlook,
          stance,
          orders,
          filled.fills,
          filled.skipped,
        );
        const nav = computeNav(filled.book, quotes);
        set({
          cash: filled.book.cash,
          positions: filled.book.positions,
          trades: [...filled.fills, ...s.trades].slice(0, MAX_TRADES),
          lastCycle: record,
          equity: appendEquity(s.equity, nav),
        });
        return record;
      },
      proposeCycle: (outlook, stance, orders) => {
        const record = makeCycleRecord(outlook, stance, orders, [], []);
        set({ lastCycle: record });
        return record;
      },
      applyProposed: (order, quotes) => {
        const s = get();
        const filled = applyOrders(bookOf(s), [order], quotes, s.risk);
        const fill = filled.fills[0] ?? null;
        const remaining = [...(s.lastCycle?.orders ?? [])];
        const idx = remaining.findIndex(
          (o) =>
            o.symbol === order.symbol &&
            o.side === order.side &&
            o.shares === order.shares &&
            o.thesis === order.thesis,
        );
        if (idx >= 0) remaining.splice(idx, 1);
        const nav = computeNav(filled.book, quotes);
        set({
          cash: filled.book.cash,
          positions: filled.book.positions,
          trades: fill ? [fill, ...s.trades].slice(0, MAX_TRADES) : s.trades,
          lastCycle: s.lastCycle
            ? {
                ...s.lastCycle,
                orders: remaining,
                fills: fill ? [fill, ...s.lastCycle.fills] : s.lastCycle.fills,
                skipped: [...s.lastCycle.skipped, ...filled.skipped],
              }
            : s.lastCycle,
          equity: appendEquity(s.equity, nav),
        });
        return fill;
      },
      applyProposedAll: (quotes) => {
        const s = get();
        const orders = s.lastCycle?.orders ?? [];
        if (orders.length === 0) return [];
        const filled = applyOrders(bookOf(s), orders, quotes, s.risk);
        const nav = computeNav(filled.book, quotes);
        set({
          cash: filled.book.cash,
          positions: filled.book.positions,
          trades: filled.fills.length
            ? [...filled.fills, ...s.trades].slice(0, MAX_TRADES)
            : s.trades,
          lastCycle: s.lastCycle
            ? {
                ...s.lastCycle,
                orders: [],
                fills: [...filled.fills, ...s.lastCycle.fills],
                skipped: [...s.lastCycle.skipped, ...filled.skipped],
              }
            : s.lastCycle,
          equity: appendEquity(s.equity, nav),
        });
        return filled.fills;
      },
      applyManual: (symbol, side, shares, quotes, thesis) => {
        const s = get();
        const quote = quotes.find((q) => q.symbol === symbol);
        if (!quote) return null;
        const result = applyTrade(bookOf(s), {
          symbol,
          side,
          shares,
          price: quote.price,
          thesis: thesis ?? (side === "buy" ? "Manual buy" : "Manual sell"),
          confidence: 1,
          source: "manual",
        });
        if (!result.trade) return null;
        const nav = computeNav(result.book, quotes);
        set({
          cash: result.book.cash,
          positions: result.book.positions,
          trades: [result.trade, ...s.trades].slice(0, MAX_TRADES),
          equity: appendEquity(s.equity, nav),
        });
        return result.trade;
      },
      applyStops: (quotes) => {
        const s = get();
        if (s.positions.length === 0) return [];
        const result = applyStops(bookOf(s), quotes);
        if (result.fills.length === 0) return [];
        const nav = computeNav(result.book, quotes);
        set({
          cash: result.book.cash,
          positions: result.book.positions,
          trades: [...result.fills, ...s.trades].slice(0, MAX_TRADES),
          equity: appendEquity(s.equity, nav),
        });
        return result.fills;
      },
      snapshot: (quotes) => {
        const s = get();
        set({ equity: appendEquity(s.equity, computeNav(bookOf(s), quotes)) });
      },
      ackRisk: () => set({ riskAcked: true }),
      setAutonomy: (autonomy) => set({ autonomy }),
      bumpStreak: () => {
        const s = get();
        const next = advanceStreak(
          s.streak,
          s.streakDay,
          dayKey(),
          yesterdayKey(),
        );
        if (next.streak !== s.streak || next.streakDay !== s.streakDay) {
          set({
            streak: next.streak,
            streakDay: next.streakDay,
            bestStreak: Math.max(s.bestStreak, next.streak),
          });
        }
      },
      checkIn: (nav, quotes) => {
        const s = get();
        const next = advanceStreak(
          s.streak,
          s.streakDay,
          dayKey(),
          yesterdayKey(),
        );
        set({
          lastSeenAt: Date.now(),
          lastSeenNav: nav,
          lastSeenMarks: marksFromQuotes(quotes),
          streak: next.streak,
          streakDay: next.streakDay,
          bestStreak: Math.max(s.bestStreak, next.streak),
        });
      },
      markCycled: () => set({ cycledDay: dayKey() }),
      unlockTrophies: (ids) => {
        if (ids.length === 0) return [];
        const s = get();
        const have = new Set(s.trophies);
        const fresh = ids.filter((id) => !have.has(id));
        if (fresh.length === 0) return [];
        set({ trophies: [...s.trophies, ...fresh] });
        return fresh;
      },
    }),
    {
      name: "phantastic-paper-v1",
      version: 3,
      skipHydration: true,
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Record<string, any>;
        const mode =
          s.mode === "paper" || s.mode === "live" || s.funded ? "paper" : null;
        const autonomy =
          s.autonomy === "confirm" || s.autonomy === "auto"
            ? s.autonomy
            : s.liveAutonomy === "confirm" || s.liveAutonomy === "auto"
              ? s.liveAutonomy
              : "auto";
        return { ...s, mode, autonomy, ...normalizeEngagement(s) } as DeskState;
      },
      partialize: (s) => ({
        funded: s.funded,
        mode: s.mode,
        cash: s.cash,
        initialCash: s.initialCash,
        positions: s.positions,
        trades: s.trades,
        equity: s.equity,
        risk: s.risk,
        maxOrders: s.maxOrders,
        universe: s.universe,
        customNames: s.customNames,
        lastCycle: s.lastCycle,
        riskAcked: s.riskAcked,
        autonomy: s.autonomy,
        lastSeenAt: s.lastSeenAt,
        lastSeenNav: s.lastSeenNav,
        lastSeenMarks: s.lastSeenMarks,
        streak: s.streak,
        streakDay: s.streakDay,
        bestStreak: s.bestStreak,
        cycledDay: s.cycledDay,
        trophies: s.trophies,
      }),
    },
  ),
);
