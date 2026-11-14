import { useEffect, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import type { Lesson } from "@/lib/content";
import { PASS_SCORE } from "@/lib/learn";
import { progress } from "@/services/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One question at a time reveals its answer + explanation as soon as an option is chosen
 * (answers lock). When every question is answered the score is recorded through the
 * ProgressStore; a pass (>= 60%) also completes the lesson.
 */
export function Quiz({ lesson }: { lesson: Lesson }) {
  const total = lesson.quiz.length;
  const [picked, setPicked] = useState<(number | null)[]>(() =>
    Array(total).fill(null),
  );
  const [best, setBest] = useState<number | undefined>();

  useEffect(() => {
    progress()
      .get(lesson.id)
      .then((p) => setBest(p?.quizScore));
  }, [lesson.id]);

  const answered = picked.filter((p) => p !== null).length;
  const correct = picked.filter(
    (p, i) => p !== null && p === lesson.quiz[i].answer,
  ).length;
  const done = answered === total;
  const score = total ? correct / total : 0;
  const passed = done && score >= PASS_SCORE;

  function choose(qi: number, oi: number) {
    if (picked[qi] !== null) return;
    const next = picked.slice();
    next[qi] = oi;
    setPicked(next);
    if (next.every((p) => p !== null)) {
      const c = next.filter((p, i) => p === lesson.quiz[i].answer).length;
      const s = c / total;
      void progress()
        .recordQuiz(lesson.id, s)
        .then(async () => {
          if (s >= PASS_SCORE) await progress().markComplete(lesson.id);
          setBest((b) => Math.max(b ?? 0, s));
        });
    }
  }

  return (
    <section aria-labelledby="quiz-h" data-testid="quiz">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="quiz-h"
          className="font-display text-2xl font-medium tracking-tight"
        >
          Check yourself
        </h2>
        <p className="text-xs text-muted tabular-nums">
          {answered}/{total} answered
          {best !== undefined && ` · best ${Math.round(best * 100)}%`}
        </p>
      </div>
      <ol className="mt-4 flex flex-col gap-4">
        {lesson.quiz.map((q, qi) => {
          const sel = picked[qi];
          return (
            <li
              key={qi}
              className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5"
            >
              <p className="text-sm font-medium text-fg">
                <span className="mr-2 text-subtle tabular-nums">{qi + 1}.</span>
                {q.q}
              </p>
              <div className="mt-3 flex flex-col gap-2" role="group" aria-label={`Question ${qi + 1} options`}>
                {q.options.map((opt, oi) => {
                  const isSel = sel === oi;
                  const isRight = oi === q.answer;
                  const reveal = sel !== null;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={reveal}
                      aria-pressed={isSel}
                      onClick={() => choose(qi, oi)}
                      className={cn(
                        "flex min-h-11 items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-[box-shadow,background-color] duration-150 shadow-[var(--shadow-border)]",
                        !reveal && "bg-surface-2 text-fg hover:shadow-[var(--shadow-border-hover)]",
                        reveal && isRight && "bg-gain/15 text-fg shadow-[0_0_0_1px_var(--color-gain)]",
                        reveal && isSel && !isRight && "bg-loss/15 text-fg shadow-[0_0_0_1px_var(--color-loss)]",
                        reveal && !isSel && !isRight && "bg-surface-2 text-muted opacity-70",
                        "disabled:opacity-100 disabled:pointer-events-none",
                      )}
                    >
                      <span className="mt-0.5 w-4 shrink-0 text-xs text-subtle">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {reveal && isRight && (
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-gain" aria-label="Correct answer" />
                      )}
                      {reveal && isSel && !isRight && (
                        <CircleX className="mt-0.5 size-4 shrink-0 text-loss" aria-label="Your answer, incorrect" />
                      )}
                    </button>
                  );
                })}
              </div>
              {sel !== null && (
                <p
                  role="status"
                  className="mt-3 text-sm leading-relaxed text-muted"
                  data-testid={sel === q.answer ? "explain-right" : "explain-wrong"}
                >
                  <span className={cn("font-medium", sel === q.answer ? "text-gain" : "text-loss")}>
                    {sel === q.answer ? "Correct. " : "Not quite. "}
                  </span>
                  {q.explain}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done && (
        <div
          role="status"
          className="mt-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5"
          data-testid="quiz-result"
        >
          <p className="font-display text-xl font-medium tracking-tight">
            {correct} of {total} correct
          </p>
          <p className="mt-1 text-sm text-muted">
            {passed
              ? "Nice. This lesson is marked complete."
              : `Pass mark is ${Math.round(PASS_SCORE * 100)}%. Re-read the lesson and try again. Your best score is kept.`}
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setPicked(Array(total).fill(null))}
          >
            Retake quiz
          </Button>
        </div>
      )}
    </section>
  );
}
