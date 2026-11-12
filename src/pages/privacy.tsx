// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { LegalLinks } from "@/components/legal";
import { TipJarCompact } from "@/components/tip";
import { Link } from "@tanstack/react-router";

export function PrivacyPage() {
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
      <h1 className="font-display text-[2rem] font-medium tracking-tight sm:text-4xl">
        Privacy
      </h1>
      <p className="mt-3 text-sm text-muted">Effective August 29, 2026</p>
      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            The desk
          </h2>
          <p className="mt-2">
            Phantastic Paper is a paper trading desk. Paper fills are simulated
            at last quote. It is not a broker, not a security, and not
            investment advice.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Account
          </h2>
          <p className="mt-2">
            Sign-in uses Google, X, or an email and password you create. We
            store your account id, display name, and email so the book and plan
            can follow you. Passwords are hashed. We do not sell accounts.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Payments
          </h2>
          <p className="mt-2">
            Pro is billed only through Google Play Billing (${5}/mo or ${49}
            {
              " lifetime). Google processes the charge. We store plan status, amount, interval, and a Play purchase token when Play sends one. We never collect card numbers, bank logins, or Venmo passwords."
            }
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Tips
          </h2>
          <p className="mt-2">
            The desk can open Venmo so you may optionally tip the maker. That
            payment happens in Venmo. We do not collect Venmo passwords, see the
            amount, or treat a tip as Pro.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Desk data
          </h2>
          <p className="mt-2">
            Paper positions, quotes, and settings can live on this device. Grok
            cycles send market context you ask the desk to run; usage is counted
            per day on Free.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Ladder
          </h2>
          <p className="mt-2">
            Posting to the ladder is opt-in. If you post, we store a handle you
            pick plus win rate, closed count, paper return, and streak so other
            signed-in desks can see the board. We do not post your email, the
            full book, or tickets. You can pull the row down at any time. Share
            cards are drawn on your device; posting them to X, Facebook,
            Instagram, Snapchat, or another app is your choice.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Running the desk
          </h2>
          <p className="mt-2">
            The account that runs this app can see aggregated activity:
            accounts, Pro status, Play charges, cycle counts, and event logs.
            That is for operating the product, not for advertising. Promo
            invites store the email or phone typed at send time, the grant type,
            and whether it was claimed. Those contacts are used only for that
            invite.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Children
          </h2>
          <p className="mt-2">
            The desk is not directed at children under 13. Do not create an
            account for a child.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Contact
          </h2>
          <p className="mt-2">
            Use the support email on the Google Play listing. You can delete
            your account by writing that address while signed in. Play
            subscriptions are canceled in Google Play.
          </p>
        </section>
      </div>
      <div className="mt-12 flex flex-col gap-3">
        <TipJarCompact />
        <LegalLinks />
        <Link to="/" className="text-sm text-muted hover:text-fg">
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
