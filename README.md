# Phantastic Paper

An educational **paper-trading desk** — fake money, last-quote fills, no broker, no real brokerage connection of any kind.
This repo is a from-scratch, self-owned rebuild of the app that was built in Grok App Builder and served at
<https://phantastic.net>. It replaces the Grok-hosted build with plain Vite + React + TypeScript source that can be hosted anywhere static.

> **Preview:** <https://phantasticinc.github.io/Phantastic-paper/> (GitHub Pages, deployed by `.github/workflows/pages.yml`).
> **DNS for phantastic.net has not been changed.** See [docs/CUTOVER.md](docs/CUTOVER.md).

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 (same design tokens as the original) · TanStack Router (file-based) ·
TanStack Query · Zustand (persisted) · Radix primitives · Recharts · Sonner toasts.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173/
npm run typecheck
npm run check:content   # validate lessons/quizzes
npm run build        # → dist/  (also writes dist/404.html SPA fallback + .nojekyll)
npm run preview      # serves dist/ on :4173
```

### Base path

The app is served from `import.meta.env.BASE_URL` and the router uses the same value as its `basepath`.

| Where | `VITE_BASE` |
| --- | --- |
| Local dev, phantastic.net (after cutover) | `/` (default) |
| GitHub Pages project preview | `/Phantastic-paper/` (the workflow's default) |

```bash
VITE_BASE=/Phantastic-paper/ npm run build
```

## Deploy

`.github/workflows/pages.yml` builds on every push to `main` and deploys to GitHub Pages
(Settings → Pages → Source: **GitHub Actions**). The workflow reads two optional repo **variables**:
`PAGES_BASE` (default `/Phantastic-paper/`) and `PAGES_CNAME` (writes `dist/CNAME`). The `postbuild` script copies
`index.html` to `404.html` so deep links (`/guide`, `/ladder`, …) work on Pages. Any other static host works the same way:
upload `dist/` and rewrite unknown paths to `index.html`.

## Layout

```
src/
  routes/            File-based routes (TanStack Router). One file = one URL.
    __root.tsx         root layout
    index.tsx          /          the desk (signed out: welcome; signed in: desk)
    guide|risk|privacy|ladder|login|billing|invite|admin.tsx
    learn.index.tsx, learn.$course.index.tsx, learn.$course.$slug.tsx     /learn hub, course, lesson
  pages/             Page bodies for the content routes (recovered from the original)
  components/        brand, legal, Pro dialogs, AccountMenu, PageShell (layout.tsx)
    ui/                shadcn-style primitives (Button, Dialog, Sheet, Tabs, …)
    desk/              the trading desk UI (welcome, dashboard, ticket, settings, share…)
  lib/               PURE domain logic, fully typed: book.ts (fills, sizing, stops, NAV), ladder.ts, engagement.ts
                     (streaks, briefing, trophies), capital.ts, plans.ts, format.ts, shareCard.ts, content.ts
  store/             desk.ts (the paper book — localStorage `phantastic-paper-v1`), billing.ts (`phantastic-billing-v1`)
  services/          ADAPTERS for everything that used to be server-side (see below)
  content/courses/   Markdown courses and lessons (see Learn)
