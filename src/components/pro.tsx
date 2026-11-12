// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Disclaimer } from "@/components/legal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UPSELL_COPY } from "@/lib/plans";
import { asset, cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Fragment, useState } from "react";

export function ProBanner({ variant = "hero", className }) {
  let n =
    variant === "banner"
      ? "The free desk is the whole circus until Pro checkout opens."
      : "The free desk is the whole circus until Pro checkout opens. Print fake P&L and tell us what feels sticky.";
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
        variant === "hero" && "sm:grid sm:grid-cols-5",
        variant === "banner" && "flex items-stretch gap-3",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-surface-2",
          variant === "hero" &&
            "aspect-[4/3] sm:col-span-2 sm:aspect-auto sm:min-h-56",
          variant === "banner" && "hidden w-28 shrink-0 sm:block",
        )}
      >
        <img
          src={asset("pro-coming.jpg")}
          alt=""
          className="size-full object-cover"
        />
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-col justify-center",
          variant === "hero" && "p-4 sm:col-span-3 sm:p-6",
          variant === "banner" && "px-4 py-3",
        )}
      >
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">
          Ticket window
        </p>
        <h2
          className={cn(
            "font-display font-medium tracking-tight text-fg",
            variant === "hero"
              ? "mt-2 text-2xl italic sm:text-3xl"
              : "mt-1 text-lg italic",
          )}
        >
          Pro is on the way
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{n}</p>
      </div>
    </section>
  );
}
export var FREE_FEATURES = [
  "Market tape and paper fills",
  "Auto on the Run Grok control",
  "Capital up to $100k",
  "Core names · 3 Grok cycles a day",
];
export var PRO_FEATURES = [
  "Unlimited Grok cycles",
  "Any listed ticker or ETF",
  "Paper capital up to $10M",
  "Same Auto — more room to run it",
];
export function PlansDialog({
  open,
  reason = "plans",
  onOpenChange,
  onUnlocked,
  proSales = false,
}) {
  let [a, o] = useState("lifetime"),
    s = useNavigate(),
    c = UPSELL_COPY[reason] ?? UPSELL_COPY.plans,
    l = a === "lifetime" ? "$49" : "$5/mo";
  function u() {
    (onOpenChange(false),
      s({
        to: "/billing",
        search: {
          interval: a,
        },
      }));
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{c.title}</DialogTitle>
          <DialogDescription>{c.blurb}</DialogDescription>
        </DialogHeader>
        {!proSales && <ProBanner variant="banner" />}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-xs font-medium tracking-widest text-subtle uppercase">
              Free
            </p>
            <p className="mt-2 font-display text-2xl font-medium tracking-tight">
              $0
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              {FREE_FEATURES.map((e) => (
                <li key={e} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-subtle" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-fg p-4 text-accent-fg">
            <p className="text-xs font-medium tracking-widest uppercase opacity-70">
              Pro
            </p>
            <p className="mt-2 font-display text-2xl font-medium tracking-tight">
              {l}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm opacity-80">
              {PRO_FEATURES.map((e) => (
                <li key={e} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {proSales ? (
          <Fragment>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => o("monthly")}
                className={cn(
                  "h-11 rounded-lg text-sm tabular-nums transition-colors duration-150",
                  a === "monthly"
                    ? "bg-fg text-accent-fg"
                    : "bg-surface-2 text-muted hover:text-fg",
                )}
              >
                ${5}/mo
              </button>
              <button
                type="button"
                onClick={() => o("lifetime")}
                className={cn(
                  "h-11 rounded-lg text-sm tabular-nums transition-colors duration-150",
                  a === "lifetime"
                    ? "bg-fg text-accent-fg"
                    : "bg-surface-2 text-muted hover:text-fg",
                )}
              >
                ${49}
                {" lifetime"}
              </button>
            </div>
            <p className="mt-2 text-xs text-subtle">
              {a === "lifetime"
                ? "Pay once — about ten months of the monthly desk."
                : "Month to month. Cancel in Google Play subscriptions."}
            </p>
            <Button className="mt-4 w-full min-h-12" size="lg" onClick={u}>
              {"Continue with Google Play — "}
              {l}
            </Button>
          </Fragment>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Play checkout is parked until the operator flips it on. Existing Pro
            stays Pro, and a promo invite still grants it. The free desk is open
            — print fake P&L and tell us what feels sticky.
          </p>
        )}
        <Disclaimer variant="billing" className="mt-3" />
      </DialogContent>
    </Dialog>
  );
}
