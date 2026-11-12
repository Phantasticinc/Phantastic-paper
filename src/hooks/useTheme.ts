import { useEffect, useState } from "react";

export const THEME_KEY = "phantastic-theme";
export type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f3efe6" : "#0b0c0e");
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  useEffect(() => {
    const initial = readTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);
  const setTheme = (next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  };
  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
