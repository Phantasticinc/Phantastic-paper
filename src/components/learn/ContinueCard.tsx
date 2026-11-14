import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { courses } from "@/lib/content";
import { continueTarget, courseStats } from "@/lib/learn";
import { useProgress } from "@/hooks/useProgress";
import { ProgressBar } from "@/components/learn/ProgressBar";
import { cn } from "@/lib/utils";

/**
 * "Continue where you left off". Used on /learn and on the signed-in desk.
 * Renders a neutral skeleton until progress has loaded (no flash of "Start").
 */
export function ContinueCard({ className }: { className?: string }) {
  const { ready, list } = useProgress();
  const course = courses[0];
  if (!course) return null;
  const shell = cn(
    "block rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)] sm:p-5",
    className,
  );
  if (!ready)
    return (
      <div className={shell} aria-busy="true">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="mt-3 h-5 w-56 animate-pulse rounded bg-surface-2" />
        <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-surface-2" />
      </div>
    );
  const stats = courseStats(course, list);
  const { lesson, started } = continueTarget(course, list);

  if (!lesson)
    return (
      <Link to="/learn/$course" params={{ course: course.slug }} className={shell}>
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">
          {course.title}
        </p>
        <p className="mt-2 font-display text-xl font-medium tracking-tight">
          Course complete
        </p>
        <p className="mt-1 text-sm text-muted">
          All {stats.total} lessons done. Revisit any lesson, or retake a quiz.
        </p>
        <ProgressBar percent={100} label={`${course.title} progress`} className="mt-4" />
      </Link>
    );

  return (
    <Link
      to="/learn/$course/$slug"
      params={{ course: course.slug, slug: lesson.slug }}
      className={shell}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-subtle uppercase">
            <BookOpen className="size-3.5" aria-hidden={true} />
            {started ? "Continue where you left off" : `Start ${course.title}`}
          </p>
          <p className="mt-2 font-display text-xl leading-tight font-medium tracking-tight">
            {lesson.title}
          </p>
          <p className="mt-1 text-sm text-muted">
            {course.title} · lesson {lesson.order} of {stats.total} ·{" "}
            {lesson.minutes} min
          </p>
        </div>
        <ArrowRight className="mt-1 size-5 shrink-0 text-muted" aria-hidden={true} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <ProgressBar
          percent={stats.percent}
          label={`${course.title} progress`}
          className="flex-1"
        />
        <span className="text-xs text-muted tabular-nums">
          {stats.percent}% · {stats.done}/{stats.total}
        </span>
      </div>
    </Link>
  );
}
