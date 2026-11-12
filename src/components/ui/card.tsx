import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardLabel({ children }: { children?: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium tracking-widest text-subtle uppercase">
      {children}
    </p>
  );
}
