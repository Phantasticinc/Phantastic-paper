import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";

/**
 * Deploy base path is env-driven so the same code serves:
 *   - GitHub Pages project site  → VITE_BASE=/Phantastic-paper/   (preview)
 *   - Custom domain / dev        → VITE_BASE=/                    (phantastic.net after cutover)
 * The router reads the same value (import.meta.env.BASE_URL) for its basepath.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE || "/";
  return {
    base,
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    build: { chunkSizeWarningLimit: 900 },
  };
});
