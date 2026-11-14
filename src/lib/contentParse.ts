/**
 * Pure lesson-file parser + validator. No Vite, no React: it is imported by the app
 * (`lib/content.ts`) AND by `scripts/check-content.mjs`, which runs before every build so a
 * malformed quiz breaks the build instead of breaking a lesson in production.
 *
 * File format (`src/content/courses/<course>/NN-<slug>.md`):
 *
 *   ---
 *   title: ...        summary: ...        order: 1        minutes: 5
 *   ---
 *   Markdown body. Optional fenced blocks anywhere:
 *   ```widget      name of an interactive widget (see components/learn/widgets.tsx)
 *   ```quiz        JSON array: [{ q, options[], answer (index), explain }]  (3–5 questions)
 *   ```practice    JSON: { title, steps[], symbol?, shares? }  → deep link into the paper desk
 */
export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Practice {
  title: string;
  steps: string[];
  /** If set, the desk opens a pre-filled ticket for this symbol. */
  symbol?: string;
  shares?: number;
}

export type Block =
  | { type: "md"; markdown: string }
  | { type: "widget"; name: string };

export interface ParsedLesson {
  title: string;
  summary: string;
  order: number;
  minutes: number;
  blocks: Block[];
  quiz: QuizQuestion[];
  practice?: Practice;
}

export function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

const FENCE = /^```(quiz|practice|widget)[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/gm;

export function validateQuiz(quiz: unknown, where: string): string[] {
  const errs: string[] = [];
  if (!Array.isArray(quiz)) return [`${where}: quiz must be a JSON array`];
  if (quiz.length < 3 || quiz.length > 5)
    errs.push(`${where}: quiz needs 3–5 questions (has ${quiz.length})`);
  quiz.forEach((q, i) => {
    const w = `${where} Q${i + 1}`;
    if (!q || typeof q.q !== "string" || !q.q.trim())
      errs.push(`${w}: missing question text`);
    if (
      !Array.isArray(q?.options) ||
      q.options.length < 2 ||
      q.options.length > 5 ||
      q.options.some((o: unknown) => typeof o !== "string" || !o.trim())
    )
      errs.push(`${w}: needs 2–5 non-empty string options`);
    else if (new Set(q.options).size !== q.options.length)
      errs.push(`${w}: duplicate options`);
    if (
      !Number.isInteger(q?.answer) ||
      q.answer < 0 ||
      q.answer >= (q?.options?.length ?? 0)
    )
      errs.push(`${w}: "answer" must be the index of exactly one option`);
    if (typeof q?.explain !== "string" || q.explain.trim().length < 10)
      errs.push(`${w}: missing explanation`);
  });
  return errs;
}

export function validatePractice(p: unknown, where: string): string[] {
  const x = p as Practice;
  const errs: string[] = [];
  if (!x || typeof x.title !== "string" || !x.title.trim())
    errs.push(`${where}: practice needs a title`);
  if (!Array.isArray(x?.steps) || x.steps.length === 0)
    errs.push(`${where}: practice needs steps[]`);
  if (x?.shares !== undefined && !(Number.isInteger(x.shares) && x.shares > 0))
    errs.push(`${where}: practice.shares must be a positive integer`);
  if (x?.shares !== undefined && !x?.symbol)
    errs.push(`${where}: practice.shares needs a symbol`);
  return errs;
}

/** Parse one lesson file. Throws with a readable message on any problem. */
export function parseLesson(raw: string, where: string): ParsedLesson {
  const { meta, body } = parseFrontmatter(raw);
  const errs: string[] = [];
  let quiz: QuizQuestion[] = [];
  let practice: Practice | undefined;
  const widgets: string[] = [];

  const stripped = body.replace(FENCE, (_all, kind: string, inner: string) => {
    if (kind === "widget") {
      widgets.push(inner.trim());
      return `\n@@WIDGET:${widgets.length - 1}@@\n`;
    }
    try {
      const data = JSON.parse(inner);
      if (kind === "quiz") {
        errs.push(...validateQuiz(data, where));
        quiz = data;
      } else {
        errs.push(...validatePractice(data, where));
        practice = data;
      }
    } catch (e) {
      errs.push(`${where}: invalid JSON in ${kind} block (${(e as Error).message})`);
    }
    return "";
  });

  for (const key of ["title", "summary", "order", "minutes"])
    if (!meta[key]) errs.push(`${where}: frontmatter "${key}" is required`);
  if (quiz.length === 0 && !errs.some((e) => e.includes("quiz")))
    errs.push(`${where}: lesson has no quiz block`);
  if (errs.length) throw new Error(errs.join("\n"));

  const blocks: Block[] = [];
  for (const part of stripped.split(/\n@@WIDGET:(\d+)@@\n/)) {
    // split with a capture group alternates: markdown, widget-index, markdown, …
    if (/^\d+$/.test(part) && widgets[Number(part)] !== undefined) {
      blocks.push({ type: "widget", name: widgets[Number(part)] });
    } else if (part.trim()) {
      blocks.push({ type: "md", markdown: part.trim() });
    }
  }
  return {
    title: meta.title,
    summary: meta.summary,
    order: Number(meta.order),
    minutes: Number(meta.minutes),
    blocks,
    quiz,
    practice,
  };
}
