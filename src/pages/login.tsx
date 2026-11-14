// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { Disclaimer, footerLinkClass } from "@/components/legal";
import { LEGAL } from "@/lib/legal-config";
import { TipJarCompact } from "@/components/tip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SIGN_IN_PROVIDERS,
  localAuth,
  signInWithProvider,
} from "@/services/auth";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function toLoginEmail(e) {
  let t = e.trim();
  if (t.includes("@")) return t.toLowerCase();
  let n = t.toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return n ? `${n}@phantastic.paper` : "";
}
export function LoginPage() {
  const navigate = useNavigate();
  let { next: e } = getRouteApi("/login").useSearch(),
    [t, n] = useState("in"),
    [r, i] = useState(""),
    [a, o] = useState(""),
    [s, c] = useState(false),
    [l, u] = useState(null),
    [ack, setAck] = useState(false);
  async function d(t) {
    u(null);
    try {
      await signInWithProvider(t, {
        callbackURL: e,
        errorCallbackURL: "/login",
      });
    } catch (e) {
      u(e instanceof Error ? e.message : "Sign-in failed.");
    }
  }
  async function f(n) {
    n.preventDefault();
    let i = toLoginEmail(r);
    if (!i || a.length < 8) {
      u("Use a username or email, and a password of at least 8 characters.");
      return;
    }
    if (t === "up" && !ack) {
      u(
        `Confirm that you are ${LEGAL.minAge} or older and accept the Terms to create an account.`,
      );
      return;
    }
    (c(true), u(null));
    try {
      if (t === "up") {
        let { error: e } = await localAuth.signUp({
          email: i,
          password: a,
          name: r.trim() || i.split("@")[0],
          acknowledged: ack,
        });
        if (e) throw Error(e.message ?? "Could not create that account.");
      } else {
        let { error: e } = await localAuth.signIn({
          email: i,
          password: a,
        });
        if (e) throw Error(e.message ?? "Those credentials did not match.");
      }
      navigate({ to: e });
    } catch (e) {
      (u(e instanceof Error ? e.message : "Sign-in failed."), c(false));
    }
  }
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-28 pt-6 sm:px-6 sm:pt-16">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="truncate text-sm tracking-widest text-muted uppercase">
            Phantastic Paper
          </span>
        </div>
        <ThemeToggle />
      </div>
      <h1 className="font-display text-[2rem] font-medium tracking-tight sm:text-4xl">
        Sign in to the desk
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Google, X, or a username and password. The book follows this account.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        {SIGN_IN_PROVIDERS.map((e) => (
          <Button key={e.providerId}
            type="button"
            variant="secondary"
            className="min-h-12 w-full"
            onClick={() => void d(e.providerId)}
          >
            {"Continue with "}
            {e.label}
          </Button>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3 text-xs tracking-widest text-subtle uppercase">
        <span className="h-px flex-1 bg-border" />
        or password
        <span className="h-px flex-1 bg-border" />
      </div>
      <form className="mt-6 flex flex-col gap-4" onSubmit={f}>
        <div>
          <Label htmlFor="user">Username or email</Label>
          <Input
            id="user"
            autoComplete="username"
            className="mt-2"
            value={r}
            onChange={(e) => i(e.target.value)}
            placeholder="huy or you@shop"
          />
        </div>
        <div>
          <Label htmlFor="pass">Password</Label>
          <Input
            id="pass"
            type="password"
            autoComplete={t === "up" ? "new-password" : "current-password"}
            className="mt-2"
            value={a}
            onChange={(e) => o(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        {t === "up" && (
          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"
              data-testid="age-ack"
            />
            <span>
              {`I am ${LEGAL.minAge} or older. I have read and accept the `}
              <Link to="/terms" className={footerLinkClass}>
                Terms of Use
              </Link>
              {" and "}
              <Link to="/privacy" className={footerLinkClass}>
                Privacy
              </Link>
              .
            </span>
          </label>
        )}
        {l && <p className="text-sm text-loss">{l}</p>}
        <Button type="submit" className="min-h-12" disabled={s || false}>
          {s ? "Working…" : t === "up" ? "Create account" : "Sign in"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 self-start text-sm text-muted hover:text-fg"
        onClick={() => {
          (n(t === "up" ? "in" : "up"), u(null));
        }}
      >
        {t === "up"
          ? "Already have an account? Sign in"
          : "New here? Create an account"}
      </button>
      <Disclaimer variant="login" className="mt-8" />
      <TipJarCompact className="mt-6" />
      <Link to="/" className="mt-6 text-sm text-subtle hover:text-fg">
        Back to the desk
      </Link>
    </main>
  );
}
