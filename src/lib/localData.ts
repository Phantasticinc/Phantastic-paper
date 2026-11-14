/** Every localStorage key this site writes. Used by "Delete my data on this device". */
export const LOCAL_KEYS = [
  "phantastic-paper-v1", // the paper book: cash, positions, trades, equity, settings
  "phantastic-billing-v1", // plan flags (Pro is parked)
  "phantastic-local-auth-v1", // local profile(s): email/username, display name, salted password hash
  "phantastic-local-ladder-v1", // your ladder handle and stats, if you posted
  "phantastic-progress-v1", // lesson completion and quiz scores
  "phantastic-theme", // light/dark choice
] as const;

export function deleteLocalData() {
  for (const k of LOCAL_KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* storage blocked: nothing to delete */
    }
  }
}
