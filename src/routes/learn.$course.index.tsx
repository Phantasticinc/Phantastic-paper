import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { CircleCheck } from "lucide-react";
import { PageShell } from "@/components/layout";
import { EduDisclaimer } from "@/components/learn/EduDisclaimer";
import { ProgressBar } from "@/components/learn/ProgressBar";
import { getCourse } from "@/lib/content";
import { courseStats, isComplete } from "@/lib/learn";
import { useProgress } from "@/hooks/useProgress";
import { renderMarkdown } from "@/lib/content";

export const Route = createFileRoute("/learn/$course/")({
  loader: ({ params }) => {
    const course = getCourse(params.course);
    if (!course) throw notFound();
    return course;
  },
  component: CoursePage,
});

function CoursePage() {
  const course = Route.useLoaderData();
  const { ready, list, get } = useProgress();
  const s = courseStats(course, list);
  return (
    <PageShell title={course.title} eyebrow="Phantastic Paper · Learn">
      <Link to="/learn" className="mt-2 inline-block text-sm text-muted hover:text-fg">
        All courses
      </Link>
      <div
        className="lesson-prose mt-4 text-sm leading-relaxed text-muted"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(course.intro) }}
      />
      <div className="mt-5 flex items-center gap-3">
        <ProgressBar
          percent={ready ? s.percent : 0}
          label={`${course.title} progress`}
          className="flex-1"
        />
        <span className="text-xs text-muted tabular-nums" data-testid="course-percent">
          {ready ? `${s.percent}% · ${s.done}/${s.total} lessons` : " "}
        </span>
      </div>
      <ol className="mt-8 flex flex-col gap-3">
        {course.lessons.map((l) => {
          const p = get(l.id);
          const done = isComplete(p);
          return (
            <li key={l.id}>
              <Link
                to="/learn/$course/$slug"
                params={{ course: course.slug, slug: l.slug }}
                className="flex items-start gap-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs text-muted tabular-nums">
                  {done ? (
                    <CircleCheck className="size-5 text-gain" aria-label="Completed" />
                  ) : (
                    l.order
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-tight font-medium tracking-tight">
                    {l.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{l.summary}</span>
                  <span className="mt-2 block text-xs text-subtle">
                    {l.minutes} min · {l.quiz.length}-question quiz
                    {p?.quizScore !== undefined &&
                      ` · best ${Math.round(p.quizScore * 100)}%`}
                    {p?.practiceDoneAt && " · practice done"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <EduDisclaimer className="mt-10" />
    </PageShell>
  );
}
