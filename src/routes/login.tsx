import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/login";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//") ? s.next : "/",
  }),
  component: LoginPage,
});
