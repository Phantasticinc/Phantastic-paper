import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo, ThemeToggle } from "@/components/brand";
import { LegalLinks } from "@/components/legal";
import { cn } from "@/lib/utils";

/**
 * EXTENSION POINT — shared page shell for NEW pages (lessons, courses, quizzes, dashboards).
 * Same header and footer chrome as the parity pages: logo + theme toggle, narrow reading column,
 * legal links. `width` picks the reading column.
 */
export function PageShell({
  title,
  eyebrow = "Phantastic Paper",
  width = "2xl",
  children,
}: {
  title?: ReactNode;
  eyebrow?: string;
  width?: "md" | "2xl" | "3xl";
  children: ReactNode;
}) {
  return (
    <main
      className={cn(
        "relative mx-auto min-h-dvh px-5 pb-28 pt-6 sm:px-6 sm:pt-10",
        width === "md" && "max-w-md",
        width === "2xl" && "max-w-2xl",
        width === "3xl" && "max-w-3xl",
      )}
    >
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="truncate text-sm tracking-widest text-muted uppercase">
            {eyebrow}
          </span>
        </Link>
        <ThemeToggle />
      </div>
      {title && (
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {title}
        </h1>
      )}
      {children}
      <div className="mt-12 flex flex-col gap-3">
        <LegalLinks />
        <Link to="/" className="text-sm text-muted hover:text-fg">
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
