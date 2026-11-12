// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Button } from "@/components/ui/button";
import { asset, cn } from "@/lib/utils";
import { Coffee, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export var VENMO_URL =
  "https://venmo.com/code?user_id=2852616153333760389&created=1788039500";
export var TIP_LINES = [
  {
    title: "Paper P&L is fake. Coffee is real.",
    line: "If Auto printed a ticket that made you grin, Venmo the maker a thank-you.",
  },
  {
    title: "Won a paper million?",
    line: "Send a real coffee. The irony fills instantly — no slippage, no locate.",
  },
  {
    title: "Grok flies the desk. Caffeine flies the maker.",
    line: "Tips are optional. They are not Pro. They will not bribe the model.",
  },
  {
    title: "Stops are simulated. Gratitude doesn’t have to be.",
    line: "Scan the code or tap through to Venmo. The blotter will not notice.",
  },
];
export function TipJarCompact({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted", className)}>
      Paper P&L is fake. Coffee is real.{" "}
      <a
        href={VENMO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-fg underline-offset-4 hover:underline"
      >
        Venmo the maker
      </a>
      .
    </p>
  );
}
export function TipJar({ className }: { className?: string }) {
  let [t, n] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let e = window.setInterval(() => {
      n((e) => (e + 1) % TIP_LINES.length);
    }, 7e3);
    return () => window.clearInterval(e);
  }, []);
  let r = TIP_LINES[t] ?? TIP_LINES[0];
  return (
    <aside
      className={cn(
        "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <a
          href={VENMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Open Venmo tip code"
        >
          <img
            src={asset("venmo-code.svg")}
            alt="Venmo tip QR code"
            width={112}
            height={112}
            className="size-24 rounded-lg sm:size-28"
          />
        </a>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-widest text-subtle uppercase">
            Tip the maker
          </p>
          <p className="mt-2 font-display text-lg leading-snug font-medium tracking-tight text-fg">
            {r.title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.line}</p>
          <Button asChild={true} className="mt-4 min-h-11 w-full sm:w-auto">
            <a href={VENMO_URL} target="_blank" rel="noopener noreferrer">
              <Coffee className="size-4" />
              Venmo the maker
              <ExternalLink className="size-3.5 opacity-70" />
            </a>
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-subtle">
        Opens Venmo. Optional — not a Play charge, not Pro, not a better fill.
      </p>
    </aside>
  );
}
