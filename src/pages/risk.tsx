// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { LegalLinks } from "@/components/legal";
import { TipJarCompact } from "@/components/tip";
import { Link } from "@tanstack/react-router";

export function RiskPage() {
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
      <h1 className="font-display text-[2rem] font-medium tracking-tight text-balance sm:text-4xl">
        Use at your own risk
      </h1>
      <p className="mt-3 text-sm text-muted">
        Full notice. Opening, signing in, funding paper, or claiming a promo is
        acceptance. If you do not accept, leave the desk and do not trade.
      </p>
      <p className="mt-2 text-xs text-subtle">Last updated August 29, 2026</p>
      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-pretty text-muted">
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            No advice, no broker, no offer
          </h2>
          <p className="mt-2">
            Phantastic Paper is an educational paper-trading toy. It is not a
            broker-dealer, investment adviser, commodity trading advisor,
            municipal advisor, exchange, clearing firm, introducing broker,
            bank, credit union, money transmitter, or insurance company. Nothing
            here is an offer, solicitation, or recommendation to buy or sell any
            security, option, future, crypto, or other instrument. Nothing here
            is tax, legal, accounting, or investment advice. No fiduciary duty
            is created. No suitability, best-interest, or know-your-customer
            review is performed for you.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Paper fills are fake
          </h2>
          <p className="mt-2">
            Paper tickets fill at last quote, instantly, with no slippage, no
            spread, no halt, no reject, no locate, no borrow, and no market
            impact. That is not how a real book behaves. Simulated P&L is not a
            prediction of live-market results. A winning paper book does not
            mean you will make money in a real account. Past prints do not
            promise future prints. Do not size real risk off this tape.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Auto is still paper
          </h2>
          <p className="mt-2">
            Auto lets Grok fill its proposed tickets at last quote without a
            second click. Those fills are still simulated. Turn Auto off to
            review each ticket, then Fill or Fill all. Turning Auto on again
            prints anything still waiting. Manual tickets always print
            immediately. Auto does not place orders at a broker.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Grok is a language model
          </h2>
          <p className="mt-2">
            Grok cycles are generated text against a tape. They can be confident
            and wrong. They can invent numbers, ignore risk, miss news, or size
            tickets poorly. They are not a research report, not a rated
            recommendation, and not a signal you should follow.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Quotes, models, and uptime
          </h2>
          <p className="mt-2">
            Quotes, charts, and Grok output can be late, incomplete, wrong, or
            down. The desk may show a simulated tape when a live quote fails. A
            “Sim tape” badge means the numbers are not a live market. You must
            not rely on this product for timing, sizing, compliance, or
            reporting. We provide it “as is” and “as available,” with no
            warranty of merchantability, fitness for a particular purpose,
            title, non-infringement, accuracy, or uninterrupted service, to the
            fullest extent the law allows.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Third parties
          </h2>
          <p className="mt-2">
            Sign-in may use Google or X. Pro is billed only through Google Play.
            Optional tips open Venmo. Promo emails and texts open the sender’s
            own mail or messages app. Those companies have their own terms. We
            do not control their outages, charges, or account bans. A tip is not
            a Play charge and not investment advice. Promo grants are at the
            sender’s discretion, not a Play subscription. Claim links expire
            after 24 hours.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Your responsibility
          </h2>
          <p className="mt-2">
            You use this desk at your own risk. You are solely responsible for
            your accounts, your taxes, your compliance, and any trading you do
            elsewhere after looking at this screen. To the fullest extent the
            law allows, the makers of this desk are not liable for lost profits,
            lost data, trading losses, business interruption, or incidental,
            special, punitive, or consequential damages arising from use or
            inability to use the desk, even if told they might occur. If a court
            still finds liability, it is capped at the amount you paid for Pro
            in the prior three months (often zero for a promo).
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Indemnity
          </h2>
          <p className="mt-2">
            You will indemnify and hold harmless the makers of this desk from
            claims, losses, and reasonable costs (including legal fees) that
            arise from your use of the desk, your content, or your breach of
            this notice or of law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Eligibility
          </h2>
          <p className="mt-2">
            You must be old enough to form a contract where you live, and you
            must not use the desk if you are a child under 13 or if your local
            law forbids it. Pro is billed through Google Play. Play refunds and
            cancellations follow Google’s rules, not this desk.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            Changes
          </h2>
          <p className="mt-2">
            This notice can change. The dated copy on this page is the current
            one. Continued use after a change is acceptance of the new copy.
            Read{" "}
            <Link
              to="/guide"
              className="text-fg underline-offset-4 hover:underline"
            >
              instructions
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-fg underline-offset-4 hover:underline"
            >
              privacy
            </Link>{" "}
            with this notice. Together they describe the desk. They are not a
            prospectus.
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
