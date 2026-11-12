// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Logo, ThemeToggle } from "@/components/brand";
import { LegalLinks } from "@/components/legal";
import { TipJarCompact } from "@/components/tip";
import { Link } from "@tanstack/react-router";

export function GuidePage() {
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
        Instructions
      </h1>
      <p className="mt-3 text-sm text-muted">
        How to run the desk. Read{" "}
        <Link to="/risk" className="text-fg underline-offset-4 hover:underline">
          use at your own risk
        </Link>{" "}
        first. This is paper trading only. Fills are simulated.
      </p>
      <ol className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-pretty text-muted">
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            1. Sign in
          </h2>
          <p className="mt-2">
            Google, X, or a username and password (at least 8 characters). The
            paper book, Pro, and Grok cycles follow that account. Sign in before
            you open the desk. Accept the risk notice on the start screen the
            first time.
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            2. Fund a paper book
          </h2>
          <p className="mt-2">
            Pick a starting size and open the desk. Free desks cap at $100k and
            the core names. Pro raises capital to $10M and lets you add any
            listed ticker or ETF from settings. Paper fills print at last quote
            — they are not a live market.
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            3. Run Grok
          </h2>
          <p className="mt-2">
            One cycle scans the tape, sizes tickets, and writes a thesis. Free
            desks get three cycles a day. Pro is unlimited. Auto is on the Run
            Grok control, on by default: Grok’s tickets fill immediately at last
            quote. Turn Auto off to review each ticket and tap Fill, or Fill
            all. Turning Auto back on fills anything still waiting. If a Sim
            tape badge is on, quotes are simulated. Open the desk each day to
            keep your streak. After a gap, a briefing shows what moved while you
            were out — that’s the reason to come back.
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            4. Manual tickets
          </h2>
          <p className="mt-2">
            Tap a name on the tape or holdings to buy or sell by hand, or open
            Research for recent news and a short note on why it moved. Manual
            fills print at last quote even when Auto is on.
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            5. Settings
          </h2>
          <p className="mt-2">
            The gear holds risk mandate, max tickets per cycle, theme (dark or
            light), which names Grok may ticket, custom tickers (Pro), and paper
            capital reset. Flatten and refund restores starting cash and clears
            the book. Auto lives on the Run Grok control, not in settings.
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            6. The ladder
          </h2>
          <p className="mt-2">
            Sign in, then open the ladder from the desk or the list icon.
            Posting is opt-in: a handle, win rate, paper return, and streak —
            not the book. Win-rate rank needs at least three closes. Share a
            card to X, Facebook, Threads, LinkedIn, Reddit, WhatsApp, or
            Telegram. Instagram and Snapchat don’t take a web post: save the
            card and paste the caption. The board is paper only.
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            7. Pro and Play
          </h2>
          <p className="mt-2">
            Upgrade on checkout when the ticket window is open. Google Play
            bills ${5}/mo or ${49}
            {
              " lifetime. Cancel monthly in Play subscriptions — this desk cannot cancel Play for you. Refunds follow Google’s policy. Existing Pro stays Pro even while checkout is parked. A promo invite still grants Pro. On a web preview without Play, a sandbox grant may unlock Pro so you can try the desk. That is not a charge."
            }
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            8. Promo invites
          </h2>
          <p className="mt-2">
            If you received a promo link, open it while signed in. It expires
            after 24 hours. Month grants lapse when they end. A promo is not a
            Play charge and not investment advice.
          </p>
        </li>
        <li>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg">
            9. If something is wrong
          </h2>
          <p className="mt-2">
            Flatten from settings, or leave the desk from the start screen. Play
            billing: use Google Play subscriptions and Play support. Read{" "}
            <Link
              to="/privacy"
              className="font-bold text-fg underline decoration-2 underline-offset-4"
            >
              Privacy
            </Link>{" "}
            for what we store.
          </p>
        </li>
      </ol>
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
