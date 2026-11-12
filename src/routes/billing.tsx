import { createFileRoute } from "@tanstack/react-router";
import { BillingPage } from "@/pages/billing";

export const Route = createFileRoute("/billing")({
  validateSearch: (s: Record<string, unknown>) => ({
    interval: (s.interval === "monthly" ? "monthly" : "lifetime") as
      "monthly" | "lifetime",
  }),
  component: BillingPage,
});
