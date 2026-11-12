import { createFileRoute } from "@tanstack/react-router";
import { RiskPage } from "@/pages/risk";

export const Route = createFileRoute("/risk")({ component: RiskPage });
