import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Shown on every learn page. Same voice and links as the site's /risk notice. */
export function EduDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-xl bg-surface p-4 text-xs leading-relaxed text-subtle shadow-[var(--shadow-border)]",
        className,
      )}
    >
      <span className="font-medium text-muted">Education only.</span> Not
      investment advice, not an offer, not a recommendation to buy or sell
      anything. Tickers and prices in lessons are illustrations, not picks.
      Paper fills are fake and do not predict real results. Use at your own
      risk. Read the{" "}
      <Link
        to="/risk"
        className="text-muted underline underline-offset-4 hover:text-fg"
      >
        full notice
      </Link>
      .
    </p>
  );
}
