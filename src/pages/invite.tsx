// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { Disclaimer } from "@/components/legal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/services/auth";
import { claimInvite } from "@/services/plan";
import { useBillingStore } from "@/store/billing";
import {
  Link,
  Navigate,
  getRouteApi,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function InvitePage() {
  let { user: e, isPending: t } = useAuth(),
    { code: n } = getRouteApi("/invite").useSearch(),
    r = useNavigate(),
    [i, a] = useState(null),
    [o, s] = useState(false),
    [c, l] = useState(null);
  return (
    useEffect(() => {
      if (!e || !n || c) return;
      let t = false;
      return (
        s(true),
        claimInvite({
          data: {
            code: n,
          },
        })
          .then((e) => {
            if (t) return;
            if (!e.ok) {
              a(e.error);
              return;
            }
            let n = e.interval;
            (useBillingStore.getState().unlock(n),
              l(
                e.already
                  ? "This account is already Pro."
                  : `Pro unlocked — ${e.label}.`,
              ));
          })
          .catch(() => {
            t || a("Could not claim that invite.");
          })
          .finally(() => {
            t || s(false);
          }),
        () => {
          t = true;
        }
      );
    }, [e, n, c]),
    t ? (
      <div className="min-h-dvh bg-bg" />
    ) : e ? (
      <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-28 pt-6 sm:px-6 sm:pt-16">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <span className="truncate text-sm tracking-widest text-muted uppercase">
              Invite
            </span>
          </div>
          <ThemeToggle />
        </div>
        <h1 className="font-display text-[2rem] font-medium tracking-tight sm:text-4xl">
          Claim Pro
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Promo grant on this account. Claim within 24 hours. Paper trading
          only. Not a broker. Not investment advice.{" "}
          <Link
            to="/risk"
            className="text-fg underline-offset-4 hover:underline"
          >
            Use at your own risk
          </Link>
          .
        </p>
        {!n && (
          <p className="mt-6 text-sm text-loss">
            This invite link is missing a code.
          </p>
        )}
        {o && <p className="mt-6 text-sm text-muted">Claiming…</p>}
        {c && <p className="mt-6 text-sm text-fg">{c}</p>}
        {i && <p className="mt-6 text-sm text-loss">{i}</p>}
        {c && (
          <Button
            className="mt-6 min-h-12"
            onClick={() =>
              void r({
                to: "/",
              })
            }
          >
            Open the desk
          </Button>
        )}
        <Disclaimer variant="welcome" className="mt-8" />
        <Link to="/" className="mt-4 text-sm text-muted hover:text-fg">
          Back to the desk
        </Link>
      </main>
    ) : (
      <Navigate
        to="/login"
        search={{
          next: n ? `/invite?code=${encodeURIComponent(n)}` : "/invite",
        }}
      />
    )
  );
}
