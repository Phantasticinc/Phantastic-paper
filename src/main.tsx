import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

// The router's basepath comes from Vite's `base` (VITE_BASE). "/" in dev and on phantastic.net,
// "/Phantastic-paper/" on the GitHub Pages preview.
const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const router = createRouter({
  routeTree,
  basepath,
  defaultPreload: "intent",
  defaultNotFoundComponent: () => (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 text-center">
      <h1 className="font-display text-4xl font-medium tracking-tight">
        Off the tape
      </h1>
      <p className="mt-3 text-sm text-muted">That page doesn’t exist.</p>
      <a
        href={import.meta.env.BASE_URL}
        className="mt-6 text-sm text-fg underline-offset-4 hover:underline"
      >
        Back to the desk
      </a>
    </main>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-center"
      toastOptions={{
        className:
          "bg-surface-2 text-fg border-0 shadow-[var(--shadow-border)]",
      }}
    />
  );
}

function App() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
      <ThemedToaster />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
