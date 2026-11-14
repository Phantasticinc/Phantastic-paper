import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo, ThemeToggle } from "@/components/brand";
import { LegalLinks } from "@/components/legal";
import { TipJarCompact } from "@/components/tip";
import type { LegalDoc } from "@/content/legal/types";

/** Inline links in legal text: [label](/path). Everything else is plain text. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\(\/[^)]*\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\[([^\]]+)\]\((\/[^)]*)\)$/.exec(p);
        if (!m) return p;
        return (
          <Link
            key={i}
            to={m[2] as never}
            className="text-fg underline decoration-2 underline-offset-4 hover:opacity-80"
          >
            {m[1]}
          </Link>
        );
      })}
    </>
  );
}

/**
 * Same chrome and typography as the Risk / Privacy pages. The "Draft, pending review" status is
 * deliberately NOT rendered; it lives only in the content files (src/content/legal).
 */
export function LegalPage({
  doc,
  extras = {},
}: {
  doc: LegalDoc;
  /** Extra UI appended to a section, keyed by section id. */
  extras?: Record<string, ReactNode>;
}) {
  return (
    <main className="relative mx-auto min-h-dvh max-w-2xl px-5 pb-28 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="truncate text-sm tracking-widest text-muted uppercase">
            Phantastic Paper
          </span>
        </div>
        <ThemeToggle />
      </div>
      <h1 className="font-display text-[2rem] font-medium tracking-tight text-balance sm:text-4xl">
        {doc.title}
      </h1>
      <p className="mt-3 text-sm text-muted">{doc.intro}</p>
      <p className="mt-2 text-xs text-subtle">Effective {doc.effective}</p>
      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-pretty text-muted">
        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-6">
            <h2 className="font-display text-xl font-medium tracking-tight text-fg">
              {s.title}
            </h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-2">
                <Inline text={p} />
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {s.bullets.map((b, i) => (
                  <li key={i}>
                    <Inline text={b} />
                  </li>
                ))}
              </ul>
            )}
            {extras[s.id]}
          </section>
        ))}
      </div>
      <div className="mt-12 flex flex-col gap-3">
        <TipJarCompact />
        <LegalLinks />
        <Link to="/" className="text-sm text-muted hover:text-fg">
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
