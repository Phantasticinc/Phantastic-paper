// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export var footerLinkClass =
  "font-bold text-fg underline decoration-2 underline-offset-4 hover:opacity-80";
export function LegalLinks({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle",
        className,
      )}
    >
      <Link
        to="/risk"
        className="underline-offset-4 hover:text-fg hover:underline"
      >
        Use at your own risk
      </Link>
      <Link to="/guide" className={footerLinkClass}>
        Instructions
      </Link>
      <Link to="/privacy" className={footerLinkClass}>
        Privacy
      </Link>
      <Link
        to="/ladder"
        className="underline-offset-4 hover:text-fg hover:underline"
      >
        Ladder
      </Link>
    </span>
  );
}
export var DISCLAIMERS = {
  welcome:
    "Paper trading only. Fills are simulated at last quote. Not a broker, not an offer, not investment advice.",
  paper:
    "Paper trading only. Fills are simulated at the last quote. Not a broker, not an offer, not investment advice.",
  billing:
    "Google Play Billing. Tied to your account. Not a broker, not a security, not investment advice.",
  login: "The book follows this account. Not a broker. Not investment advice.",
};
export function Disclaimer({ variant, className, align = "start" }) {
  return (
    <p
      className={cn(
        "max-w-md text-xs leading-relaxed text-subtle",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {DISCLAIMERS[variant]}{" "}
      <Link
        to="/risk"
        className="text-muted underline-offset-4 hover:text-fg hover:underline"
      >
        Use at your own risk
      </Link>
      .{" "}
      <Link to="/guide" className={footerLinkClass}>
        Instructions
      </Link>
      .{" "}
      <Link to="/privacy" className={footerLinkClass}>
        Privacy
      </Link>
      .
    </p>
  );
}
