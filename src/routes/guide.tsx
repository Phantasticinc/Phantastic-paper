import { createFileRoute } from "@tanstack/react-router";
import { GuidePage } from "@/pages/guide";

export const Route = createFileRoute("/guide")({ component: GuidePage });
