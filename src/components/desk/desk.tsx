// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { AccountMenu } from "@/components/AccountMenu";
import { Logo, ThemeToggle } from "@/components/brand";
import { CycleCard, TradeList } from "@/components/desk/cycle";
import {
  BriefingCard,
  EquityChart,
  PositionsList,
  Tape,
} from "@/components/desk/dashboard";
import { SettingsSheet } from "@/components/desk/settings";
import { LaunchShareDialog, ShareLadderDialog } from "@/components/desk/share";
import { AddTickerDialog } from "@/components/desk/ticker";
import { TicketDialog } from "@/components/desk/ticket";
import { Welcome } from "@/components/desk/welcome";
import { Disclaimer } from "@/components/legal";
import { PlansDialog, ProBanner } from "@/components/pro";
import { TipJar } from "@/components/tip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { computeNav, tradeStats } from "@/lib/book";
import {
  TROPHIES,
  buildBriefing,
  dayKey,
  earnedTrophies,
  isAwayLongEnough,
} from "@/lib/engagement";
import { formatPct, formatUsd, toneClass } from "@/lib/format";
import { defaultHandle, ladderRowFromBook } from "@/lib/ladder";
import { cn } from "@/lib/utils";
import { signOut, useAuth } from "@/services/auth";
import { fetchGrokStatus, runCycle } from "@/services/cycle";
import { fetchDeskFlags, fetchMyPlan, fetchPlanCheck } from "@/services/plan";
import { fetchQuotes } from "@/services/quotes";
import { selectCyclesLeft, useBillingStore } from "@/store/billing";
import { useDeskStore } from "@/store/desk";
import { useQuery } from "@tanstack/react-query";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { ContinueCard } from "@/components/learn/ContinueCard";
import { PracticeBanner } from "@/components/learn/PracticeBanner";
import {
  BookOpen,
  Flame,
  ListOrdered,
  LoaderCircle,
  Settings2,
  Share2,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function Desk() {
  let [hydrated, setHydrated] = useState(false),
    [settingsOpen, setSettingsOpen] = useState(false),
    [addOpen, setAddOpen] = useState(false),
    [ticketSymbol, setTicketSymbol] = useState(null),
    [phase, setPhase] = useState("idle"),
    [plansOpen, setPlansOpen] = useState(false),
    [plansReason, setPlansReason] = useState("plans"),
    [pendingUnlock, setPendingUnlock] = useState(null),
    [briefingOpen, setBriefingOpen] = useState(false),
    [shareOpen, setShareOpen] = useState(false),
    [launchShareOpen, setLaunchShareOpen] = useState(false),
    [ticketPrefill, setTicketPrefill] = useState(null),
    deepLink = getRouteApi("/").useSearch(),
    navigate = useNavigate(),
    { theme, setTheme } = useTheme(),
    { user, isPending: authPending } = useAuth(),
    signedIn = !!user,
    funded = useDeskStore((e) => e.funded),
    mode = useDeskStore((e) => e.mode),
    cash = useDeskStore((e) => e.cash),
    initialCash = useDeskStore((e) => e.initialCash),
    positions = useDeskStore((e) => e.positions),
    trades = useDeskStore((e) => e.trades),
    equity = useDeskStore((e) => e.equity),
    risk = useDeskStore((e) => e.risk),
    maxOrders = useDeskStore((e) => e.maxOrders),
    universe = useDeskStore((e) => e.universe),
    customNames = useDeskStore((e) => e.customNames) ?? {},
    lastCycle = useDeskStore((e) => e.lastCycle),
    riskAcked = useDeskStore((e) => e.riskAcked),
    autoFill = useDeskStore((e) => e.autonomy ?? "auto") === "auto",
    lastSeenAt = useDeskStore((e) => e.lastSeenAt ?? 0),
    lastSeenNav = useDeskStore((e) => e.lastSeenNav ?? 0),
    lastSeenMarks = useDeskStore((e) => e.lastSeenMarks ?? {}),
    streak = useDeskStore((e) => e.streak ?? 0),
    bestStreak = useDeskStore((e) => e.bestStreak ?? 0),
    cycledDay = useDeskStore((e) => e.cycledDay ?? ""),
    trophies = useDeskStore((e) => e.trophies ?? []),
    paperMode = (mode ?? (funded ? "paper" : null)) === "paper",
    isPro = useBillingStore((e) => e.plan) === "pro",
    cyclesLeftToday = useBillingStore(selectCyclesLeft),
    cycledToday = cycledDay === dayKey(),
    planQuery = useQuery({
      queryKey: ["my-plan", user?.id],
      queryFn: () => fetchMyPlan(),
      enabled: signedIn,
    }),
    proSales =
      useQuery({
        queryKey: ["desk-flags"],
        queryFn: () => fetchDeskFlags(),
        enabled: signedIn,
        staleTime: 0,
        refetchOnMount: "always",
      }).data?.proSales === true;
  (useEffect(() => {
    let e = planQuery.data;
    e &&
      (e.plan === "pro" && e.interval
        ? useBillingStore.getState().unlock(e.interval)
        : e.plan === "free" &&
          useBillingStore.getState().plan === "pro" &&
          useBillingStore.getState().revertToFree());
  }, [planQuery.data]),
    useEffect(() => {
      let e = () => {
        useDeskStore.persist.hasHydrated() &&
          useBillingStore.persist.hasHydrated() &&
          setHydrated(true);
      };
      e();
      let n = useDeskStore.persist.onFinishHydration(e),
        r = useBillingStore.persist.onFinishHydration(e);
      return (
        useDeskStore.persist.rehydrate(),
        useBillingStore.persist.rehydrate(),
        () => {
          (n(), r());
        }
      );
    }, []));
  let symbols = useMemo(() => {
      let e = positions.map((e) => e.symbol);
      return [
        ...new Set([
          ...universe,
          ...e,
          ...(deepLink.ticket ? [deepLink.ticket] : []),
        ]),
      ];
    }, [universe, positions, deepLink.ticket]),
    quotesQuery = useQuery({
      queryKey: ["quotes", symbols],
      queryFn: () =>
        fetchQuotes({
          data: {
            symbols,
          },
        }),
      enabled: hydrated && funded && paperMode,
      refetchInterval: 3e4,
    }),
    grokStatus = useQuery({
      queryKey: ["grok-status"],
      queryFn: () => fetchGrokStatus(),
      enabled: hydrated && funded && paperMode,
      staleTime: 6e4,
    }),
    quotes = quotesQuery.data?.quotes ?? [],
    quoteMap = useMemo(
      () => new Map(quotes.map((e) => [e.symbol, e])),
      [quotes],
    ),
    tapeSource = quotesQuery.data?.source ?? "live";
  useEffect(() => {
    if (!paperMode || !quotes.length) return;
    let e = useDeskStore.getState().applyStops(quotes);
    for (let t of e)
      toast(
        t.source === "stop"
          ? `Stop sold ${t.symbol}`
          : `Target sold ${t.symbol}`,
        {
          description: `${t.shares} sh @ ${formatUsd(t.price)}`,
        },
      );
    useDeskStore.getState().snapshot(quotes);
  }, [quotes, paperMode]);
  // Lesson deep link: open a pre-filled ticket once the book is funded and the tape is loaded,
  // then drop ticket/shares from the URL so closing the dialog doesn't reopen it.
  useEffect(() => {
    if (!deepLink.ticket || !hydrated || !funded || !paperMode) return;
    if (!quoteMap.has(deepLink.ticket)) return;
    setTicketPrefill({ symbol: deepLink.ticket, shares: deepLink.shares ?? null });
    setTicketSymbol(deepLink.ticket);
    navigate({
      to: "/",
      search: deepLink.practice ? { practice: deepLink.practice } : {},
      replace: true,
    });
  }, [deepLink.ticket, deepLink.shares, deepLink.practice, hydrated, funded, paperMode, quoteMap]);
  let book = {
      cash,
      initialCash,
      positions,
    },
    nav = quotes.length ? computeNav(book, quotes) : cash,
    openPnl = nav - initialCash,
    openPnlPct = initialCash ? (openPnl / initialCash) * 100 : 0,
    stats = tradeStats(trades),
    ladderRow = ladderRowFromBook({
      handle: defaultHandle(user?.displayName, user?.primaryEmail),
      trades,
      nav,
      initialCash: initialCash || 1,
      streak,
      bestStreak,
    }),
    grokReady = grokStatus.data?.available === true,
    grokDown = grokStatus.data?.available === false,
    running = phase !== "idle",
    ticketQuote = ticketSymbol ? (quoteMap.get(ticketSymbol) ?? null) : null,
    ticketHeld = positions.find((e) => e.symbol === ticketSymbol)?.shares ?? 0,
    navSinceLook = lastSeenNav > 0 ? nav - lastSeenNav : 0,
    navSinceLookPct = lastSeenNav > 0 ? (navSinceLook / lastSeenNav) * 100 : 0,
    briefing = useMemo(
      () =>
        buildBriefing({
          lastSeenAt,
          lastSeenNav,
          lastSeenMarks,
          nav,
          quotes,
          positions,
          streak,
          cycledToday,
        }),
      [
        lastSeenAt,
        lastSeenNav,
        lastSeenMarks,
        nav,
        quotes,
        positions,
        streak,
        cycledToday,
        briefingOpen,
      ],
    ),
    briefingShown = useRef(false),
    latest = useRef({
      nav,
      quotes,
    });
  ((latest.current = {
    nav,
    quotes,
  }),
    useEffect(() => {
      if (!(!paperMode || !quotes.length)) {
        if (
          (useDeskStore.getState().bumpStreak(),
          briefing && !briefingShown.current)
        ) {
          ((briefingShown.current = true), setBriefingOpen(true));
          return;
        }
        !briefing &&
          useDeskStore.getState().lastSeenAt === 0 &&
          useDeskStore.getState().checkIn(nav, quotes);
      }
    }, [paperMode, quotes.length, briefing, nav]),
    useEffect(() => {
      if (!paperMode) return;
      let e = () => {
          let e = latest.current;
          e.quotes.length && useDeskStore.getState().checkIn(e.nav, e.quotes);
        },
        t = () => {
          if (document.visibilityState === "hidden") {
            e();
            return;
          }
          isAwayLongEnough(useDeskStore.getState().lastSeenAt) &&
            ((briefingShown.current = true), setBriefingOpen(true));
        };
      return (
        document.addEventListener("visibilitychange", t),
        () => {
          document.removeEventListener("visibilitychange", t);
        }
      );
    }, [paperMode]),
    useEffect(() => {
      if (!hydrated || !paperMode) return;
      let t = useDeskStore.getState().unlockTrophies(
        earnedTrophies({
          trades,
          positions,
          nav,
          initialCash,
          lastCycle,
          streak,
          already: useDeskStore.getState().trophies,
        }),
      );
      for (let e of t) {
        let t = TROPHIES[e];
        t &&
          toast(t.title, {
            description: t.line,
          });
      }
    }, [
      hydrated,
      paperMode,
      trades.length,
      positions.length,
      nav,
      initialCash,
      lastCycle,
      streak,
    ]));
  function dismissBriefing() {
    (quotes.length && useDeskStore.getState().checkIn(nav, quotes),
      setBriefingOpen(false));
  }
  function announceFill(e) {
    let t = e.side === "sell" && e.realized > 0;
    toast(`${e.side === "buy" ? "Bought" : "Sold"} ${e.symbol}`, {
      description: `${e.shares} sh @ ${formatUsd(e.price)}`,
      action: t
        ? {
            label: "Share",
            onClick: () => setShareOpen(true),
          }
        : undefined,
    });
  }
  async function runGrok() {
    if (!running) {
      if (!useBillingStore.getState().consumeCycle()) {
        openPlans("cycles");
        return;
      }
      setPhase("tape");
      try {
        let e = (await quotesQuery.refetch()).data?.quotes ?? quotes;
        if (!e.length) {
          toast.error("No quotes on the tape.");
          return;
        }
        setPhase("grok");
        let t = useDeskStore.getState(),
          n = t.autonomy === "auto",
          r = computeNav(
            {
              cash: t.cash,
              initialCash: t.initialCash,
              positions: t.positions,
            },
            e,
          ),
          i = await runCycle({
            data: {
              risk: t.risk,
              maxOrders: t.maxOrders,
              autonomy: n,
              book: {
                cash: t.cash,
                nav: r,
                positions: t.positions,
              },
              quotes: e.map((e) => ({
                symbol: e.symbol,
                name: e.name,
                price: e.price,
                changePct: e.changePct,
                high: e.high,
                low: e.low,
              })),
            },
          });
        if (!i.ok) {
          (useBillingStore.getState().refundCycle(), toast.error(i.error));
          return;
        }
        if ((useDeskStore.getState().markCycled(), n)) {
          setPhase("fill");
          let t = useDeskStore
            .getState()
            .applyCycle(i.outlook, i.stance, i.orders, e);
          if (t.fills.length === 0)
            toast("Grok sat on its hands", {
              description: i.outlook,
            });
          else for (let e of t.fills) announceFill(e);
        } else
          (useDeskStore.getState().proposeCycle(i.outlook, i.stance, i.orders),
            i.orders.length === 0
              ? toast("Grok sat on its hands", {
                  description: i.outlook,
                })
              : toast(
                  `${i.orders.length} ticket${i.orders.length === 1 ? "" : "s"} to fill`,
                ));
      } catch (e) {
        useBillingStore.getState().refundCycle();
        let t = e instanceof Error ? e.message : "";
        /unauthorized/i.test(t)
          ? toast.error("Sign in again to run Grok.")
          : toast.error("Cycle failed. Try again.");
      } finally {
        setPhase("idle");
      }
    }
  }
  function fillOne(e) {
    let t = useDeskStore.getState().applyProposed(e, quotes);
    if (!t) {
      toast.error(`${e.symbol}: could not fill.`);
      return;
    }
    announceFill(t);
  }
  function fillAll() {
    if ((useDeskStore.getState().lastCycle?.orders ?? []).length === 0) return;
    if (!quotes.length) {
      toast.error("No quotes on the tape.");
      return;
    }
    let e = useDeskStore.getState().applyProposedAll(quotes);
    if (e.length === 0) {
      toast.error("Could not fill those tickets.");
      return;
    }
    for (let t of e) announceFill(t);
  }
  function setAutoFill(e) {
    (useDeskStore.getState().setAutonomy(e ? "auto" : "confirm"),
      e && fillAll());
  }
  function submitTicket(e, t) {
    if (!ticketSymbol) return;
    let n = useDeskStore.getState().applyManual(ticketSymbol, e, t, quotes);
    if (!n) {
      toast.error("Could not fill that ticket.");
      return;
    }
    (announceFill(n), setTicketSymbol(null), setTicketPrefill(null));
  }
  function openPlans(e, t = null) {
    (setPendingUnlock(t), setPlansReason(e), setPlansOpen(true));
  }
  function afterUnlock() {
    let e = pendingUnlock;
    (setPendingUnlock(null),
      e?.kind === "paper" && useDeskStore.getState().openPaper(e.capital),
      e?.kind === "add" && setAddOpen(true));
  }
  let runLabel = running
      ? "Running"
      : !isPro && cyclesLeftToday <= 0
        ? proSales
          ? "Upgrade for Grok"
          : "Out of cycles"
        : isPro
          ? "Run Grok"
          : `Run Grok · ${cyclesLeftToday} left`,
    renderRunControl = (e) => (
      <div
        className={cn(
          "isolate flex h-11 min-w-0 items-stretch overflow-hidden rounded-lg",
          autoFill ? "bg-fg text-accent-fg" : "bg-surface-2",
          e && "w-full",
        )}
        role="group"
        aria-label="Grok cycle"
      >
        <button
          type="button"
          aria-pressed={autoFill}
          title="When Auto is on, Grok fills paper tickets as it proposes them."
          onClick={() => setAutoFill(!autoFill)}
          className={cn(
            "flex shrink-0 items-center px-3 text-sm font-medium transition-colors duration-150",
            autoFill ? "text-accent-fg" : "text-muted hover:text-fg",
          )}
        >
          Auto
        </button>
        <span
          className={cn(
            "w-px self-stretch",
            autoFill ? "bg-accent-fg/20" : "bg-border",
          )}
          aria-hidden={true}
        />
        <Button
          variant={autoFill ? "default" : "secondary"}
          className={cn(
            "rounded-none shadow-none",
            autoFill && "bg-fg text-accent-fg hover:bg-fg/90",
            e && "min-h-11 min-w-0 flex-1",
          )}
          onClick={runGrok}
          disabled={running || grokStatus.isPending || !grokReady}
        >
          {running ? (
            <Fragment>
              <LoaderCircle className="size-4 animate-spin" />
              {e ? "Running…" : "Running"}
            </Fragment>
          ) : (
            runLabel
          )}
        </Button>
      </div>
    ),
    plansDialog = (
      <PlansDialog
        open={plansOpen}
        reason={plansReason}
        onOpenChange={setPlansOpen}
        onUnlocked={afterUnlock}
        proSales={proSales}
      />
    ),
    settingsSheet = (
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        risk={risk}
        maxOrders={maxOrders}
        universe={universe}
        customNames={customNames}
        theme={theme}
        onTheme={setTheme}
        initialCash={initialCash}
        isPro={isPro}
        streak={streak}
        bestStreak={bestStreak}
        trophies={trophies}
        proSales={proSales}
        onShare={() => {
          (setSettingsOpen(false), setShareOpen(true));
        }}
        onLaunchShare={() => {
          (setSettingsOpen(false), setLaunchShareOpen(true));
        }}
        onUpgrade={() => {
          (setSettingsOpen(false), openPlans("plans"));
        }}
        onRevert={() => {
          (async () => {
            try {
              if ((await fetchPlanCheck()).plan === "pro") {
                (useBillingStore
                  .getState()
                  .unlock(useBillingStore.getState().interval ?? "lifetime"),
                  toast("This operator desk stays Pro"));
                return;
              }
              (useBillingStore.getState().revertToFree(),
                toast("Back on the free desk"));
            } catch {
              toast.error("Could not change the plan");
            }
          })();
        }}
        onCapital={(e) => {
          (useDeskStore.getState().setCapital(e),
            toast("Paper capital reset", {
              description: `Book flattened at ${formatUsd(e, {
                whole: true,
              })}.`,
            }));
        }}
        onRisk={(e) => useDeskStore.getState().setRisk(e)}
        onMaxOrders={(e) => useDeskStore.getState().setMaxOrders(e)}
        onToggle={(e) => useDeskStore.getState().toggleSymbol(e)}
        onAddSymbol={(e, t) => useDeskStore.getState().addSymbol(e, t)}
        onRemoveCustom={(e) => useDeskStore.getState().removeCustom(e)}
        onLeave={() => useDeskStore.getState().leaveDesk()}
        onSignOut={() => {
          signOut();
        }}
        onReset={() => {
          (useDeskStore.getState().reset(),
            setSettingsOpen(false),
            toast("Desk flattened"));
        }}
      />
    ),
    accountSlot = authPending ? (
      <div className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
    ) : signedIn ? (
      <AccountMenu />
    ) : (
      <Link
        to="/login"
        search={{
          next: deepLink.practice
            ? `/?${new URLSearchParams(
                Object.entries(deepLink).map(([k, v]) => [k, String(v)]),
              )}`
            : "/",
        }}
        className="text-sm text-muted hover:text-fg"
      >
        Sign in
      </Link>
    );
  if (!hydrated || authPending)
    return (
      <Fragment>
        <Welcome
          ready={false}
          onFund={() => undefined}
          riskAcked={riskAcked}
          accountSlot={accountSlot}
          proSales={proSales}
          onShareDesk={() => setLaunchShareOpen(true)}
        />
        {plansDialog}
        <LaunchShareDialog
          open={launchShareOpen}
          onOpenChange={setLaunchShareOpen}
        />
      </Fragment>
    );
  let activeMode = signedIn ? (mode ?? (funded ? "paper" : null)) : null,
    welcome = (
      <Welcome
        ready={true}
        signedIn={signedIn}
        isPro={isPro}
        riskAcked={riskAcked}
        streak={streak}
        proSales={proSales}
        onAckRisk={() => useDeskStore.getState().ackRisk()}
        accountSlot={accountSlot}
        onSeePlans={() => openPlans("plans")}
        onShareDesk={() => setLaunchShareOpen(true)}
        onFund={(e) => {
          if (
            useDeskStore.persist.hasHydrated() &&
            useDeskStore.getState().riskAcked
          ) {
            if (!isPro && e > 1e5) {
              openPlans("capital", {
                kind: "paper",
                capital: e,
              });
              return;
            }
            useDeskStore.getState().openPaper(e);
          }
        }}
      />
    );
  return !activeMode || !funded ? (
    <Fragment>
      {deepLink.practice && (
        <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-6">
          <PracticeBanner
            lessonId={deepLink.practice}
            state={signedIn ? "fund" : "signin"}
          />
        </div>
      )}
      {welcome}
      {plansDialog}
      <LaunchShareDialog
        open={launchShareOpen}
        onOpenChange={setLaunchShareOpen}
      />
    </Fragment>
  ) : (
    <div className="min-h-dvh pb-48 lg:pb-12">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 px-3 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 sm:gap-3">
          <Logo className="size-7 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="font-display text-lg leading-none font-medium tracking-tight">
                Phantastic<span className="hidden sm:inline">{" Paper"}</span>
              </p>
              <Badge variant="paper">Paper</Badge>
              {isPro && <Badge variant="pro">Pro</Badge>}
              {streak > 0 && (
                <Badge variant="paper" className="gap-1">
                  <Flame className="size-3" aria-hidden={true} />
                  {streak}
                </Badge>
              )}
              {tapeSource !== "live" && (
                <Badge className="hidden sm:inline-flex">Sim tape</Badge>
              )}
            </div>
          </div>
          <ThemeToggle />
          {accountSlot}
          {!isPro && proSales && (
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() => openPlans("plans")}
            >
              Pro
            </Button>
          )}
          <Button
            asChild={true}
            variant="ghost"
            className="shrink-0 px-3 max-sm:size-11 max-sm:px-0"
            aria-label="Learn"
          >
            <Link to="/learn">
              <BookOpen className="size-5 sm:hidden" />
              <span className="hidden sm:inline">Learn</span>
            </Link>
          </Button>
          <Button
            asChild={true}
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Ladder"
          >
            <Link to="/ladder">
              <ListOrdered className="size-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Desk settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-5" />
          </Button>
          <div className="hidden lg:block">{renderRunControl(false)}</div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="NAV"
            value={formatUsd(nav)}
            hint={
              lastSeenNav > 0 && Math.abs(navSinceLook) >= 0.01
                ? `${formatPct(navSinceLookPct)} since last look`
                : formatPct(openPnlPct)
            }
            tone={
              lastSeenNav > 0 && Math.abs(navSinceLook) >= 0.01
                ? navSinceLook
                : openPnl
            }
          />
          <Stat
            label="Cash"
            value={formatUsd(cash)}
            hint={`${positions.length} names`}
          />
          <Stat
            label="Open P&L"
            value={formatUsd(openPnl)}
            hint={`vs ${formatUsd(initialCash, {
              whole: true,
            })} start`}
            tone={openPnl}
          />
          <Stat
            label="Win rate"
            value={stats.closed ? `${Math.round(stats.winRate * 100)}%` : "—"}
            hint={
              stats.closed
                ? `${stats.wins}/${stats.closed} closed`
                : "no closes"
            }
          />
        </section>
        <div className="mt-3 flex gap-2">
          <Button asChild={true} variant="secondary" className="min-w-0 flex-1">
            <Link to="/ladder">Ladder</Link>
          </Button>
          <Button
            variant="outline"
            className="min-w-0 flex-1"
            onClick={() => setShareOpen(true)}
          >
            <Share2 />
            Share
          </Button>
        </div>
        {!isPro && !proSales && <ProBanner variant="banner" className="mt-4" />}
        {deepLink.practice && (
          <PracticeBanner
            lessonId={deepLink.practice}
            state="ready"
            className="mt-4"
          />
        )}
        <ContinueCard className="mt-4" />
        {briefingOpen && briefing && (
          <div className="mt-4">
            <BriefingCard
              briefing={briefing}
              grokReady={grokReady && !running}
              onStay={dismissBriefing}
              onRun={() => {
                (dismissBriefing(), runGrok());
              }}
            />
          </div>
        )}
        {grokDown && (
          <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-sm text-muted shadow-[var(--shadow-border)]">
            Grok is unavailable here, so cycles are paused. The tape and manual
            tickets still work.
          </p>
        )}
        <div className="mt-4">
          {quotesQuery.isLoading && quotes.length === 0 ? (
            <div className="flex h-20 items-center gap-2 text-sm text-muted">
              <LoaderCircle className="size-4 animate-spin" />
              Pulling the tape…
            </div>
          ) : (
            <Tape
              quotes={quotes}
              lastMarks={lastSeenMarks}
              onPick={setTicketSymbol}
              onAdd={() => {
                if (!isPro) {
                  openPlans("ticker", {
                    kind: "add",
                  });
                  return;
                }
                setAddOpen(true);
              }}
            />
          )}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <EquityChart points={equity} initialCash={initialCash} />
            <PositionsList
              book={book}
              quotes={quotes}
              lastMarks={lastSeenMarks}
              onPick={setTicketSymbol}
            />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5">
            <CycleCard
              cycle={lastCycle}
              phase={phase}
              autonomy={autoFill}
              cycledToday={cycledToday}
              onFill={autoFill ? undefined : fillOne}
              onFillAll={autoFill ? undefined : fillAll}
            />
            <TradeList
              trades={trades}
              emptyHint={
                autoFill
                  ? "Paper fills land here. Auto prints Grok tickets at last quote."
                  : "Paper fills land here. Grok tickets wait until you fill them."
              }
            />
          </div>
        </div>
        <Disclaimer variant="paper" align="center" className="mt-8 mb-4" />
        <TipJar className="mx-auto mt-2 mb-4 max-w-2xl" />
      </div>
      <div className="fixed inset-x-0 bottom-[4.75rem] z-30 border-t border-border bg-bg/90 p-3 backdrop-blur-sm lg:hidden">
        {renderRunControl(true)}
      </div>
      {settingsSheet}
      {plansDialog}
      <AddTickerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={universe}
        onAdd={(e, t) => useDeskStore.getState().addSymbol(e, t)}
      />
      <TicketDialog
        quote={ticketQuote}
        heldShares={ticketHeld}
        cash={cash}
        initialShares={
          ticketPrefill && ticketPrefill.symbol === ticketSymbol
            ? ticketPrefill.shares
            : null
        }
        onClose={() => {
          setTicketSymbol(null);
          setTicketPrefill(null);
        }}
        onSubmit={submitTicket}
      />
      {shareOpen && (
        <ShareLadderDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          stats={ladderRow}
        />
      )}
      <LaunchShareDialog
        open={launchShareOpen}
        onOpenChange={setLaunchShareOpen}
      />
    </div>
  );
}
export function Stat({ label, value, hint, tone }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-widest text-subtle uppercase">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-xl font-medium tracking-tight tabular-nums sm:text-2xl",
          tone !== undefined && toneClass(tone),
        )}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-muted tabular-nums">{hint}</p>
    </div>
  );
}
