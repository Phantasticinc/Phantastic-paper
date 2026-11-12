import { Link, createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout";
import { lessons } from "@/lib/content";

/** Stub: proves the lesson loader + shell work. Not linked from the desk yet. */
export const Route = createFileRoute("/learn/")({
  component: () => (
    <PageShell title="Learn" eyebrow="Phantastic Paper · Learn">
      <p className="mt-3 text-sm text-muted">
        Lessons are Markdown files in src/content/lessons.
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        {lessons.map((l) => (
          <li key={l.slug}>
            <Link
              to="/learn/$slug"
              params={{ slug: l.slug }}
              className="block rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] hover:bg-surface-2"
            >
              <p className="font-display text-lg font-medium tracking-tight">
                {l.title}
              </p>
              <p className="mt-1 text-sm text-muted">{l.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  ),
});
