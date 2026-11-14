import { formatPct } from "./format";
import { tradeStats } from "./book";
import type { LadderRow, LadderSort, Trade } from "./types";

export const LADDER_PATH = "/ladder";

const RESERVED_HANDLES = new Set([
  "admin",
  "operator",
  "grok",
  "official",
  "phantastic",
  "paper",
  "support",
  "help",
]);

/** Lower-case a-z0-9_ only, 2-20 chars, never numeric-first or reserved. */
export function sanitizeHandle(raw: string): string | null {
  let h = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 20);
  if (h.length < 2) return null;
  if (/^[0-9]/.test(h)) h = `d_${h}`.slice(0, 20);
  if (RESERVED_HANDLES.has(h)) h = `${h}_desk`.slice(0, 20);
  return h.length >= 2 ? h : null;
}

/** Suggested handle from display name, then email local-part, else "desk". */
export function defaultHandle(
  displayName?: string | null,
  email?: string | null,
): string {
  return (
    sanitizeHandle(displayName ?? "") ||
    sanitizeHandle((email ?? "").split("@")[0] ?? "") ||
    "desk"
  );
}

const clampInt = (v: unknown, lo: number, hi: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : lo;
};
const clampNum = (v: unknown, lo: number, hi: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo;
};

/** Validate/clamp a ladder row exactly like the original server did before storing. */
export function normalizeLadderRow(
  raw: Partial<Record<keyof LadderRow, unknown>>,
): LadderRow {
  const closed = clampInt(raw.closed, 0, 1e5);
  const wins = Math.min(closed, clampInt(raw.wins, 0, 1e5));
  const initialCash = clampNum(raw.initialCash, 1, 1e7);
  const nav = clampNum(raw.nav, 0, 5e7);
  const returnPct = clampNum(
    ((nav - initialCash) / initialCash) * 100,
    -99.9,
    9999,
  );
  const streak = clampInt(raw.streak, 0, 3650);
  const bestStreak = Math.max(streak, clampInt(raw.bestStreak, 0, 3650));
  return {
    handle: sanitizeHandle(String(raw.handle ?? "")) ?? "desk",
    winRate: closed ? wins / closed : 0,
    wins,
    closed,
    nav,
    initialCash,
    returnPct,
    streak,
    bestStreak,
  };
}

export function ladderRowFromBook(args: {
  handle: string;
  trades: Trade[];
  nav: number;
  initialCash: number;
  streak: number;
  bestStreak: number;
}): LadderRow {
  const stats = tradeStats(args.trades);
  const start = args.initialCash > 0 ? args.initialCash : 1;
  return normalizeLadderRow({
    handle: args.handle,
    winRate: stats.winRate,
    wins: stats.wins,
    closed: stats.closed,
    nav: args.nav,
    initialCash: start,
    returnPct: ((args.nav - start) / start) * 100,
    streak: args.streak,
    bestStreak: args.bestStreak,
  });
}

/** Win-rate rank needs >= 3 closes; those below the bar sort after the ranked rows. */
export function sortLadder(rows: LadderRow[], by: LadderSort): LadderRow[] {
  const copy = [...rows];
  if (by === "return")
    return copy.sort(
      (a, b) => b.returnPct - a.returnPct || b.closed - a.closed,
    );
  if (by === "streak")
    return copy.sort(
      (a, b) => b.streak - a.streak || b.returnPct - a.returnPct,
    );
  return copy.sort((a, b) => {
    const aRanked = +(a.closed >= 3);
    const bRanked = +(b.closed >= 3);
    return bRanked === aRanked
      ? b.winRate - a.winRate || b.closed - a.closed
      : bRanked - aRanked;
  });
}

export const formatWinRate = (r: LadderRow) =>
  r.closed ? `${Math.round(r.winRate * 100)}%` : "—";

/** Absolute URL of the ladder (respects the deploy base path). */
export function ladderUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return typeof window === "undefined"
    ? LADDER_PATH
    : `${window.location.origin}${base}${LADDER_PATH}`;
}

export function shareCaption(r: LadderRow): string {
  const url = ladderUrl();
  const rate = formatWinRate(r);
  const ret = formatPct(r.returnPct, 1);
  const day = r.streak > 0 ? ` Day ${r.streak}.` : "";
  return r.closed
    ? `${r.handle} is ${rate} on the Phantastic Paper ladder (${r.wins}/${r.closed} closed, ${ret} paper).${day} Fake P&L, real feelings. ${url}`
    : `${r.handle} is ${ret} on the Phantastic Paper desk.${day} Paper fills, fake P&L, real feelings. Simulated results, not advice. ${url}`;
}

export function shareLinks(r: LadderRow) {
  const url = ladderUrl();
  const text = shareCaption(r);
  const title = r.closed
    ? `${formatWinRate(r)} win rate on Phantastic Paper`
    : `${formatPct(r.returnPct, 1)} on Phantastic Paper`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    x: `https://x.com/intent/tweet?text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    threads: `https://www.threads.net/intent/post?text=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${t}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
  };
}
