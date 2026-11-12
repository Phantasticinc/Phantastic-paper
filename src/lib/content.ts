import { marked } from "marked";

/**
 * EXTENSION POINT — Markdown-driven lessons & courses.
 *
 * Content lives in `src/content/lessons/*.md` with a small frontmatter block:
 *
 *   ---
 *   title: What is paper trading?
 *   summary: One-liner for lists
 *   order: 1
 *   ---
 *   Markdown body…
 *
 * Files are bundled at build time with `import.meta.glob` (no runtime fetch). To move to MDX later,
 * swap `renderLesson` for an MDX compiler; the `Lesson` shape and the routes stay the same.
 * For courses, add `src/content/courses/<course>/…` and a second glob — same loader pattern.
 */
export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  order: number;
  /** Raw markdown body (frontmatter stripped). */
  body: string;
}

const files = import.meta.glob("/src/content/lessons/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

export const lessons: Lesson[] = Object.entries(files)
  .map(([path, raw]) => {
    const { meta, body } = parseFrontmatter(raw);
    const slug = path
      .split("/")
      .pop()!
      .replace(/\.md$/, "")
      .replace(/^\d+-/, "");
    return {
      slug,
      title: meta.title ?? slug,
      summary: meta.summary ?? "",
      order: Number(meta.order ?? 999),
      body,
    };
  })
  .sort((a, b) => a.order - b.order);

export const getLesson = (slug: string) => lessons.find((l) => l.slug === slug);

export const renderLesson = (lesson: Lesson): string =>
  marked.parse(lesson.body, { async: false }) as string;
