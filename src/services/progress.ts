/**
 * EXTENSION POINT — learner progress & quizzes (not used yet).
 *
 * The education platform will track lesson completion and quiz attempts per learner.
 * Keep the UI talking to this interface so the backing store can move from localStorage
 * to an API without touching components.
 */
export interface LessonProgress {
  lessonSlug: string;
  completedAt?: number;
  /** 0..1 */
  quizScore?: number;
  attempts: number;
}

export interface ProgressStore {
  get(lessonSlug: string): Promise<LessonProgress | null>;
  list(): Promise<LessonProgress[]>;
  markComplete(lessonSlug: string): Promise<void>;
  recordQuiz(lessonSlug: string, score: number): Promise<void>;
}

const KEY = "phantastic-progress-v1";

/** Default implementation: this browser only. */
export const localProgressStore: ProgressStore = {
  async get(slug) {
    return (await this.list()).find((p) => p.lessonSlug === slug) ?? null;
  },
  async list() {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]") as LessonProgress[];
    } catch {
      return [];
    }
  },
  async markComplete(slug) {
    const all = await this.list();
    const cur = all.find((p) => p.lessonSlug === slug) ?? {
      lessonSlug: slug,
      attempts: 0,
    };
    cur.completedAt = Date.now();
    localStorage.setItem(
      KEY,
      JSON.stringify([...all.filter((p) => p.lessonSlug !== slug), cur]),
    );
  },
  async recordQuiz(slug, score) {
    const all = await this.list();
    const cur = all.find((p) => p.lessonSlug === slug) ?? {
      lessonSlug: slug,
      attempts: 0,
    };
    cur.quizScore = score;
    cur.attempts += 1;
    localStorage.setItem(
      KEY,
      JSON.stringify([...all.filter((p) => p.lessonSlug !== slug), cur]),
    );
  },
};

let store: ProgressStore = localProgressStore;
export const setProgressStore = (s: ProgressStore) => {
  store = s;
};
export const progress = () => store;
