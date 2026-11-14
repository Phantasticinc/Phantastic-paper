import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser } from "@/lib/types";
import { LEGAL } from "@/lib/legal-config";

/**
 * AUTH — LOCAL PROFILE ONLY.
 *
 * The original used Grok identity (Google / X via "grok-google" / "grok-x") plus
 * email+password through better-auth on a server. None of that can run on a static host.
 * This build keeps a local profile in localStorage so the desk, ladder and settings all work:
 *   - "Create account" stores a salted SHA-256 of the password in THIS browser only.
 *   - Google / X buttons are kept for parity but explain that Grok identity isn't connected.
 *   - Nothing is sent anywhere. This is not real security — see README "Gaps".
 *
 * To integrate a real provider later, re-implement `useAuth`, `signOut`, `localAuth` (or replace
 * the login page's handlers) against it; everything else only depends on `useAuth()`.
 */
interface Account {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  /** Sign-up acknowledgment: 18+ and Terms/Privacy accepted. Stored with the profile. */
  ageConfirmedAt?: number;
  termsVersion?: string;
}
interface AuthState {
  accounts: Record<string, Account>;
  sessionEmail: string | null;
}

const useAuthStore = create<AuthState>()(
  persist(() => ({ accounts: {}, sessionEmail: null }) as AuthState, {
    name: "phantastic-local-auth-v1",
  }),
);

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const localAuth = {
  async signUp(args: {
    email: string;
    password: string;
    name?: string;
    /** Must be true: the sign-up form's "I am 18 or older and accept the Terms" checkbox. */
    acknowledged: boolean;
  }): Promise<{ error: { message: string } | null }> {
    if (!args.acknowledged)
      return {
        error: {
          message: `Confirm that you are ${LEGAL.minAge} or older and accept the Terms to create an account.`,
        },
      };
    const email = args.email.trim().toLowerCase();
    if (useAuthStore.getState().accounts[email])
      return {
        error: {
          message:
            "That account already exists on this device. Sign in instead.",
        },
      };
    const salt = crypto.randomUUID();
    const account: Account = {
      id: crypto.randomUUID(),
      name: args.name?.trim() || email.split("@")[0],
      email,
      salt,
      hash: await sha256(`${salt}:${args.password}`),
      ageConfirmedAt: Date.now(),
      termsVersion: LEGAL.termsVersion,
    };
    useAuthStore.setState((s) => ({
      accounts: { ...s.accounts, [email]: account },
      sessionEmail: email,
    }));
    return { error: null };
  },
  async signIn(args: {
    email: string;
    password: string;
  }): Promise<{ error: { message: string } | null }> {
    const email = args.email.trim().toLowerCase();
    const account = useAuthStore.getState().accounts[email];
    if (
      !account ||
      account.hash !== (await sha256(`${account.salt}:${args.password}`))
    ) {
      return {
        error: {
          message:
            "Those credentials did not match any profile on this device.",
        },
      };
    }
    useAuthStore.setState({ sessionEmail: email });
    return { error: null };
  },
};

export const SIGN_IN_PROVIDERS = [
  { providerId: "grok-google", idp: "google", label: "Google" },
  { providerId: "grok-x", idp: "twitter", label: "X" },
] as const;

export async function signInWithProvider(
  _providerId: string,
  _opts: { callbackURL?: string; errorCallbackURL?: string } = {},
) {
  throw new Error(
    "Google and X sign-in used Grok identity, which isn’t connected in this build. Use a username and password — it makes a local profile on this device.",
  );
}

export function useAuth(): { user: AppUser | null; isPending: boolean } {
  const { accounts, sessionEmail } = useAuthStore();
  const account = sessionEmail ? accounts[sessionEmail] : undefined;
  return {
    user: account
      ? {
          id: account.id,
          displayName: account.name,
          primaryEmail: account.email,
          profileImageUrl: null,
          isDevFallback: false,
        }
      : null,
    isPending: false,
  };
}

export async function signOut(redirectTo = "/") {
  useAuthStore.setState({ sessionEmail: null });
  window.location.assign(
    `${import.meta.env.BASE_URL.replace(/\/$/, "")}${redirectTo}`,
  );
}
