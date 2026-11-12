// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { Disclaimer } from "@/components/legal";
import { ProBanner } from "@/components/pro";
import { Button } from "@/components/ui/button";
import { productIdFor } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/auth";
import { claimPurchase, fetchDeskFlags, fetchMyPlan } from "@/services/plan";
import { useBillingStore } from "@/store/billing";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Navigate,
  getRouteApi,
  useNavigate,
} from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

export function sourceLabel(e) {
  return e === "promo" ? "Promo" : "Play";
}
export function BillingStat({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-widest text-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-xl font-medium tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
export function BillingMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-widest text-subtle uppercase">{label}</p>
      <p className="mt-2 font-display text-xl font-medium tracking-tight tabular-nums sm:text-2xl">
        {value}
      </p>
    </div>
  );
}
export var PLAY_BILLING_URL = "https://play.google.com/billing";
export function hasPlayBilling() {
  return (
    typeof window < "u" && typeof window.getDigitalGoodsService == "function"
  );
}
export async function startPurchase(e) {
  let t = productIdFor(e);
  if (!hasPlayBilling())
    return {
      ok: true,
      token: null,
      sku: t,
      source: "sandbox",
    };
  try {
    let n = await window.getDigitalGoodsService(PLAY_BILLING_URL),
      r = (await n.getDetails([t]))[0];
    if (!r)
      return {
        ok: false,
        reason: "error",
        error: "That Play product isn’t listed yet. Add it in Play Console.",
      };
    let i = await new PaymentRequest(
        [
          {
            supportedMethods: PLAY_BILLING_URL,
            data: {
              sku: r.itemId,
            },
          },
        ],
        {
          total: {
            label: r.title,
            amount: {
              currency: r.price.currency,
              value: r.price.value,
            },
          },
        },
      ).show(),
      a = String(i.details?.purchaseToken ?? "");
    try {
      await n.acknowledge(a, e === "lifetime" ? "onetime" : "repeatable");
    } catch {}
    return (
      await i.complete(a ? "success" : "fail"),
      a
        ? {
            ok: true,
            token: a,
            sku: t,
            source: "play",
          }
        : {
            ok: false,
            reason: "error",
            error: "Play didn’t return a purchase token.",
          }
    );
  } catch (e) {
    return e instanceof DOMException &&
      (e.name === "AbortError" || e.name === "NotAllowedError")
      ? {
          ok: false,
          reason: "cancel",
        }
      : {
          ok: false,
          reason: "error",
          error: e instanceof Error ? e.message : "Play Billing failed.",
        };
  }
}
export function BillingPage() {
  let { user: e, isPending: t } = useAuth(),
    { interval: n } = getRouteApi("/billing").useSearch(),
    r = useNavigate(),
    [i, a] = useState(n),
    [o, s] = useState(false),
    c = useQuery({
      queryKey: ["my-plan"],
      queryFn: () => fetchMyPlan(),
      enabled: !!e,
    }),
    l =
      useQuery({
        queryKey: ["desk-flags"],
        queryFn: () => fetchDeskFlags(),
        enabled: !!e,
        staleTime: 0,
        refetchOnMount: "always",
      }).data?.proSales === true;
  if (t) return <div className="min-h-dvh bg-bg" />;
  if (!e)
    return (
      <Navigate
        to="/login"
        search={{
          next: "/billing",
        }}
      />
    );
  let u = c.data?.plan === "pro",
    d = i === "lifetime" ? "$49" : "$5/mo",
    f = hasPlayBilling();
  async function p() {
    s(true);
    try {
      let e = await startPurchase(i);
      if (!e.ok) {
        e.reason !== "cancel" &&
          toast.error(e.error ?? "Play Billing didn’t complete.");
        return;
      }
      let t = await claimPurchase({
        data: {
          interval: i,
          purchaseToken: e.token,
          sku: e.sku,
        },
      });
      if (!t.ok) {
        toast.error(t.error ?? "Play checkout failed. Try again.");
        return;
      }
      (useBillingStore.getState().unlock(i),
        toast("Pro desk unlocked", {
          description:
            e.source === "play"
              ? `Billed ${d} through Google Play.`
              : `Play sandbox granted ${d} on this account.`,
        }),
        await r({
          to: "/",
        }));
    } catch {
      toast.error("Play checkout failed. Try again.");
    } finally {
      s(false);
    }
  }
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-28 pt-6 sm:px-6 sm:pt-16">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="truncate text-sm tracking-widest text-muted uppercase">
            Google Play
          </span>
        </div>
        <ThemeToggle />
      </div>
      <h1 className="font-display text-[2rem] font-medium tracking-tight sm:text-4xl">
        The Pro desk
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Unlimited Grok, any ticker, capital to $10M. Auto fills Grok’s paper
        tickets. Subscriptions are billed only through Google Play.
      </p>
      {!l && <ProBanner className="mt-6" />}
      {u && (
        <p className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm text-fg shadow-[var(--shadow-border)]">
          This account is already Pro
          {c.data?.interval ? ` (${c.data.interval})` : ""}.
          {l
            ? " You can still renew below through Play."
            : " Checkout is parked; your grant stays."}
        </p>
      )}
      {l ? (
        <Fragment>
          <div className="mt-8 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => a("monthly")}
              className={cn(
                "h-11 rounded-lg text-sm tabular-nums transition-colors duration-150",
                i === "monthly"
                  ? "bg-fg text-accent-fg"
                  : "bg-surface-2 text-muted hover:text-fg",
              )}
            >
              ${5}/mo
            </button>
            <button
              type="button"
              onClick={() => a("lifetime")}
              className={cn(
                "h-11 rounded-lg text-sm tabular-nums transition-colors duration-150",
                i === "lifetime"
                  ? "bg-fg text-accent-fg"
                  : "bg-surface-2 text-muted hover:text-fg",
              )}
            >
              ${49}
              {" lifetime"}
            </button>
          </div>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-muted">
            {[
              "Unlimited Grok cycles",
              "Any listed ticker or ETF",
              "Paper capital up to $10M",
              "Auto on the Run Grok control",
            ].map((e) => (
              <li key={e} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-fg" />
                {e}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs leading-relaxed text-subtle">
            {f
              ? "Google Play will charge this Google account. Cancel monthly Pro in Play subscriptions."
              : "Play Billing opens inside the Play Store listing. On this preview, Play sandbox grants Pro on the signed-in account so you can try the desk."}
          </p>
          <Button
            className="mt-6 min-h-12 w-full"
            size="lg"
            disabled={o}
            onClick={() => void p()}
          >
            {o ? "Opening Play…" : `Subscribe with Google Play — ${d}`}
          </Button>
        </Fragment>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Play checkout is parked until the operator flips it on. Existing Pro
          stays Pro. Promo invites still grant Pro. The free desk is the whole
          circus until then.
        </p>
      )}
      <Disclaimer variant="billing" className="mt-3" />
      <Link to="/" className="mt-6 text-sm text-muted hover:text-fg">
        Back to the desk
      </Link>
    </main>
  );
}
