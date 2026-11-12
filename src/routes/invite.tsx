import { createFileRoute } from "@tanstack/react-router";
import { InvitePage } from "@/pages/invite";

export const Route = createFileRoute("/invite")({
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s.code === "string" ? s.code.trim() : "",
  }),
  component: InvitePage,
});
