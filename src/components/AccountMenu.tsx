import { useState } from "react";
import { signOut, useAuth } from "@/services/auth";

/** Avatar initial + name + "Sign out" shown in page headers when signed in. */
export function AccountMenu() {
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  if (!user) return null;
  const label = user.displayName ?? user.primaryEmail ?? "Account";
  return (
    <div className="flex min-w-0 items-center gap-2">
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-medium">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
        {label}
      </span>
      <button
        type="button"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          signOut().catch(() => setSigningOut(false));
        }}
        className="hidden cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline sm:inline"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
