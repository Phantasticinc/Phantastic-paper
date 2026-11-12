import { normalizeLadderRow, sanitizeHandle } from "@/lib/ladder";
import type { LadderRow } from "@/lib/types";

/**
 * Ladder adapter. The original ladder was a shared server-side board. A static host has no
 * shared database, so this build keeps a LOCAL board in localStorage (this browser only).
 * Implement the same four functions against an API to make it global.
 */
const KEY = "phantastic-local-ladder-v1";

export interface StoredRow extends LadderRow {
  updatedAt: string;
  isMe: boolean;
}

function load(): StoredRow[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredRow[]) : [];
  } catch {
    return [];
  }
}
function save(rows: StoredRow[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export const fetchLadder = async (): Promise<StoredRow[]> => load();

export const fetchMyLadderRow = async (): Promise<
  { posted: false } | { posted: true; optedIn: true; row: StoredRow }
> => {
  const mine = load().find((r) => r.isMe);
  return mine ? { posted: true, optedIn: true, row: mine } : { posted: false };
};

export const postToLadder = async ({
  data,
}: {
  data: Partial<LadderRow> & { handle: string };
}): Promise<
  | { ok: true; handle: string; rank: number; total: number }
  | { ok: false; error: string }
> => {
  const handle = sanitizeHandle(data.handle);
  if (!handle)
    return { ok: false, error: "Handle needs 2–20 letters or numbers." };
  const rows = load().filter((r) => !r.isMe);
  if (rows.some((r) => r.handle === handle))
    return { ok: false, error: "That handle is taken." };
  const row: StoredRow = {
    ...normalizeLadderRow({ ...data, handle }),
    updatedAt: new Date().toISOString(),
    isMe: true,
  };
  const next = [...rows, row];
  save(next);
  const ranked = [...next].sort((a, b) => b.returnPct - a.returnPct);
  return {
    ok: true,
    handle,
    rank: ranked.findIndex((r) => r.isMe) + 1,
    total: next.length,
  };
};

export const removeFromLadder = async (): Promise<{ ok: true }> => {
  save(load().filter((r) => !r.isMe));
  return { ok: true };
};
