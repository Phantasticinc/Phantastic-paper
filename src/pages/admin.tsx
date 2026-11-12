import { Navigate } from "@tanstack/react-router";
import { AccountMenu } from "@/components/AccountMenu";
import { Logo, ThemeToggle } from "@/components/brand";
import { Card, CardLabel } from "@/components/ui/card";
import { useAuth } from "@/services/auth";

/**
 * /admin — operator console.
 * The original showed paper-desk ops, Play payments and promo invites for an operator account,
 * all backed by server data (users, purchases, invites, flags). With no backend in this build the
 * route keeps its sign-in gate and header, and explains what is missing. Wire the panels to an API
 * when one exists (see README "Extension points").
 */
export function AdminPage() {
  const { user, isPending } = useAuth();
  if (isPending) return <div className="min-h-dvh bg-bg" />;
  if (!user) return <Navigate to="/login" search={{ next: "/admin" }} />;
  return (
    <div className="min-h-dvh pb-16">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Logo className="size-7" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-none font-medium tracking-tight">
              Operator
            </p>
            <p className="mt-1 text-xs text-subtle">
              Paper desk and Play payments
            </p>
          </div>
          <ThemeToggle />
          <AccountMenu />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Paper ops
        </h1>
        <Card className="mt-6">
          <CardLabel>Backend not connected</CardLabel>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            The operator console (desk stats, Play purchases, promo invites, the
            Pro-sales switch) read from the Phantastic server. This self-hosted
            build is static, so there is nothing to show here yet.
          </p>
        </Card>
      </div>
    </div>
  );
}
