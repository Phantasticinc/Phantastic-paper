// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { SimulatedNotice } from "@/components/policy/SimulatedNotice";
import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import { computeNav, positionPnl, positionWeightPct } from "@/lib/book";
import {
  formatAway,
  isBigMove,
  pctToStop,
  pctToTarget,
} from "@/lib/engagement";
import { formatPct, formatShares, formatUsd, toneClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Flame, Plus } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

export function EquityChart({ points, initialCash }) {
  let [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  let data = (
      points.length
        ? points
        : [
            {
              ts: Date.now(),
              nav: initialCash,
            },
          ]
    ).map((e) => ({
      ts: e.ts,
      nav: Number(e.nav.toFixed(2)),
    })),
    gaining = (data[data.length - 1]?.nav ?? initialCash) >= initialCash;
  return (
    <Card className="min-h-52">
      <div className="flex items-baseline justify-between">
        <CardLabel>Equity</CardLabel>
        <p className="text-xs text-muted tabular-nums">
          {"vs "}
          {formatUsd(initialCash, {
            whole: true,
          })}
          {" start"}
        </p>
      </div>
      <div className="h-40">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 8,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={
                      gaining ? "var(--color-gain)" : "var(--color-loss)"
                    }
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      gaining ? "var(--color-gain)" : "var(--color-loss)"
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin - 200", "dataMax + 200"]} hide={true} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--color-fg)",
                }}
                labelFormatter={(e) =>
                  new Date(Number(e)).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                }
                formatter={(e) => [formatUsd(Number(e ?? 0)), "NAV"]}
              />
              <Area
                type="monotone"
                dataKey="nav"
                stroke={gaining ? "var(--color-gain)" : "var(--color-loss)"}
                strokeWidth={1.6}
                fill="url(#navFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-md bg-surface-2" />
        )}
      </div>
    </Card>
  );
}
export function PositionsList({ book, quotes, lastMarks, onPick, emptyHint }) {
  let bySymbol = new Map(quotes.map((e) => [e.symbol, e])),
    nav = computeNav(book, quotes);
  return book.positions.length === 0 ? (
    <Card>
      <CardLabel>Positions</CardLabel>
      <p className="max-w-sm text-sm leading-relaxed text-muted">
        {emptyHint ??
          "Flat. Run a Grok cycle, or tap a name on the tape to ticket or research."}
      </p>
    </Card>
  ) : (
    <Card className="p-3 sm:p-4">
      <CardLabel>Positions</CardLabel>
      <div className="flex flex-col">
        {book.positions.map((e) => {
          let t = bySymbol.get(e.symbol)?.price ?? e.avgCost,
            i = positionPnl(e, t),
            s = e.avgCost ? ((t - e.avgCost) / e.avgCost) * 100 : 0,
            c = positionWeightPct(e, t, nav),
            l = lastMarks?.[e.symbol],
            u = l && l > 0 ? ((t - l) / l) * 100 : null,
            d = pctToStop(e.stopPrice, t),
            f = pctToTarget(e.targetPrice, t),
            p =
              d !== null && d <= 3
                ? d <= 0
                  ? "through stop"
                  : `${d.toFixed(1)}% to stop`
                : f !== null && f <= 3
                  ? f <= 0
                    ? "at target"
                    : `${f.toFixed(1)}% to tgt`
                  : null,
            m = p?.includes("stop");
          return (
            <button key={e.symbol}
              type="button"
              onClick={() => onPick(e.symbol)}
              className="flex items-center gap-3 rounded-md px-1 py-3 text-left transition-colors duration-150 hover:bg-surface-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="font-medium tracking-wide">{e.symbol}</span>
                  <span className="truncate text-xs text-muted">
                    {formatShares(e.shares)}
                    {" · "}
                    {c.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-subtle tabular-nums">
                  {"avg "}
                  {formatUsd(e.avgCost)}
                  {p ? (
                    <span className={cn(m ? "text-loss" : "text-gain")}>
                      {" "}
                      {"· "}
                      {p}
                    </span>
                  ) : (
                    <Fragment>
                      {e.stopPrice ? ` · stop ${formatUsd(e.stopPrice)}` : ""}
                      {e.targetPrice
                        ? ` · tgt ${formatUsd(e.targetPrice)}`
                        : ""}
                    </Fragment>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums">
                  {formatUsd(t)}
                </p>
                <p className={cn("text-xs tabular-nums", toneClass(i))}>
                  {formatUsd(i)} {formatPct(s)}
                </p>
                {u !== null && Math.abs(u) >= 0.15 && (
                  <p className={cn("text-xs tabular-nums", toneClass(u))}>
                    {formatPct(u)}
                    {" since last look"}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
export function Sparkline({ values, className, tone = "muted" }) {
  if (!values || values.length < 2) return null;
  let r = Math.min(...values),
    i = Math.max(...values) - r || 1,
    a = values
      .map((t, n) => {
        let a = (n / (values.length - 1)) * 72,
          o = 28 - ((t - r) / i) * 26 - 1;
        return `${n === 0 ? "M" : "L"}${a.toFixed(1)} ${o.toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg
      viewBox="0 0 72 28"
      className={cn(
        "h-7 w-16",
        tone === "gain" && "text-gain",
        tone === "loss" && "text-loss",
        tone === "muted" && "text-muted",
        className,
      )}
      aria-hidden={true}
    >
      <path d={a} fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
export function Tape({ quotes, lastMarks, onPick, onAdd }) {
  return (
    <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1">
      {quotes.map((e) => {
        let r = lastMarks?.[e.symbol],
          i = r && r > 0 ? ((e.price - r) / r) * 100 : null,
          a = isBigMove(e.changePct) || (i !== null && isBigMove(i));
        return (
          <button key={e.symbol}
            type="button"
            onClick={() => onPick(e.symbol)}
            className={cn(
              "relative min-w-40 shrink-0 overflow-hidden rounded-xl bg-surface px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
            )}
          >
            {a && (
              <span
                className={cn(
                  "absolute inset-y-0 left-0 w-1",
                  e.changePct >= 0 ? "bg-gain" : "bg-loss",
                )}
                aria-hidden={true}
              />
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium tracking-wide">
                {e.symbol}
              </span>
              <Sparkline
                values={e.spark}
                tone={e.changePct >= 0 ? "gain" : "loss"}
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="font-medium tabular-nums">
                {formatUsd(e.price)}
              </span>
              <span
                className={cn("text-xs tabular-nums", toneClass(e.changePct))}
              >
                {formatPct(e.changePct)}
              </span>
            </div>
          </button>
        );
      })}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex min-w-28 shrink-0 flex-col items-start justify-center gap-1.5 rounded-xl bg-surface px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
        >
          <Plus className="size-4 text-muted" />
          <span className="text-sm text-muted">Add ticker</span>
        </button>
      )}
      <div className="w-8 shrink-0" aria-hidden={true} />
    </div>
  );
}
export function BriefingCard({ briefing, onStay, onRun, grokReady }) {
  let i = formatAway(briefing.awayMs),
    a = briefing.held > 0 && briefing.navDelta !== 0;
  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">
          {"While you were out · "}
          {i}
        </p>
        {briefing.streak > 0 && (
          <p className="inline-flex items-center gap-1 text-xs text-muted">
            <Flame className="size-3.5 text-fg" aria-hidden={true} />
            {"Day "}
            {briefing.streak}
          </p>
        )}
      </div>
      {a ? (
        <p
          className={cn(
            "mt-3 font-display text-3xl leading-none font-medium tracking-tight tabular-nums",
            toneClass(briefing.navDelta),
          )}
        >
          {formatUsd(briefing.navDelta)}{" "}
          <span className="ml-1 text-lg text-muted">
            {formatPct(briefing.navPct)}
          </span>
        </p>
      ) : (
        <p className="mt-3 font-display text-2xl leading-tight font-medium tracking-tight">
          {briefing.held ? "NAV barely moved." : "Nothing on the book."}
        </p>
      )}
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg">
        {briefing.story}
      </p>
      {briefing.heat && (
        <p className="mt-2 text-sm text-loss">{briefing.heat}</p>
      )}
      {briefing.topMoves.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {briefing.topMoves.map((e) => {
            let t = e.sincePct ?? e.changePct;
            return (
              <li key={e.symbol} className="inline-flex h-9 items-center gap-2 rounded-full bg-surface-2 px-3 text-xs tabular-nums">
                <span className="font-medium tracking-wide">{e.symbol}</span>
                <span className={toneClass(t)}>{formatPct(t)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <SimulatedNotice className="mt-4" />
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        {grokReady && !briefing.cycledToday && (
          <Button className="min-h-11" onClick={onRun}>
            Run the open
          </Button>
        )}
        <Button variant="secondary" className="min-h-11" onClick={onStay}>
          Stay on the tape
        </Button>
      </div>
    </section>
  );
}
