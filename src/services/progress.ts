/**
 * Learner progress & quizzes — the seam between the UI and wherever progress is stored.
 *
 * The UI only talks to `progress()` (and the `useProgress` hook). The default store keeps
 * everything in this browser's localStorage; to move to a server (see docs/BACKEND-PLAN.md),
 * implement `ProgressStore` against an API and call `setProgressStore()` in main.tsx.
 *
 * `lessonSlug` is the lesson id, "<course>/<slug>", so slugs only need to be unique per course.
 */
export interface LessonProgress {
  lessonSlug: string;
  completedAt?: number;
  /** Best quiz score so far, 0..1. */
  quizScore?: number;
  /** Most recent quiz score, 0..1. */
  lastQuizScore?: number;
  attempts: number;
  lastViewedAt?: number;
  practiceDoneAt?: number;
}

export interface ProgressStore {
  get(lessonSlug: string): Promise<LessonProgress | null>;
  list(): Promise<LessonProgress[]>;
  markComplete(lessonSlug: string): Promise<void>;
  /** Records an attempt. `score` is 0..1. Keeps the best and the latest. */
  recordQuiz(lessonSlug: string, score: number): Promise<void>;
  /** Called when a lesson is opened; powers "continue where you left off". */
  markViewed(lessonSlug: string): Promise<void>;
  markPracticeDone(lessonSlug: string): Promise<void>;
  /** Notifies when progress changes (including from another tab). Returns an unsubscribe. */
  subscribe(listener: () => void): () => void;
}

const KEY = "phantastic-progress-v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): LessonProgress[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function update(slug: string, fn: (p: LessonProgress) => void) {
  const all = read();
  const cur = all.find((p) => p.lessonSlug === slug) ?? {
    lessonSlug: slug,
    attempts: 0,
  };
  fn(cur);
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify([...all.filter((p) => p.lessonSlug !== slug), cur]),
    );
  } catch {
    /* storage full or blocked: progress just isn't saved */
  }
  emit();
}

if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) emit();
  });

/** Default implementation: this browser only. */
export const localProgressStore: ProgressStore = {
  async get(slug) {
    return read().find((p) => p.lessonSlug === slug) ?? null;
  },
  async list() {
    return read();
  },
  async markComplete(slug) {
    update(slug, (p) => {
      p.completedAt ??= Date.now();
    });
  },
  async recordQuiz(slug, score) {
    update(slug, (p) => {
      p.lastQuizScore = score;
      p.quizScore = Math.max(p.quizScore ?? 0, score);
      p.attempts += 1;
    });
  },
  async markViewed(slug) {
    update(slug, (p) => {
      p.lastViewedAt = Date.now();
    });
  },
  async markPracticeDone(slug) {
    update(slug, (p) => {
      p.practiceDoneAt ??= Date.now();
    });
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

let store: ProgressStore = localProgressStore;
export const setProgressStore = (s: ProgressStore) => {
  store = s;
};
export const progress = () => store;
