// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      aria-hidden={true}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        className="fill-surface-2"
      />
      <path
        d="M9 8.5h10.2L23 12.2V23.2c0 .7-.6 1.3-1.3 1.3H9c-.7 0-1.3-.6-1.3-1.3V9.8c0-.7.6-1.3 1.3-1.3Z"
        className="fill-bg stroke-fg"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M19.2 8.5v3.4c0 .4.3.7.7.7H23"
        className="stroke-fg"
        fill="none"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M11 20.2 L14.2 16.6 L16.6 18.4 L20.8 13.8"
        fill="none"
        className="stroke-fg"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function ThemeToggle({ className }: { className?: string }) {
  let { theme: t, toggle: n } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={`Switch to ${t === "dark" ? "light" : "dark"} mode`}
      onClick={n}
    >
      {t === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
