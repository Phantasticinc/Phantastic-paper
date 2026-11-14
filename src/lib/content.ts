import { marked } from "marked";
import { parseFrontmatter, parseLesson } from "@/lib/contentParse";
import type { Block, Practice, QuizQuestion } from "@/lib/contentParse";

/**
 * EXTENSION POINT — Markdown-driven courses.
 *
 *   src/content/courses/<course-slug>/course.md        title, summary, level
 *   src/content/courses/<course-slug>/NN-<slug>.md     one lesson (format: see contentParse.ts)
 *
 * Everything is bundled at build time with `import.meta.glob` (no runtime fetch).
 * A new course is just a new folder. To move to MDX later, swap `renderMarkdown` for an MDX
 * compiler; the `Course` / `Lesson` shapes and the routes stay the same.
 * `scripts/check-content.mjs` validates all of it before every build.
 */
export type { Block, Practice, QuizQuestion };

export interface Lesson {
  /** Stable progress key: "<course>/<slug>". */
  id: string;
  courseSlug: string;
  slug: string;
  title: string;
  summary: string;
  order: number;
  minutes: number;
  blocks: Block[];
  quiz: QuizQuestion[];
  practice?: Practice;
}

export interface Course {
  slug: string;
  title: string;
  summary: string;
  level: string;
  intro: string;
  lessons: Lesson[];
}

const files = import.meta.glob("/src/content/courses/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const byCourse = new Map<string, { meta?: Record<string, string>; intro?: string; lessons: Lesson[] }>();

for (const [path, raw] of Object.entries(files)) {
  const [, , , , courseSlug, file] = path.split("/");
  const entry = byCourse.get(courseSlug) ?? { lessons: [] };
  byCourse.set(courseSlug, entry);
  if (file === "course.md") {
    const { meta, body } = parseFrontmatter(raw);
    entry.meta = meta;
    entry.intro = body.trim();
    continue;
  }
  const slug = file.replace(/\.md$/, "").replace(/^\d+-/, "");
  const parsed = parseLesson(raw, path);
  entry.lessons.push({ id: `${courseSlug}/${slug}`, courseSlug, slug, ...parsed });
}

export const courses: Course[] = [...byCourse.entries()]
  .map(([slug, e]) => ({
    slug,
    title: e.meta?.title ?? slug,
    summary: e.meta?.summary ?? "",
    level: e.meta?.level ?? "",
    intro: e.intro ?? "",
    lessons: e.lessons.sort((a, b) => a.order - b.order),
  }))
  .sort((a, b) => a.title.localeCompare(b.title));

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
export const getLesson = (courseSlug: string, slug: string) =>
  getCourse(courseSlug)?.lessons.find((l) => l.slug === slug);
export const getLessonById = (id: string) => {
  const [c, s] = id.split("/");
  return getLesson(c, s);
};
export const allLessons = () => courses.flatMap((c) => c.lessons);
export const nextLesson = (lesson: Lesson) => {
  const list = getCourse(lesson.courseSlug)?.lessons ?? [];
  return list[list.findIndex((l) => l.id === lesson.id) + 1];
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const internal = href.startsWith("/") && !href.startsWith("//");
      const t = title ? ` title="${title}"` : "";
      return internal
        ? `<a href="${BASE}${href}" data-internal="${href}"${t}>${text}</a>`
        : `<a href="${href}" target="_blank" rel="noreferrer noopener"${t}>${text}</a>`;
    },
  },
});

/** Content is first-party Markdown from this repo, never user input. */
export const renderMarkdown = (markdown: string): string =>
  marked.parse(markdown, { async: false }) as string;

/** Deep link into the paper desk for a lesson's practice task. */
export function practiceSearch(lesson: Lesson) {
  const p = lesson.practice;
  return {
    practice: lesson.id,
    ...(p?.symbol ? { ticket: p.symbol } : {}),
    ...(p?.shares ? { shares: p.shares } : {}),
  };
}
