import { createFileRoute } from "@tanstack/react-router";
import { LadderPage } from "@/pages/ladder";

export const Route = createFileRoute("/ladder")({ component: LadderPage });
