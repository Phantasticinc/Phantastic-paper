/** Core domain types shared by the paper-trading desk, stores and services. */

export type Side = "buy" | "sell";
export type TradeSource = "grok" | "manual" | "stop" | "target";
export type RiskLevel = "conservative" | "balanced" | "aggressive";
export type StanceName = "risk-on" | "neutral" | "risk-off";
export type BillingInterval = "monthly" | "lifetime";

export interface Quote {
  symbol: string;
  name?: string;
  price: number;
  changePct: number;
  high?: number;
  low?: number;
  /** Recent price path for the tape sparkline (oldest → newest). */
  spark?: number[];
}

export interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
  stopPrice?: number;
  targetPrice?: number;
}

export interface Trade {
  id: string;
  ts: number;
  symbol: string;
  side: Side;
  shares: number;
  price: number;
  thesis: string;
  confidence: number;
  source: TradeSource;
  /** Realised P&L, only non-zero on sells. */
  realized: number;
}

export interface Book {
  cash: number;
  initialCash: number;
  positions: Position[];
}

export interface EquityPoint {
  ts: number;
  nav: number;
}

/** A ticket proposed by the autopilot (or a recorded proposal). */
export interface Order {
  symbol: string;
  side: Side;
  shares: number;
  thesis: string;
  confidence: number;
  stopPct?: number;
  targetPct?: number;
}

export interface CycleRecord {
  ts: number;
  outlook: string;
  stance: StanceName;
  orders: Order[];
  fills: Trade[];
  skipped: string[];
}

export interface TradeInput {
  symbol: string;
  side: Side;
  shares: number;
  price: number;
  thesis: string;
  confidence: number;
  source: TradeSource;
  stopPrice?: number;
  targetPrice?: number;
}

export interface TradeResult {
  book: Book;
  trade: Trade | null;
  reason?: string;
}

export interface LadderRow {
  handle: string;
  winRate: number;
  wins: number;
  closed: number;
  nav: number;
  initialCash: number;
  returnPct: number;
  streak: number;
  bestStreak: number;
}

export type LadderSort = "winrate" | "return" | "streak";

export interface AppUser {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  isDevFallback?: boolean;
}
