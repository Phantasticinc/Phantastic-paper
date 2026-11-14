import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/desk/desk";

export interface DeskSearch {
  /** Open a pre-filled ticket for this symbol (from a lesson's practice task). */
  ticket?: string;
  shares?: number;
  /** Lesson id ("<course>/<slug>") whose practice task is active; shows the practice banner. */
  practice?: string;
}

/** All params optional: a bare `/` is exactly the original home. */
export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): DeskSearch => {
    const out: DeskSearch = {};
    const t = typeof s.ticket === "string" ? s.ticket.toUpperCase() : "";
    if (/^[A-Z.]{1,10}$/.test(t)) out.ticket = t;
    const n = Number(s.shares);
    if (out.ticket && Number.isInteger(n) && n > 0 && n <= 1_000_000)
      out.shares = n;
    if (typeof s.practice === "string" && /^[\w-]+\/[\w-]+$/.test(s.practice))
      out.practice = s.practice;
    return out;
  },
  component: Desk,
});
