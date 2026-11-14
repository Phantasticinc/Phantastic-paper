import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Lesson } from "@/lib/content";
import { UNIVERSE } from "@/lib/universe";
import { formatUsd } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/** shares = floor((account x risk%) / (entry - stop)). Pure, so it is easy to test. */
export function sizePosition(args: {
  account: number;
  riskPct: number;
  entry: number;
  stop: number;
}) {
  const { account, riskPct, entry, stop } = args;
  const riskDollars = account * (riskPct / 100);
  const perShare = entry - stop;
  if (!(account > 0 && riskPct > 0 && entry > 0 && stop > 0) || perShare <= 0)
    return null;
  const raw = Math.floor(riskDollars / perShare);
  const affordable = Math.floor(account / entry);
  const shares = Math.min(raw, affordable);
  return {
    riskDollars,
    perShare,
    raw,
    shares,
    capped: raw > affordable,
    value: shares * entry,
    pctOfAccount: ((shares * entry) / account) * 100,
    actualRisk: shares * perShare,
  };
}

function Num({
  label,
  value,
  onChange,
  id,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
  suffix?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {suffix ? ` (${suffix})` : ""}
      </Label>
      <Input
        id={id}
        className="mt-2 tabular-nums"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
      />
    </div>
  );
}

export function PositionSizer({ lesson }: { lesson: Lesson }) {
  const [account, setAccount] = useState("100000");
  const [risk, setRisk] = useState("1");
  const [entry, setEntry] = useState("450");
  const [stop, setStop] = useState("427.5");
  const [symbol, setSymbol] = useState("MSFT");
  const r = useMemo(
    () =>
      sizePosition({
        account: Number(account),
        riskPct: Number(risk),
        entry: Number(entry),
        stop: Number(stop),
      }),
    [account, risk, entry, stop],
  );
  return (
    <div
      className="not-prose my-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5"
      data-testid="position-sizer"
    >
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">
        Position sizer
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Num id="ps-account" label="Account" suffix="$" value={account} onChange={setAccount} />
        <Num id="ps-risk" label="Risk per trade" suffix="%" value={risk} onChange={setRisk} />
        <Num id="ps-entry" label="Entry" suffix="$" value={entry} onChange={setEntry} />
        <Num id="ps-stop" label="Stop" suffix="$" value={stop} onChange={setStop} />
      </div>
      <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm" aria-live="polite">
        {r ? (
          <>
            <p className="text-fg">
              <span className="font-display text-2xl font-medium tabular-nums" data-testid="sizer-shares">
                {r.shares}
              </span>{" "}
              shares
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted tabular-nums">
              Risk {formatUsd(r.riskDollars)} / {formatUsd(r.perShare)} per share
              = {r.raw} shares. Position {formatUsd(r.value)} (
              {r.pctOfAccount.toFixed(1)}% of account). Planned loss at the stop:{" "}
              {formatUsd(r.actualRisk)}.
            </p>
            {r.capped && (
              <p className="mt-1 text-xs text-loss">
                The rule asks for more shares than your account can buy, so this
                is capped at what you can afford. A stop this tight is a warning
                sign. Consider a maximum position size too.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted">
            Enter an account, a risk percent, and a stop that is below your entry.
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="ps-symbol">Ticker for the desk</Label>
          <select
            id="ps-symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-2 h-11 rounded-md bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)]"
          >
            {UNIVERSE.map((u) => (
              <option key={u.symbol} value={u.symbol}>
                {u.symbol}
              </option>
            ))}
          </select>
        </div>
        {r && r.shares > 0 ? (
          <Button asChild={true} variant="secondary">
            <Link
              to="/"
              search={{ practice: lesson.id, ticket: symbol, shares: r.shares }}
            >
              Open {r.shares} {symbol} as a ticket
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" disabled={true}>
            Open as a ticket
          </Button>
        )}
      </div>
      <p className="mt-3 text-xs text-subtle">
        Illustration only, not a recommendation. Replace the example numbers with
        your own, including the live price on the desk.
      </p>
    </div>
  );
}

export const WIDGETS: Record<string, (p: { lesson: Lesson }) => React.ReactNode> = {
  "position-sizer": (p) => <PositionSizer {...p} />,
};
