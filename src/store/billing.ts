import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cyclesLeft, FREE_CYCLES_PER_DAY, todayIso } from "@/lib/plans";
import type { BillingInterval } from "@/lib/types";

interface BillingState {
  plan: "free" | "pro";
  interval: BillingInterval | null;
  unlockedAt: number | null;
  cyclesUsed: number;
  cycleDay: string;
  unlock: (interval: BillingInterval) => void;
  revertToFree: () => void;
  /** Spend one free cycle for today. Returns false when the free allowance is gone. */
  consumeCycle: () => boolean;
  refundCycle: () => void;
}

/** Plan + daily free-cycle counter. localStorage key kept identical to the original app. */
export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      plan: "free",
      interval: null,
      unlockedAt: null,
      cyclesUsed: 0,
      cycleDay: todayIso(),
      unlock: (interval) =>
        set({ plan: "pro", interval, unlockedAt: Date.now() }),
      revertToFree: () =>
        set({ plan: "free", interval: null, unlockedAt: null }),
      consumeCycle: () => {
        const s = get();
        if (s.plan === "pro") return true;
        const today = todayIso();
        const used = s.cycleDay === today ? s.cyclesUsed : 0;
        if (used >= FREE_CYCLES_PER_DAY) return false;
        set({ cycleDay: today, cyclesUsed: used + 1 });
        return true;
      },
      refundCycle: () => {
        const s = get();
        if (s.plan === "pro") return;
        if (s.cycleDay !== todayIso() || s.cyclesUsed <= 0) return;
        set({ cyclesUsed: s.cyclesUsed - 1 });
      },
    }),
    {
      name: "phantastic-billing-v1",
      skipHydration: true, // rehydrated on the client by the Desk after mount (SSR-safe in the original)
      partialize: (s) => ({
        plan: s.plan,
        interval: s.interval,
        unlockedAt: s.unlockedAt,
        cyclesUsed: s.cyclesUsed,
        cycleDay: s.cycleDay,
      }),
    },
  ),
);

export const selectCyclesLeft = (s: BillingState) =>
  cyclesLeft(s.plan, s.cyclesUsed, s.cycleDay);
