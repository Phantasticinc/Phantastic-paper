import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { PageShell } from "@/components/layout";
import { EduDisclaimer } from "@/components/learn/EduDisclaimer";
import { Quiz } from "@/components/learn/Quiz";
import { WIDGETS } from "@/components/learn/widgets";
import { Button } from "@/components/ui/button";
import {
  getCourse,
  getLesson,
  nextLesson,
  practiceSearch,
  renderMarkdown,
} from "@/lib/content";
import type { Lesson } from "@/lib/content";
import { isComplete } from "@/lib/learn";
import { useProgress } from "@/hooks/useProgress";
import { progress } from "@/services/progress";

export const Route = createFileRoute("/learn/$course/$slug")({
  loader: ({ params }) => {
    const lesson = getLesson(params.course, params.slug);
    if (!lesson) throw notFound();
    return lesson;
  },
  component: LessonPage,
});

function Markdown({ markdown }: { markdown: string }) {
  const navigate = useNavigate();
  return (
    <div
      className="lesson-prose text-sm leading-relaxed text-muted"
      // First-party Markdown from this repo, never user input.
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
      onClick={(e) => {
        // Keep in-app links client-side (and base-path aware).
        const a = (e.target as HTMLElement).closest("a[data-internal]");
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        void navigate({ to: a.getAttribute("data-internal") as never });
      }}
    />
  );
}

function PracticeCard({ lesson }: { lesson: Lesson }) {
  const p = lesson.practice;
  if (!p) return null;
  return (
    <section
      aria-labelledby="practice-h"
      className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5"
      data-testid="practice"
    >
      <p className="text-xs font-medium tracking-widest text-subtle uppercase">
        Practice on the desk
      </p>
      <h2 id="practice-h" className="mt-2 font-display text-xl font-medium tracking-tight">
        {p.title}
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        {p.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <Button asChild={true} className="mt-4">
        <Link to="/" search={practiceSearch(lesson)}>
          Open the paper desk
          <ArrowRight />
        </Link>
      </Button>
      <p className="mt-3 text-xs text-subtle">
        Paper money only. You need a free local profile and a funded paper book
        on the desk; the page will walk you through it.
      </p>
    </section>
  );
}

function LessonPage() {
  const lesson = Route.useLoaderData();
  const { get } = useProgress();
  const p = get(lesson.id);
  const next = nextLesson(lesson);

  useEffect(() => {
    void progress().markViewed(lesson.id);
    window.scrollTo(0, 0);
  }, [lesson.id]);

  return (
    <PageShell eyebrow="Phantastic Paper · Learn">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/learn" className="hover:text-fg">
          Learn
        </Link>
        {" / "}
        <Link
          to="/learn/$course"
          params={{ course: lesson.courseSlug }}
          className="hover:text-fg"
        >
          {getCourse(lesson.courseSlug)?.title}
        </Link>
      </nav>
      <p className="mt-4 text-xs font-medium tracking-widest text-subtle uppercase">
        Lesson {lesson.order} · {lesson.minutes} min
      </p>
      <h1 className="mt-2 font-display text-[2rem] leading-[1.15] font-medium tracking-tight text-balance sm:text-4xl">
        {lesson.title}
      </h1>
      <p className="mt-3 text-sm text-muted">{lesson.summary}</p>
      <div className="mt-8 flex flex-col gap-6">
        {lesson.blocks.map((b, i) => {
          if (b.type === "md") return <Markdown key={i} markdown={b.markdown} />;
          const W = WIDGETS[b.name];
          return W ? <div key={i}>{W({ lesson })}</div> : null;
        })}
      </div>
      <div className="mt-10 flex flex-col gap-6">
        <Quiz key={lesson.id} lesson={lesson} />
        <PracticeCard lesson={lesson} />
        <div className="flex flex-wrap items-center gap-3">
          {isComplete(p) ? (
            <span className="inline-flex items-center gap-2 text-sm text-gain" data-testid="completed">
              <CircleCheck className="size-5" aria-hidden={true} />
              Lesson complete
            </span>
          ) : (
            <Button
              variant="secondary"
              onClick={() => void progress().markComplete(lesson.id)}
            >
              Mark lesson complete
            </Button>
          )}
          {next ? (
            <Button asChild={true} variant={isComplete(p) ? "default" : "ghost"}>
              <Link
                to="/learn/$course/$slug"
                params={{ course: next.courseSlug, slug: next.slug }}
              >
                Next: {next.title}
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button asChild={true} variant="ghost">
              <Link to="/learn/$course" params={{ course: lesson.courseSlug }}>
                Back to the course
              </Link>
            </Button>
          )}
        </div>
        <EduDisclaimer />
      </div>
    </PageShell>
  );
}