```

Persisted keys match the original app (`phantastic-paper-v1` v3, `phantastic-billing-v1`, `phantastic-theme`), so a
desk saved on phantastic.net keeps working after cutover (same origin).

## What was recovered, and what could not be

The compiled client bundle gave us all UI, copy, domain maths and persistence. The Grok-hosted **server functions**
(quotes, Grok cycle, research, ladder board, billing/invite checks, auth) only exist on Grok's side — only opaque hashes ship
to the browser. Each one is replaced by a small adapter in `src/services/` with a local implementation:

| Original (server) | This build (`src/services/`) | Gap |
| --- | --- | --- |
| Live quotes ("Last quotes print from the live tape") | `quotes.ts` — **simulated tape**: deterministic, seeded from fixed reference prices; UI shows the original "Sim tape" badge | Prices are not real. Implement `QuoteProvider` + `setQuoteProvider()` to use a real feed (keep keys server-side). |
| "Run Grok" cycle (LLM proposes tickets) | `cycle.ts` — **rules autopilot** (momentum on the tape, sized by the risk profile, stops/targets); labelled "Local rules autopilot (Grok not connected)" in its outlook | Not an LLM. Implement `CycleProvider`. Fill/sizing/stop engine is the original's. |
| Ticker research (AI take + news) | `research.ts` — returns "not connected" | Needs a news/LLM backend. |
| Ladder (shared leaderboard) | `ladder.ts` — **local board** in localStorage | Not shared between people. |
| Auth: Google/X via Grok identity, email+password (better-auth) | `auth.ts` — **local profile** (salted SHA-256 in localStorage); Google/X buttons kept but explain they need Grok identity | Not real security; no cross-device accounts. |
| Plan / Pro flags / purchase / invites | `plan.ts` — plan in browser, `proSales:false` (the live site's "Pro is on the way" state), invites & purchase tokens can't be verified | Pro checkout stays parked, as live. |
| `/admin` operator console | Gated page that says the backend isn't connected | Panels need an API. |

## Learn: the education platform (milestone 2, live at `/learn`)

`/learn` is a Markdown-driven course platform. First course: **Trading Foundations**, 8 lessons, each with a 4 to 5 question quiz and a "Practice on the desk" task that deep-links into the paper desk.

```
src/content/courses/<course-slug>/
  course.md                 title, summary, level (+ intro paragraph)
  NN-<lesson-slug>.md       frontmatter: title, summary, order, minutes
                            body: Markdown, plus fenced blocks:
                              ```quiz      JSON array [{ q, options[], answer, explain }]  (3 to 5 questions)
                              ```practice  JSON { title, steps[], symbol?, shares? }
                              ```widget    name of an interactive widget (components/learn/widgets.tsx)
```

- **Add a lesson or course:** drop in a file or folder. No code change. `npm run check:content` (also run as `prebuild`, so CI and `npm run build` enforce it) validates frontmatter, quiz shape (3 to 5 questions, exactly one valid answer index, an explanation each) and practice shape. A bad quiz fails the build.
- **Routes:** `/learn` (hub + continue card), `/learn/<course>` (lesson list + progress), `/learn/<course>/<lesson>` (lesson, quiz, practice).
- **Progress:** `src/services/progress.ts` (`ProgressStore`: complete, quiz score best/last, attempts, last viewed, practice done, `subscribe`). The default store is localStorage (`phantastic-progress-v1`, keyed by lesson id `<course>/<slug>`). `hooks/useProgress.ts` is the React hook; `lib/learn.ts` has course percent and "continue where you left off". A quiz score of 60% or more completes the lesson.
- **Practice deep links:** `/?practice=<lessonId>&ticket=<SYMBOL>&shares=<n>`. The desk shows a practice banner; once the book is funded and the tape is loaded it opens a pre-filled ticket, then strips `ticket` and `shares` from the URL so closing the dialog doesn't reopen it. Signed-out learners are shown a banner and the link survives sign-in.
- **What the desk can't practise:** it fills at the last quote with no spread, no limit orders and no stops on manual tickets. The lessons say so and make those practice tasks think-and-compare exercises.
- **Nav:** Learn is in the desk header, the welcome header, the shared `PageShell` header and the legal footer links.

### Other extension points

- **Routing and layout:** add a file under `src/routes/`; wrap pages in `components/layout.tsx` (`PageShell`). `routeTree.gen.ts` regenerates automatically.
- **MDX:** swap `renderMarkdown` in `lib/content.ts`; the `Course`/`Lesson` shapes and routes stay the same.
- **Real backend:** every service (`quotes`, `cycle`, `research`, `ladder`, `plan`, `auth`, `progress`) exports a provider setter. See [docs/BACKEND-PLAN.md](docs/BACKEND-PLAN.md) for the free-tier plan and what the owner would need to provide.

## Code-quality note

`src/lib`, `src/store`, `src/services`, `src/components/ui` and the routes are hand-written, typed code. The large UI
components (`src/components/desk/*`, `src/pages/*`, `components/{pro,legal,brand,tip}.tsx`) were recovered from the compiled
bundle by an AST conversion (JSX restored, props and the most important locals renamed). They are marked `// @ts-nocheck`
and some local variables are still terse (`e`, `t`, `n`). Tidy them file-by-file as features are touched — remove the
`@ts-nocheck` line and fix what tsc reports.

## Paper trading only

No brokerage connection, no Robinhood, no real orders. Fills are simulated at the last quote. Not a broker, not investment advice.
