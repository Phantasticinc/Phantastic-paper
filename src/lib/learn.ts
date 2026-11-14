import type { Course, Lesson } from "@/lib/content";
import type { LessonProgress } from "@/services/progress";

/** A quiz score at or above this counts as passing the lesson. */
export const PASS_SCORE = 0.6;

export const isComplete = (p?: LessonProgress) => !!p?.completedAt;

export function courseStats(course: Course, list: LessonProgress[]) {
  const byId = new Map(list.map((p) => [p.lessonSlug, p]));
  const done = course.lessons.filter((l) => isComplete(byId.get(l.id))).length;
  const total = course.lessons.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/**
 * "Continue where you left off": the most recently opened lesson that is not finished;
 * otherwise the first unfinished lesson; otherwise null (course complete).
 * `started` is true once the learner has opened anything in the course.
 */
export function continueTarget(
  course: Course,
  list: LessonProgress[],
): { lesson: Lesson | null; started: boolean } {
  const byId = new Map(list.map((p) => [p.lessonSlug, p]));
  const touched = course.lessons
    .map((l) => ({ l, p: byId.get(l.id) }))
    .filter((x) => x.p?.lastViewedAt || x.p?.completedAt);
  const started = touched.length > 0;
  const lastViewed = touched
    .filter((x) => !isComplete(x.p) && x.p?.lastViewedAt)
    .sort((a, b) => (b.p!.lastViewedAt ?? 0) - (a.p!.lastViewedAt ?? 0))[0];
  if (lastViewed) return { lesson: lastViewed.l, started };
  const firstOpen = course.lessons.find((l) => !isComplete(byId.get(l.id)));
  return { lesson: firstOpen ?? null, started };
}
