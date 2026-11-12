import { useBillingStore } from "@/store/billing";
import type { BillingInterval } from "@/lib/types";

/**
 * Plan / flags / invites adapter. In the original these were server-side (Play Billing
 * verification, operator flags, promo invites). In this static build:
 *   - the plan lives only in the browser (billing store),
 *   - Pro sales are parked (`proSales: false`) exactly like the live site,
 *   - invite codes and purchase tokens can't be verified without a backend.
 */
export const fetchMyPlan = async (): Promise<{
  plan: "free" | "pro";
  interval: BillingInterval | null;
}> => {
  const s = useBillingStore.getState();
  return { plan: s.plan, interval: s.interval };
};

/** Operator-controlled flags. `proSales` false = "Pro is on the way" banner, no checkout. */
export const fetchDeskFlags = async (): Promise<{ proSales: boolean }> => ({
  proSales: false,
});

/** Used by "revert to free" — server answers whether the account is a permanent operator Pro desk. */
export const fetchPlanCheck = async (): Promise<{ plan: "free" | "pro" }> => ({
  plan: "free",
});

export const claimPurchase = async (_args: {
  data: {
    interval: BillingInterval;
    purchaseToken: string | null;
    sku: string;
  };
}): Promise<{ ok: boolean; error?: string }> => ({
  ok: false,
  error: "Pro checkout is parked until Play is approved.",
});

export const claimInvite = async (_args: {
  data: { code: string };
}): Promise<
  | { ok: true; interval: BillingInterval; label: string; already?: boolean }
  | { ok: false; error: string }
> => ({
  ok: false,
  error:
    "Invite codes are validated by the Phantastic server, which isn’t connected in this build.",
});
