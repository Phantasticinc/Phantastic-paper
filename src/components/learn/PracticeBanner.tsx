import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, X } from "lucide-react";
import { getLessonById } from "@/lib/content";
import { progress } from "@/services/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shown on the desk when it was opened from a lesson's "Practice on the desk" task.
 * `state` tells the learner what is still needed before the task can be done.
 */
export function PracticeBanner({
  lessonId,
  state,
  className,
}: {
  lessonId: string;
  state: "ready" | "signin" | "fund";
  className?: string;
}) {
  const navigate = useNavigate();
  const lesson = getLessonById(lessonId);
  if (!lesson?.practice) return null;
  const p = lesson.practice;
  const dismiss = () =>
    void navigate({ to: "/", search: {}, replace: true });
  return (
    <section
      aria-label="Practice task"
      data-testid="practice-banner"
      className={cn(
        "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-subtle uppercase">
            <BookOpen className="size-3.5" aria-hidden={true} />
            Practice · {lesson.title}
          </p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">
            {p.title}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="-mt-2 -mr-2 shrink-0"
          aria-label="Dismiss practice task"
          onClick={dismiss}
        >
          <X className="size-5" />
        </Button>
      </div>
      {state !== "ready" && (
        <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-sm text-fg">
          {state === "signin"
            ? "Sign in with a free local profile, then open a paper book to start this task."
            : "Open a paper book below to start this task. Paper money only."}
        </p>
      )}
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
        {p.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={async () => {
            await progress().markPracticeDone(lesson.id);
            void navigate({
              to: "/learn/$course/$slug",
              params: { course: lesson.courseSlug, slug: lesson.slug },
            });
          }}
        >
          Done, back to the lesson
        </Button>
        <Button asChild={true} size="sm" variant="ghost">
          <Link
            to="/learn/$course/$slug"
            params={{ course: lesson.courseSlug, slug: lesson.slug }}
          >
            Back without marking done
          </Link>
        </Button>
      </div>
    </section>
  );
}
