# Backend plan: replacing the stand-ins with free-tier services

_Written 2026-11-13. Nothing here has been set up and nobody has signed up for anything. Every figure below comes from the provider page named next to it, checked on 2026-11-13. Anything marked **verify** could not be read from an official page that day, so confirm it before relying on it. Prices and free tiers change._

## The one architectural rule

GitHub Pages serves static files only. **Anything shipped in the JavaScript bundle is public**, including any `VITE_*` variable. So:

- API keys for quotes or AI **must never** go in the front end. They live in a tiny server-side proxy (a "function") that the app calls.
- Auth uses a hosted identity service that is designed to be called from the browser with a public "anon" key, protected by database rules (row-level security).
- The seams already exist, so the UI doesn't change: `src/services/{auth,quotes,cycle,research,ladder,plan,progress}.ts` each export a provider interface and a `set…Provider()` setter. A backend is a new implementation of one interface, wired in `main.tsx`.

```
Browser (GitHub Pages)  ──►  Auth + Postgres (Supabase)         identity, progress, ladder, plan flags
                        ──►  Edge function / Worker (secrets)    quotes cache, AI cycle, AI research
```

## Recommended stack

**Supabase (free) for auth + data + functions, plus one free scheduled job for quotes.** One account covers three of the four needs. Firebase is a viable alternative for auth and data, but its Spark (no-cost) plan has **no Cloud Functions** (the pricing page lists them as "Not applicable" for Spark, available only on the pay-as-you-go Blaze plan, which needs a card on file). Any key-holding proxy on Firebase therefore means Blaze, so it is the worse fit for "free only".

## 1. Real auth and shared data

