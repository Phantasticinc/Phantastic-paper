import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout";
import { getLesson, renderLesson } from "@/lib/content";

export const Route = createFileRoute("/learn/$slug")({
  loader: ({ params }) => {
    const lesson = getLesson(params.slug);
    if (!lesson) throw notFound();
    return lesson;
  },
  component: LessonPage,
});

function LessonPage() {
  const lesson = Route.useLoaderData();
  return (
    <PageShell title={lesson.title} eyebrow="Phantastic Paper · Learn">
      {/* Content is first-party Markdown from this repo, not user input. */}
      <article
        className="mt-6 space-y-4 text-sm leading-relaxed text-muted [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_strong]:text-fg"
        dangerouslySetInnerHTML={{ __html: renderLesson(lesson) }}
      />
    </PageShell>
  );
}
