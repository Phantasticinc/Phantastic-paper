// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatPct,
  formatShares,
  formatUsd,
  timeAgo,
  toneClass,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchResearch } from "@/services/research";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

export function TicketDialog({ quote, heldShares, cash, onClose, onSubmit }) {
  let [shares, setShares] = useState("10"),
    [tab, setTab] = useState("ticket"),
    qty = Math.max(0, Math.floor(Number(shares) || 0)),
    notional = quote ? qty * quote.price : 0,
    maxBuy = quote && quote.price > 0 ? Math.floor(cash / quote.price) : 0,
    canBuy = qty > 0 && qty <= maxBuy,
    canSell = qty > 0 && qty <= heldShares + 1e-8;
  return (
    useEffect(() => {
      setTab("ticket");
    }, [quote?.symbol]),
    (
      <Dialog open={!!quote} onOpenChange={(e) => !e && onClose()}>
        <DialogContent
          className="max-w-lg max-h-[min(88dvh,42rem)] overflow-y-auto"
          onOpenAutoFocus={() =>
            setShares(heldShares > 0 ? String(Math.min(heldShares, 10)) : "10")
          }
        >
          {quote && (
            <Fragment>
              <DialogHeader>
                <DialogTitle>{quote.symbol}</DialogTitle>
                <DialogDescription>
                  {quote.name}
                  {" · last "}
                  {formatUsd(quote.price)}{" "}
                  <span className={cn(toneClass(quote.changePct))}>
                    {formatPct(quote.changePct)}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <Tabs value={tab} onValueChange={setTab} className="mt-1">
                <TabsList className="w-full">
                  <TabsTrigger value="ticket">Ticket</TabsTrigger>
                  <TabsTrigger value="research">Research</TabsTrigger>
                </TabsList>
                <TabsContent value="ticket" className="mt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-surface-2 p-3">
                      <p className="text-xs text-subtle">Cash</p>
                      <p className="mt-1 tabular-nums">{formatUsd(cash)}</p>
                    </div>
                    <div className="rounded-md bg-surface-2 p-3">
                      <p className="text-xs text-subtle">Held</p>
                      <p className="mt-1 tabular-nums">
                        {formatShares(heldShares)}
                        {" sh"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="shares">Shares</Label>
                    <Input
                      id="shares"
                      className="mt-2 tabular-nums"
                      inputMode="numeric"
                      value={shares}
                      onChange={(e) =>
                        setShares(e.target.value.replace(/[^\d]/g, ""))
                      }
                    />
                    <p className="mt-2 text-xs text-muted tabular-nums">
                      {"Notional "}
                      {formatUsd(notional)}
                      {" · max buy "}
                      {maxBuy}
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button
                      variant="gain"
                      disabled={!canBuy}
                      onClick={() => onSubmit("buy", qty)}
                    >
                      Buy
                    </Button>
                    <Button
                      variant="loss"
                      disabled={!canSell}
                      onClick={() => onSubmit("sell", qty)}
                    >
                      Sell
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-subtle">
                    Manual paper fill at the last quote. Caps still apply on the
                    buy side.
                  </p>
                </TabsContent>
                <TabsContent value="research" className="mt-4">
                  <ResearchPanel quote={quote} active={tab === "research"} />
                </TabsContent>
              </Tabs>
            </Fragment>
          )}
        </DialogContent>
      </Dialog>
    )
  );
}
export function ResearchPanel({ quote, active }) {
  let n = useQuery({
      queryKey: ["research", quote.symbol],
      queryFn: () =>
        fetchResearch({
          data: {
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            changePct: quote.changePct,
            high: quote.high,
            low: quote.low,
            volume: quote.volume,
          },
        }),
      enabled: active,
      staleTime: 9e5,
    }),
    r = n.data?.ok ? n.data.take : null,
    i = n.data?.ok ? n.data.news : [];
  return n.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted">
      <LoaderCircle className="size-4 animate-spin" />
      Pulling recent news…
    </div>
  ) : n.data?.ok ? (
    <div className="flex flex-col gap-4">
      {r && <p className="text-sm leading-relaxed text-fg">{r}</p>}
      {i.length === 0 ? (
        <p className="text-sm text-muted">
          {"No recent headlines for "}
          {quote.symbol}.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {i.map((e) => (
            <li key={e.url} className="min-w-0">
              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg underline-offset-4 hover:underline"
              >
                {e.title}
              </a>
              <p className="mt-0.5 text-xs text-subtle">
                {e.publisher}
                {e.publishedAt ? ` · ${timeAgo(e.publishedAt)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : (
    <p className="text-sm text-muted">
      {n.data && "error" in n.data ? n.data.error : "No research yet."}
    </p>
  );
}