| | |
| --- | --- |
| Replaces | `services/auth.ts` (local salted-hash profile), `services/progress.ts` local store, `services/plan.ts` flags |
| Option A, **recommended** | Supabase Auth + Postgres. Free plan per https://supabase.com/pricing: 50,000 monthly active users, 500 MB database, 5 GB egress, unlimited API requests, 2 active projects. Edge Functions are included in every project (their per-call limits: **verify**). |
| Option B | Firebase Auth + Firestore. Spark: 50K MAU on Identity Platform, 1 GiB stored, 50K reads / 20K writes per day (https://firebase.google.com/pricing). |
| Catch 1 | **Supabase free projects are paused after 1 week of inactivity** (same pricing page). A quiet site would go down. Fix: a free scheduled ping (GitHub Actions cron hitting a table), or accept pause/unpause. Paid plans don't pause (Pro starts at $25/month, not needed now). |
| Catch 2 | Google sign-in needs an OAuth client from a Google Cloud project; X sign-in needs an X developer app. Both are free but are Huy's accounts. Email and password works with no extra account. |
| Catch 3 | The old Grok-identity users can't be migrated. Anyone with a desk saved on phantastic.net keeps it in their browser; once real sign-in exists, offer "attach this local desk to my account" (upload the persisted book). |

Tables (sketch): `profiles(id, handle unique, created_at)`, `lesson_progress(user_id, lesson_id, completed_at, quiz_best, quiz_last, attempts, last_viewed_at, practice_done_at)`, `books(user_id, json, updated_at)` (optional desk sync), `ladder_posts(...)` (below). Row-level security: users read and write only their own rows.

**What Huy provides:** (1) a Supabase account (free, email or GitHub login); (2) a new project, with its URL and `anon` key (public by design, safe in the bundle); (3) optionally a Google Cloud OAuth client and an X developer app for the social buttons; (4) a decision on a privacy policy update, because real emails get stored.

**Build:** implement `ProgressStore` against `lesson_progress` (the interface already has `subscribe`), then `AuthProvider`. About 1 to 2 days.

## 2. Live quotes

| | |
| --- | --- |
| Replaces | `services/quotes.ts` simulated tape ("Sim tape" badge disappears when `source: "live"`) |
| Pattern | **Never call the data vendor from the browser.** One scheduled function fetches the ~22 universe symbols every minute during market hours, writes them to a cache (a Supabase table or Workers KV), and every visitor reads the cache. Vendor limits then don't scale with users, and the key stays secret. |
| Finnhub free | Reported as 60 calls/minute with real-time US stock quotes, for personal, non-professional use. **Verify**: finnhub.io/pricing did not render its limits when fetched; the figure is from third-party docs. 22 symbols per minute fits. `/stock/candle` (history) is reported as paid-only, so build sparklines from the cache, not the vendor. |
| Twelve Data Basic | Free: 8 requests/minute and 800 a day, real-time US equities and ETFs, but **"internal non-display usage"**, so it likely cannot be shown on a public site (https://twelvedata.com/pricing). Paid Grow is $79/month on that page (its structured data says $29, **verify**). |
| Alpha Vantage | Free: 25 requests/day (https://www.alphavantage.co/premium/). Too small for a live tape. |
| Licensing catch | Free "personal use" terms often forbid redistributing quotes on a public product. Before launch, read the chosen vendor's terms for public display. If display is not allowed, either delay quotes per the vendor's rules or pay for a display license. This could be the first real cost. |
| Scheduler | Cloudflare Workers Free: 100,000 requests/day, 10 ms CPU per invocation (https://developers.cloudflare.com/workers/platform/pricing/); cron-trigger availability on Free: **verify**. Alternative: Supabase scheduled functions (**verify**), or a GitHub Actions cron writing a static `quotes.json` (free, simplest, ~5 min granularity; GitHub's cron isn't exact). |

**What Huy provides:** a free Finnhub API key (account needed) and a decision on delayed vs real-time data; a Cloudflare account (free) if we use Workers; sign-off after the vendor-terms check.

**Build:** a `QuoteProvider` that reads the cache URL; the scheduler; error fallback to the simulated tape. About 1 day.

## 3. AI cycle and research (this one costs money)

| | |
| --- | --- |
| Replaces | `services/cycle.ts` (local rules autopilot), `services/research.ts` ("not connected") |
| Cost | Pay-per-token. From https://docs.x.ai/developers/models (checked 2026-11-13): `grok-4.3` is $1.25 per million input tokens and $2.50 per million output tokens (cheaper cached input). Rough estimate for one cycle, about 3,000 tokens in and 1,000 out: **about $0.006 per cycle**, so 1,000 cycles/day is about $6/day. Web or X search tool calls are billed separately (**verify**). The existing free-tier cap is 3 cycles a day per user, which bounds spend. |
| Free alternative | Google's Gemini API has a free tier, but ai.google.dev/gemini-api/docs/pricing timed out when fetched, so its limits are **verify**. Free tiers often log prompts and have tight rate limits. Or keep the rules engine and ship research as curated lessons. |
| Guardrails | The function must check the signed-in user, enforce the daily cap server-side (not in the browser), force a strict JSON output (`orders[]`: symbol, side, shares, thesis), validate against the universe and the risk profile before returning, and keep "paper only, not advice" in the prompt and the UI. Set a hard monthly spend cap in the provider console. |
| Sequencing | Do this **after** real auth. Without server-side identity there is nothing to stop anonymous bots from spending Huy's money. |

**What Huy provides:** an API key from the chosen provider (new account and a payment method for xAI; or a Google AI Studio key for Gemini free), a monthly budget he's comfortable with (a $5 to $20 cap is plenty to start), and approval of the prompt wording.

**Build:** a `CycleProvider` and a `ResearchProvider` that call the function. About 2 days.

## 4. The shared ladder

| | |
| --- | --- |
| Replaces | `services/ladder.ts` (local board in localStorage) |
| Design | A `ladder_posts` table: `user_id`, `handle` (unique, validated server-side), `win_rate`, `return_pct`, `streak`, `closes`, `updated_at`. Anyone can read; only the owner can insert or update their row (row-level security). Win-rate rank still needs at least 3 closes, as on the live site. |
| Honesty catch | Numbers computed in the browser can be faked by anyone with devtools. Options: (a) accept it as a toy board, like the original; (b) have a function recompute stats from a synced trade log, which is more work but credible. Start with (a) and label it. |
| Abuse | Handle moderation (profanity list, reserved names), per-user write rate limit, a "remove my row" action (already in the UI). |
| Free-tier fit | A few thousand rows is tiny against 500 MB. |

**What Huy provides:** nothing beyond the Supabase project from section 1, plus a call on moderation rules.

**Build:** a `LadderProvider` implementation plus the table and policies. About half a day once Supabase exists.

## Suggested order and total ask

1. **Supabase project** (auth, progress, ladder): Huy creates one free account and project and sends the URL and anon key. Unlocks real accounts, cross-device progress and the shared ladder.
2. **Quotes cache**: a free market-data key, plus a vendor-terms decision.
3. **AI cycle and research**: only when Huy accepts a monthly spend cap.

Everything stays free through step 2, apart from the possible data-display license. Step 3 is the only recurring cost.

## Security checklist before any of this goes live

- No secret in the repo or the bundle. Secrets live only in the function platform's secret store.
- Restrict CORS on every function to `https://phantastic.net` and `https://phantasticinc.github.io`.
- Row-level security on every table, tested with a second user.
- A privacy page update once emails, handles or progress are stored server-side (the live `/privacy` currently describes browser-only storage).
- Keep `/risk` and the "paper only" notices exactly as they are.
