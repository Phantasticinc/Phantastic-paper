import { Link, createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout";
import { ContinueCard } from "@/components/learn/ContinueCard";
import { EduDisclaimer } from "@/components/learn/EduDisclaimer";
import { ProgressBar } from "@/components/learn/ProgressBar";
import { courses } from "@/lib/content";
import { courseStats } from "@/lib/learn";
import { useProgress } from "@/hooks/useProgress";

export const Route = createFileRoute("/learn/")({ component: LearnHub });

function LearnHub() {
  const { ready, list } = useProgress();
  return (
    <PageShell title="Learn" eyebrow="Phantastic Paper · Learn">
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
        Short lessons on how markets and orders work, then practice on the paper
        desk with fake money. Progress is saved in this browser.
      </p>
      <ContinueCard className="mt-8" />
      <h2 className="mt-10 text-xs font-medium tracking-widest text-subtle uppercase">
        Courses
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {courses.map((c) => {
          const s = courseStats(c, list);
          const minutes = c.lessons.reduce((n, l) => n + l.minutes, 0);
          return (
            <li key={c.slug}>
              <Link
                to="/learn/$course"
                params={{ course: c.slug }}
                className="block rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)] sm:p-5"
              >
                <p className="text-xs font-medium tracking-widest text-subtle uppercase">
                  {c.level} · {c.lessons.length} lessons · ~{minutes} min
                </p>
                <p className="mt-2 font-display text-2xl leading-tight font-medium tracking-tight">
                  {c.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {c.summary}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar
                    percent={ready ? s.percent : 0}
                    label={`${c.title} progress`}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted tabular-nums">
                    {ready ? `${s.percent}% · ${s.done}/${s.total}` : " "}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <EduDisclaimer className="mt-10" />
    </PageShell>
  );
}
