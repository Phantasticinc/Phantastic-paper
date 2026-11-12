import { Outlet, createRootRoute } from "@tanstack/react-router";

/**
 * Root layout. Every route renders inside this. Page chrome (header, footer, legal links)
 * lives in `components/layout.tsx` (PageShell) for new pages; the recovered parity pages
 * carry their own chrome, exactly as the original did.
 */
export const Route = createRootRoute({ component: () => <Outlet /> });
