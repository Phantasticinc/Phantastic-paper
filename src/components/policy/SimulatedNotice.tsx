import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Short "Simulated results" notice for every view that shows performance (NAV, P&L, win rate,
 * return, ladder rows, share cards). Full text: Terms, "Simulated trading and the limits of
 * simulated results".
 */
export function SimulatedNotice({
  tape = true,
  boxed = false,
  className,
}: {
  /** True while quotes come from the simulated tape (the "Sim tape" badge). */
  tape?: boolean;
  boxed?: boolean;
  className?: string;
}) {
  return (
    <p
      data-testid="simulated-notice"
      className={cn(
        "text-xs leading-relaxed text-subtle",
        boxed && "rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4",
        className,
      )}
    >
      <span className="font-medium text-muted">Simulated results.</span> Fake
      money{tape ? ", simulated prices" : ""}, no slippage, spread or emotions.
      Not predictive of real results, and not advice.{" "}
      <Link
        to="/terms"
        hash="simulated-results"
        className="text-muted underline underline-offset-4 hover:text-fg"
      >
        Why
      </Link>
    </p>
  );
}
