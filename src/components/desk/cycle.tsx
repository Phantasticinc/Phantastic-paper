// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import { formatShares, formatUsd, timeAgo, toneClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export var SOURCE_LABELS = {
  grok: "Grok",
  manual: "Manual",
  stop: "Stop",
  target: "Target",
};
export function TradeList({ trades, emptyHint }) {
  return (
    <Card>
      <CardLabel>Fills</CardLabel>
      {trades.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted">
          {emptyHint ??
            "No tickets yet. The blotter fills as Grok and standing exits print."}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {trades.slice(0, 24).map((e) => (
            <li key={e.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      e.side === "buy" ? "text-gain" : "text-loss",
                    )}
                  >
                    {e.side === "buy" ? "Bought" : "Sold"}
                  </span>{" "}
                  <span className="font-medium">{e.symbol}</span>{" "}
                  <span className="text-muted tabular-nums">
                    {formatShares(e.shares)}
                    {" @ "}
                    {formatUsd(e.price)}
                  </span>
                </p>
                <span className="shrink-0 text-xs text-subtle tabular-nums">
                  {timeAgo(e.ts)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {e.thesis}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-subtle">
                <span>{SOURCE_LABELS[e.source]}</span>
                {e.side === "sell" && e.source !== "manual" && (
                  <span className={cn("tabular-nums", toneClass(e.realized))}>
                    {e.realized >= 0 ? "+" : ""}
                    {formatUsd(e.realized)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
export var STANCE_LABELS = {
  "risk-on": "Risk on",
  neutral: "Neutral",
  "risk-off": "Risk off",
};
export function CycleCard({
  cycle,
  phase,
  autonomy = false,
  cycledToday = false,
  onFill,
  onFillAll,
}) {
  let o = phase !== "idle",
    s =
      phase === "tape"
        ? "Reading the tape…"
        : phase === "grok"
          ? "Grok is writing tickets…"
          : phase === "fill"
            ? autonomy
              ? "Filling the book…"
              : "Ready to fill…"
            : null,
    c = cycle?.orders ?? [],
    l = !!onFill && c.length > 0 && !autonomy;
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <CardLabel>{l ? "Proposals" : "Last cycle"}</CardLabel>
        <div className="mb-3 flex items-center gap-2">
          {l && onFillAll && c.length > 1 && (
            <Button size="sm" variant="secondary" onClick={onFillAll}>
              Fill all
            </Button>
          )}
          {cycle && !o && (
            <Badge
              variant={
                cycle.stance === "risk-off"
                  ? "loss"
                  : cycle.stance === "risk-on"
                    ? "gain"
                    : "default"
              }
            >
              {STANCE_LABELS[cycle.stance]}
            </Badge>
          )}
        </div>
      </div>
      {o ? (
        <div className="flex items-center gap-3 text-sm text-muted">
          <LoaderCircle className="size-4 animate-spin text-fg" />
          <span>{s}</span>
        </div>
      ) : cycle ? (
        <div>
          <p className="text-sm leading-relaxed text-fg">{cycle.outlook}</p>
          {l ? (
            <ul className="mt-3 flex flex-col gap-2">
              {c.map((e, t) => (
                <li key={`${e.symbol}-${e.side}-${t}`} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span
                        className={cn(
                          e.side === "buy" ? "text-gain" : "text-loss",
                        )}
                      >
                        {e.side === "buy" ? "Buy" : "Sell"}
                      </span>{" "}
                      {e.symbol}{" "}
                      <span className="text-muted tabular-nums">
                        {formatShares(e.shares)}
                        {" sh"}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-subtle">
                      {e.thesis}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="min-h-11 shrink-0 sm:min-h-9"
                    onClick={() => onFill?.(e)}
                  >
                    Fill
                  </Button>
                </li>
              ))}
            </ul>
          ) : cycle.fills.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Sat on hands. No fills this pass.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              {cycle.fills.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    <span
                      className={cn(
                        e.side === "buy" ? "text-gain" : "text-loss",
                      )}
                    >
                      {e.side === "buy" ? "Buy" : "Sell"}
                    </span>{" "}
                    {e.symbol}
                  </span>
                  <span className="text-muted tabular-nums">
                    {e.shares}
                    {" sh"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {cycle.fills.length > 0 && l && (
            <p className="mt-3 text-xs text-subtle">
              {cycle.fills.length}
              {" filled this cycle."}
            </p>
          )}
          {cycle.skipped.length > 0 && (
            <p className="mt-3 text-xs text-subtle">
              {cycle.skipped.join(" · ")}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          {cycledToday
            ? autonomy
              ? "Today’s cycle is on the book. Come back after the tape moves."
              : "Today’s cycle is in. Tickets wait until you fill them — or turn Auto on."
            : autonomy
              ? "Run Grok to scan the tape. Auto fills paper tickets at last quote as they land."
              : "Run Grok to scan the tape. Tickets wait here until you fill them — or turn Auto on."}
        </p>
      )}
    </Card>
  );
}
