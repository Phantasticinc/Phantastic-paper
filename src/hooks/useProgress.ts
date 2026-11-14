import { useEffect, useState } from "react";
import type { LessonProgress } from "@/services/progress";
import { progress } from "@/services/progress";

/**
 * Subscribes to the progress store. `ready` is false until the first read finishes, so UI can
 * render a neutral state instead of flashing "Start" for a learner who has progress.
 */
export function useProgress() {
  const [state, setState] = useState<{ ready: boolean; list: LessonProgress[] }>(
    { ready: false, list: [] },
  );
  useEffect(() => {
    let alive = true;
    const load = () =>
      progress()
        .list()
        .then((list) => alive && setState({ ready: true, list }));
    load();
    const off = progress().subscribe(load);
    return () => {
      alive = false;
      off();
    };
  }, []);
  return {
    ready: state.ready,
    list: state.list,
    get: (id: string) => state.list.find((p) => p.lessonSlug === id),
  };
}
