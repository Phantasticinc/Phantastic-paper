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
import { normalizeSymbol } from "@/lib/universe";
import { cn } from "@/lib/utils";
import { searchSymbols, verifySymbol } from "@/services/quotes";
import { LoaderCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AddTickerForm({ existing, onAdd, autoFocus = false }) {
  let [r, i] = useState(""),
    [a, o] = useState(""),
    [s, c] = useState([]),
    [l, u] = useState(false),
    [d, f] = useState(null);
  (useEffect(() => {
    let e = window.setTimeout(() => o(r.trim()), 220);
    return () => window.clearTimeout(e);
  }, [r]),
    useEffect(() => {
      if (a.length < 1) {
        (c([]), u(false));
        return;
      }
      let e = false;
      return (
        u(true),
        searchSymbols({
          data: {
            q: a,
          },
        })
          .then((t) => {
            e || c(t.hits);
          })
          .catch(() => {
            e || c([]);
          })
          .finally(() => {
            e || u(false);
          }),
        () => {
          e = true;
        }
      );
    }, [a]));
  async function p(n) {
    if (existing.includes(n.symbol)) {
      toast("Already on the tape", {
        description: n.symbol,
      });
      return;
    }
    if (existing.length >= 32) {
      toast.error("Tape is full (32 names).");
      return;
    }
    f(n.symbol);
    try {
      onAdd(n.symbol, n.name)
        ? (toast(`Added ${n.symbol}`, {
            description: n.name,
          }),
          i(""),
          c([]))
        : toast.error("Could not add that ticker.");
    } finally {
      f(null);
    }
  }
  async function m() {
    let t = normalizeSymbol(r);
    if (!t) {
      toast.error("Enter a ticker.");
      return;
    }
    if (existing.includes(t)) {
      toast("Already on the tape", {
        description: t,
      });
      return;
    }
    f(t);
    try {
      let e = await verifySymbol({
        data: {
          symbol: t,
        },
      });
      if (!e.ok) {
        toast.error(e.error);
        return;
      }
      await p({
        symbol: e.symbol,
        name: e.name,
      });
    } catch {
      toast.error("Could not verify that ticker.");
    } finally {
      f(null);
    }
  }
  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={r}
          autoFocus={autoFocus}
          placeholder="Search a ticker — PLTR, SOXL, BRK.B"
          onChange={(e) => i(e.target.value)}
          onKeyDown={(e) => {
            e.key === "Enter" && (e.preventDefault(), s[0] ? p(s[0]) : m());
          }}
        />
        <Button
          variant="secondary"
          className="shrink-0"
          disabled={!!d || r.trim().length < 1}
          onClick={() => void m()}
        >
          {d ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
      </div>
      {l && s.length === 0 && (
        <p className="mt-3 text-xs text-subtle">Searching the tape…</p>
      )}
      {s.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {s.map((t) => {
            let n = existing.includes(t.symbol);
            return (
              <li>
                <button
                  type="button"
                  disabled={n || d === t.symbol}
                  onClick={() => void p(t)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors duration-150",
                    n ? "opacity-50" : "hover:bg-surface-2",
                  )}
                >
                  <span className="min-w-0">
                    <span className="text-sm font-medium tracking-wide">
                      {t.symbol}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {t.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-subtle">
                    {n ? "On tape" : t.exchange || t.type}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
export function AddTickerDialog({ open, onOpenChange, existing, onAdd }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a name</DialogTitle>
          <DialogDescription>
            Search any listed ticker or ETF. Grok can only ticket names on your
            tape.
          </DialogDescription>
        </DialogHeader>
        <AddTickerForm
          existing={existing}
          autoFocus={true}
          onAdd={(e, n) => {
            let i = onAdd(e, n);
            return (i && onOpenChange(false), i);
          }}
        />
        <p className="mt-3 text-xs text-subtle">
          Last quotes print from the live tape. Paper fills stay simulated.
        </p>
      </DialogContent>
    </Dialog>
  );
}
