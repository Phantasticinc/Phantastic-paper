// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { AddTickerForm } from "@/components/desk/ticker";
import { LegalLinks } from "@/components/legal";
import { TipJarCompact } from "@/components/tip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { CAPITAL_PRESETS, formatCapital, parseCapital } from "@/lib/capital";
import { TROPHIES } from "@/lib/engagement";
import { formatUsd } from "@/lib/format";
import { RISK_PROFILES } from "@/lib/plans";
import { KNOWN_SYMBOLS, UNIVERSE } from "@/lib/universe";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Flame, Lock, Moon, Share2, Sun, X } from "lucide-react";
import { useState } from "react";

export function SettingsSheet({
  open,
  onOpenChange,
  risk,
  maxOrders,
  universe,
  customNames,
  onRisk,
  onMaxOrders,
  onToggle,
  onAddSymbol,
  onRemoveCustom,
  onReset,
  onLeave,
  theme,
  onTheme,
  initialCash,
  onCapital,
  isPro = false,
  onUpgrade,
  onRevert,
  onSignOut,
  streak = 0,
  bestStreak = 0,
  trophies = [],
  onShare,
  onLaunchShare,
  proSales = false,
}) {
  let D = Object.entries(RISK_PROFILES),
    [O, k] = useState(""),
    A = Object.keys(customNames).filter((e) => !KNOWN_SYMBOLS.has(e));
  function j() {
    if (!onCapital) return;
    let e = parseCapital(O);
    if (e) {
      if (!isPro && e > 1e5) {
        onUpgrade?.();
        return;
      }
      (onCapital(e), k(""));
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto pb-24">
        <SheetHeader>
          <SheetTitle>Desk settings</SheetTitle>
          <SheetDescription>
            Mandate for Grok. Caps are enforced on every fill, including manual
            tickets that breach cash. Auto lives on the Run Grok control.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-8 px-5 py-6">
          <section>
            <Label>Plan</Label>
            <p className="mt-2 text-sm text-fg">
              {isPro ? "Pro desk" : "Free desk"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              {isPro
                ? "Unlimited Grok, custom names, capital to $10M. Auto is on the Run Grok control. Billed through Google Play — cancel monthly in Play subscriptions."
                : proSales
                  ? "Market tape and paper fills. $100k cap, core names, 3 Grok cycles a day."
                  : "Market tape and paper fills. $100k cap, core names, 3 Grok cycles a day. Pro checkout is parked until Play is approved."}
            </p>
            {onUpgrade && !isPro && proSales && (
              <Button className="mt-3 w-full" onClick={onUpgrade}>
                Upgrade to Pro
              </Button>
            )}
            {isPro && onRevert && (
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={onRevert}
              >
                Revert to Free
              </Button>
            )}
          </section>
          <section>
            <Label>Desk days</Label>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-fg">
              <Flame className="size-4" aria-hidden={true} />
              {streak > 0 ? `Day ${streak}` : "No streak yet"}
              {bestStreak > streak ? (
                <span className="text-muted">
                  {"· best "}
                  {bestStreak}
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              Open the funded desk once a calendar day. Miss a day and it
              resets. Coming back after a gap shows what moved while you were
              out.
            </p>
            {trophies.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {trophies.map((e) => {
                  let t = TROPHIES[e];
                  return t ? (
                    <li className="rounded-lg bg-surface-2 px-3 py-2">
                      <p className="text-sm text-fg">{t.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{t.line}</p>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </section>
          <section>
            <Label>Tell the room</Label>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              One caption. X, Facebook, Threads, LinkedIn, Reddit, Hacker News,
              and the rest. Instagram and Snapchat save the card.
            </p>
            {onLaunchShare && (
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={onLaunchShare}
              >
                <Share2 />
                Share the desk
              </Button>
            )}
          </section>
          <section>
            <Label>Ladder</Label>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              Opt in to post a handle, win rate, paper return, and streak. Not
              the book. Share a card to X, Facebook, Instagram, Snapchat, and
              the rest.
            </p>
            <Button asChild={true} variant="secondary" className="mt-3 w-full">
              <Link to="/ladder">Open the ladder</Link>
            </Button>
            {onShare && (
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={onShare}
              >
                <Share2 />
                Share win rate
              </Button>
            )}
          </section>
          <section>
            <Label>Appearance</Label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onTheme("dark")}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-lg text-sm transition-[box-shadow,background-color] duration-150",
                  theme === "dark"
                    ? "bg-fg text-accent-fg"
                    : "bg-surface-2 text-muted hover:text-fg",
                )}
              >
                <Moon className="size-4" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => onTheme("light")}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-lg text-sm transition-[box-shadow,background-color] duration-150",
                  theme === "light"
                    ? "bg-fg text-accent-fg"
                    : "bg-surface-2 text-muted hover:text-fg",
                )}
              >
                <Sun className="size-4" />
                Light
              </button>
            </div>
          </section>
          {onCapital && initialCash !== undefined && (
            <section>
              <Label>Paper capital</Label>
              <p className="mt-1 text-xs leading-relaxed text-subtle">
                Changing capital flattens the book and starts a new session at{" "}
                {formatUsd(initialCash, {
                  whole: true,
                })}
                .
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CAPITAL_PRESETS.map((e) => {
                  let t = !isPro && e > 1e5;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (t) {
                          onUpgrade?.();
                          return;
                        }
                        onCapital(e);
                      }}
                      className={cn(
                        "inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm tabular-nums transition-colors duration-150",
                        initialCash === e
                          ? "bg-fg text-accent-fg"
                          : "bg-surface-2 text-muted hover:text-fg",
                      )}
                    >
                      {t && <Lock className="size-3.5" />}
                      {formatCapital(e)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={O}
                  inputMode="decimal"
                  placeholder="Custom — 75k or 250000"
                  className="tabular-nums"
                  onChange={(e) => k(e.target.value)}
                  onKeyDown={(e) => {
                    e.key === "Enter" && j();
                  }}
                />
                <Button
                  variant="secondary"
                  className="shrink-0"
                  disabled={!parseCapital(O)}
                  onClick={j}
                >
                  Set
                </Button>
              </div>
            </section>
          )}
          <section>
            <Label>Risk mandate</Label>
            <div className="mt-3 grid gap-2">
              {D.map(([e, t]) => (
                <button
                  type="button"
                  onClick={() => onRisk(e)}
                  className={cn(
                    "rounded-lg px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150",
                    risk === e
                      ? "bg-surface-2"
                      : "bg-transparent hover:bg-surface-2/60",
                  )}
                >
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {t.blurb}
                  </p>
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between">
              <Label>Tickets per cycle</Label>
              <span className="text-sm tabular-nums">{maxOrders}</span>
            </div>
            <Slider
              className="mt-2"
              min={1}
              max={6}
              step={1}
              value={[maxOrders]}
              onValueChange={(e) => onMaxOrders(e[0] ?? 4)}
            />
          </section>
          <section>
            <Label>Universe</Label>
            <p className="mt-1 text-xs text-subtle">
              Grok may only ticket names you leave on. Keep at least four.
              {isPro ? " Add any listed ticker." : " Custom tickers are Pro."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {UNIVERSE.map((e) => {
                let t = universe.includes(e.symbol);
                return (
                  <button
                    type="button"
                    onClick={() => onToggle(e.symbol)}
                    className={cn(
                      "h-11 rounded-full px-3 text-sm transition-colors duration-150",
                      t ? "bg-fg text-accent-fg" : "bg-surface-2 text-muted",
                    )}
                  >
                    {e.symbol}
                  </button>
                );
              })}
            </div>
            {A.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {A.map((e) => {
                  let t = universe.includes(e);
                  return (
                    <span
                      className={cn(
                        "inline-flex h-11 items-center rounded-full pl-3 text-sm",
                        t ? "bg-fg text-accent-fg" : "bg-surface-2 text-muted",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onToggle(e)}
                        className="pr-1"
                      >
                        {e}
                      </button>
                      {onRemoveCustom && (
                        <button
                          type="button"
                          aria-label={`Remove ${e}`}
                          className="grid size-11 place-items-center"
                          onClick={() => onRemoveCustom(e)}
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
            {onAddSymbol && isPro && (
              <div className="mt-4">
                <AddTickerForm existing={universe} onAdd={onAddSymbol} />
              </div>
            )}
            {onAddSymbol && !isPro && onUpgrade && (
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={onUpgrade}
              >
                <Lock className="size-4" />
                Add any ticker with Pro
              </Button>
            )}
          </section>
          <Separator />
          <section className="flex flex-col gap-3">
            {onLeave && (
              <Button
                variant="outline"
                onClick={() => {
                  (onLeave(), onOpenChange(false));
                }}
              >
                Back to start
              </Button>
            )}
            {onSignOut && (
              <Button
                variant="ghost"
                onClick={() => {
                  (onOpenChange(false), onSignOut());
                }}
              >
                Sign out
              </Button>
            )}
          </section>
          {onReset && (
            <section>
              <Label>Reset</Label>
              <p className="mt-1 mb-3 text-xs text-subtle">
                {"Flatten the book and restore "}
                {formatUsd(initialCash ?? 0, {
                  whole: true,
                })}
                {" cash. Quotes and mandate stay."}
              </p>
              <Button variant="outline" onClick={onReset}>
                Flatten and refund
              </Button>
            </section>
          )}
          <TipJarCompact className="pt-2" />
          <LegalLinks className="pt-2" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
