// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { ShareLadderDialog } from "@/components/desk/share";
import { LegalLinks } from "@/components/legal";
import { TipJarCompact } from "@/components/tip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeNav, tradeStats } from "@/lib/book";
import { formatPct, timeAgo, toneClass } from "@/lib/format";
import {
  defaultHandle,
  formatWinRate,
  ladderRowFromBook,
  sanitizeHandle,
  sortLadder,
} from "@/lib/ladder";
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/auth";
import {
  fetchLadder,
  fetchMyLadderRow,
  postToLadder,
  removeFromLadder,
} from "@/services/ladder";
import { useDeskStore } from "@/store/desk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Flame, LoaderCircle, Share2 } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function LadderPage() {
  let { user: e, isPending: t } = useAuth(),
    n = !!e,
    r = useQueryClient(),
    [i, a] = useState("return"),
    [o, s] = useState(""),
    [c, l] = useState(false),
    [u, d] = useState(false),
    f = useDeskStore((e) => e.funded),
    p = useDeskStore((e) => e.cash),
    m = useDeskStore((e) => e.initialCash),
    h = useDeskStore((e) => e.positions),
    g = useDeskStore((e) => e.trades),
    _ = useDeskStore((e) => e.streak ?? 0),
    v = useDeskStore((e) => e.bestStreak ?? 0),
    y = useDeskStore((e) => e.lastSeenNav ?? 0),
    b =
      y > 0
        ? y
        : computeNav(
            {
              cash: p,
              initialCash: m,
              positions: h,
            },
            [],
          ),
    x = ladderRowFromBook({
      handle: o || "desk",
      trades: g,
      nav: b || m || p,
      initialCash: m || 1,
      streak: _,
      bestStreak: v,
    }),
    S = useQuery({
      queryKey: ["ladder"],
      queryFn: () => fetchLadder(),
      enabled: n,
    }),
    C = useQuery({
      queryKey: ["ladder-mine"],
      queryFn: () => fetchMyLadderRow(),
      enabled: n,
    });
  useEffect(() => {
    if (!e) return;
    let t = C.data?.posted ? C.data.row.handle : "";
    if (t) {
      s((e) => e || t);
      return;
    }
    s((t) => t || defaultHandle(e.displayName, e.primaryEmail));
  }, [e, C.data]);
  let w = useMemo(() => sortLadder(S.data ?? [], i), [S.data, i]),
    T = C.data?.posted && C.data.optedIn ? C.data.row : null,
    E = T ? w.findIndex((e) => e.isMe) + 1 : 0,
    D = T
      ? {
          handle: T.handle,
          winRate: T.winRate,
          wins: T.wins,
          closed: T.closed,
          returnPct: T.returnPct,
          streak: T.streak,
          bestStreak: T.bestStreak,
        }
      : x;
  async function O() {
    if (u) return;
    let e = sanitizeHandle(o);
    if (!e) {
      toast.error("Handle needs 2–20 letters or numbers.");
      return;
    }
    d(true);
    try {
      let t = await postToLadder({
        data: {
          ...x,
          handle: e,
        },
      });
      if (!t.ok) {
        toast.error(t.error);
        return;
      }
      (s(t.handle),
        await Promise.all([
          r.invalidateQueries({
            queryKey: ["ladder"],
          }),
          r.invalidateQueries({
            queryKey: ["ladder-mine"],
          }),
        ]),
        toast("Posted to the ladder", {
          description: `You’re #${t.rank} of ${t.total}.`,
        }));
    } catch (e) {
      let t = e instanceof Error ? e.message : "";
      toast.error(
        t === "Unauthorized" ? "Sign in to post." : "Could not post.",
      );
    } finally {
      d(false);
    }
  }
  async function k() {
    if (!u) {
      d(true);
      try {
        (await removeFromLadder(),
          await Promise.all([
            r.invalidateQueries({
              queryKey: ["ladder"],
            }),
            r.invalidateQueries({
              queryKey: ["ladder-mine"],
            }),
          ]),
          toast("Pulled off the ladder"));
      } catch {
        toast.error("Could not pull that down.");
      } finally {
        d(false);
      }
    }
  }
  let A = tradeStats(g);
  return (
    <main className="relative mx-auto min-h-dvh max-w-2xl px-5 pb-28 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="truncate text-sm tracking-widest text-muted uppercase">
            Phantastic Paper
          </span>
        </div>
        <ThemeToggle />
      </div>
      <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
        The ladder
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {
          "Opt in and post a handle, win rate, paper return, and streak. Not the book, not an email. Win-rate rank needs at least "
        }
        {3} closes so a single lucky print doesn’t own the board.
      </p>
      {t ? (
        <p className="mt-10 flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="size-4 animate-spin" />
          Checking the desk…
        </p>
      ) : n ? (
        <Fragment>
          <section className="mt-8 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <p className="text-xs font-medium tracking-widest text-subtle uppercase">
              Your rung
            </p>
            <p className="mt-2 font-display text-3xl font-medium tracking-tight tabular-nums">
              {formatWinRate(x)}
              <span className="ml-2 text-lg text-muted">
                {A.closed ? `${A.wins}/${A.closed}` : "no closes"}
              </span>
            </p>
            <p
              className={cn(
                "mt-1 text-sm tabular-nums",
                toneClass(x.returnPct),
              )}
            >
              {formatPct(x.returnPct, 1)}
              {" paper"}
              {_ > 0 ? ` · day ${_}` : ""}
              {T && E ? ` · live #${E}` : ""}
            </p>
            {!f && (
              <p className="mt-2 text-xs text-muted">
                Open a paper book on the desk so the rung has something to say.
              </p>
            )}
            <div className="mt-4 grid gap-3">
              <div>
                <Label htmlFor="ladder-handle">Handle</Label>
                <Input
                  id="ladder-handle"
                  value={o}
                  maxLength={20}
                  className="mt-2"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(e) => s(e.target.value)}
                />
                <p className="mt-1 text-xs text-subtle">
                  Letters, numbers, underscore. Never an email.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={u}
                  onClick={() => void O()}
                >
                  {T ? "Refresh my rung" : "Post to the ladder"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => l(true)}
                >
                  <Share2 />
                  Share win rate
                </Button>
              </div>
              {T && (
                <button
                  type="button"
                  className="self-start text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
                  onClick={() => void k()}
                >
                  Pull my name off the board
                </button>
              )}
            </div>
          </section>
          <Tabs value={i} onValueChange={(e) => a(e)} className="mt-8">
            <TabsList className="w-full">
              <TabsTrigger value="return">Return</TabsTrigger>
              <TabsTrigger value="winrate">Win rate</TabsTrigger>
              <TabsTrigger value="streak">Streak</TabsTrigger>
            </TabsList>
          </Tabs>
          {S.isLoading ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-muted">
              <LoaderCircle className="size-4 animate-spin" />
              Pulling the board…
            </p>
          ) : w.length === 0 ? (
            <p className="mt-6 text-sm leading-relaxed text-muted">
              The rungs are empty. Close a ticket, post a handle, and take the
              first step.
            </p>
          ) : (
            <ol className="mt-4 flex flex-col gap-2">
              {w.map((e, t) => {
                let n = e.closed >= 3;
                return (
                  <li
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 sm:px-4",
                      e.isMe
                        ? "bg-surface-2"
                        : "bg-surface shadow-[var(--shadow-border)]",
                    )}
                  >
                    <span className="w-8 shrink-0 text-sm tabular-nums text-subtle">
                      {t + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {e.handle}
                        {e.isMe ? (
                          <span className="ml-2 text-xs font-normal text-muted">
                            · you
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                        {e.streak > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Flame className="size-3" aria-hidden={true} />
                            {e.streak}
                          </span>
                        )}
                        <span>{timeAgo(Date.parse(e.updatedAt))}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "font-display text-lg font-medium tabular-nums",
                          i === "winrate" ? "text-fg" : toneClass(e.returnPct),
                        )}
                      >
                        {i === "winrate"
                          ? n
                            ? formatWinRate(e)
                            : "—"
                          : formatPct(e.returnPct, 1)}
                      </p>
                      <p className="text-xs tabular-nums text-muted">
                        {i === "winrate"
                          ? e.closed
                            ? `${e.wins}/${e.closed}`
                            : "no closes"
                          : n
                            ? formatWinRate(e)
                            : `${e.closed} closed`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Fragment>
      ) : (
        <div className="mt-10 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="font-display text-xl font-medium tracking-tight">
            Sign in to climb
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The board is for signed-in desks. Posting is opt-in. Sharing a card
            still works from the desk once you’re in.
          </p>
          <Button asChild={true} className="mt-4">
            <Link
              to="/login"
              search={{
                next: "/ladder",
              }}
            >
              Sign in
            </Link>
          </Button>
        </div>
      )}
      <div className="mt-12 flex flex-col gap-3">
        <TipJarCompact />
        <LegalLinks />
        <Link to="/" className="text-sm text-muted hover:text-fg">
          Back to the desk
        </Link>
      </div>
      {c && <ShareLadderDialog open={c} onOpenChange={l} stats={D} />}
    </main>
  );
}
