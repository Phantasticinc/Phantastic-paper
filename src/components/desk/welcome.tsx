// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { Disclaimer } from "@/components/legal";
import { ProBanner } from "@/components/pro";
import { TipJar } from "@/components/tip";
import { Button } from "@/components/ui/button";
import { CAPITAL_PRESETS, DEFAULT_CAPITAL, formatCapital } from "@/lib/capital";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Lock, Share2 } from "lucide-react";
import { Fragment, useState } from "react";

export function Welcome({
  onFund,
  onSeePlans,
  onShareDesk,
  ready = true,
  isPro = false,
  signedIn = false,
  riskAcked = false,
  streak = 0,
  proSales = false,
  onAckRisk,
  accountSlot,
}) {
  let [d, f] = useState(DEFAULT_CAPITAL),
    p = !isPro && d > 1e5,
    m = ready && (riskAcked || !signedIn);
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-36 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="truncate text-sm tracking-widest text-muted uppercase">
            Phantastic Paper
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {accountSlot}
          <ThemeToggle />
        </div>
      </div>
      <h1 className="font-display text-[2rem] leading-[1.15] font-medium tracking-tight text-fg sm:text-5xl">
        Grok flies the<span className="block italic">paper desk.</span>
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
        Set the size, pick the names, run a cycle. Grok tickets the book at last
        quote. Auto fills as it proposes. Turn it off to review first.
        {signedIn && streak > 1 ? (
          <Fragment>
            {" "}
            {"You’re on day "}
            {streak}. Don’t ghost the tape.
          </Fragment>
        ) : signedIn ? (
          <Fragment>
            {" Open it daily — the briefing is what moved while you were gone."}
          </Fragment>
        ) : null}
      </p>
      {!isPro && !proSales && <ProBanner className="mt-8" />}
      <div className="mt-8">
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">
          Paper capital
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CAPITAL_PRESETS.map((e) => {
            let t = !isPro && e > 1e5;
            return (
              <button
                type="button"
                onClick={() => f(e)}
                className={cn(
                  "inline-flex h-11 items-center gap-1.5 rounded-full px-3.5 text-sm tabular-nums transition-colors duration-150",
                  d === e
                    ? "bg-fg text-accent-fg"
                    : "bg-surface text-muted shadow-[var(--shadow-border)] hover:text-fg",
                )}
              >
                {t && <Lock className="size-3.5" />}
                {formatCapital(e)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {signedIn ? (
          <Button
            size="lg"
            onClick={() => onFund(d)}
            className="min-h-12"
            disabled={!m}
          >
            {p ? `Pro ${formatCapital(d)}` : `Open ${formatCapital(d)}`}
            {p ? (
              <Lock className="size-4" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </Button>
        ) : (
          <Button asChild={true} size="lg" className="min-h-12">
            <Link
              to="/login"
              search={{
                next: "/",
              }}
            >
              Sign in to open the desk
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
        {onShareDesk && (
          <Button
            variant="secondary"
            size="lg"
            className="min-h-12"
            onClick={onShareDesk}
          >
            <Share2 className="size-4" />
            Share the desk
          </Button>
        )}
      </div>
      {onSeePlans && (
        <button
          type="button"
          onClick={onSeePlans}
          className="mt-4 self-start text-sm text-muted transition-colors hover:text-fg"
        >
          {isPro
            ? "You’re on Pro."
            : proSales
              ? "Free desk · Pro from $5/mo"
              : "Free desk · Pro is on the way"}
        </button>
      )}
      {signedIn && (
        <div
          className="mt-6 flex max-w-md cursor-pointer items-start gap-3"
          onClick={() => onAckRisk?.()}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={riskAcked}
            aria-labelledby="risk-ack-label"
            className={cn(
              "mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-border",
              riskAcked && "border-fg bg-fg",
            )}
          >
            {riskAcked && <Check className="size-3 text-accent-fg" />}
          </button>
          <p id="risk-ack-label" className="text-xs leading-relaxed text-muted">
            I have read{" "}
            <Link
              to="/risk"
              className="text-fg underline-offset-4 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Use at your own risk
            </Link>
            . Paper fills are fake. I am solely responsible.
          </p>
        </div>
      )}
      <Disclaimer variant="welcome" className="mt-6" />
      <ul className="mt-10 grid gap-3 text-sm text-muted sm:grid-cols-3">
        <li className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="text-fg">Your book</p>
          <p className="mt-1 leading-relaxed">
            Market quotes, paper capital you set. Fills print at last quote.
          </p>
        </li>
        <li className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="text-fg">Grok trades</p>
          <p className="mt-1 leading-relaxed">
            One cycle: scan, size, write tickets. Auto fills them. Off waits.
          </p>
        </li>
        <li className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="text-fg">You ticket</p>
          <p className="mt-1 leading-relaxed">
            Tap a name to buy or sell by hand, or open Research on the move.
          </p>
        </li>
      </ul>
      {signedIn && (
        <p className="mt-6 text-sm leading-relaxed text-muted">
          <Link
            to="/ladder"
            className="text-fg underline-offset-4 hover:underline"
          >
            The ladder
          </Link>{" "}
          is opt-in. Post a win rate, climb it, share the card.
        </p>
      )}
      <TipJar className="mt-10" />
    </main>
  );
}
