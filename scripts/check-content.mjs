// Validates every lesson file (frontmatter, quiz shape, practice shape). Runs as `prebuild`.
import fs from "node:fs";
import path from "node:path";
import { parseLesson, parseFrontmatter } from "../src/lib/contentParse.ts";

const root = path.resolve("src/content/courses");
let count = 0;
const errors = [];
for (const course of fs.readdirSync(root, { withFileTypes: true })) {
  if (!course.isDirectory()) continue;
  const dir = path.join(root, course.name);
  if (!fs.existsSync(path.join(dir, "course.md")))
    errors.push(`${course.name}: missing course.md`);
  else if (!parseFrontmatter(fs.readFileSync(path.join(dir, "course.md"), "utf8")).meta.title)
    errors.push(`${course.name}/course.md: frontmatter "title" is required`);
  const slugs = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md") || f === "course.md") continue;
    const slug = f.replace(/\.md$/, "").replace(/^\d+-/, "");
    if (slugs.has(slug)) errors.push(`${course.name}: duplicate slug ${slug}`);
    slugs.add(slug);
    try {
      parseLesson(fs.readFileSync(path.join(dir, f), "utf8"), `${course.name}/${f}`);
      count++;
    } catch (e) {
      errors.push(e.message);
    }
  }
}
if (errors.length) {
  console.error("Content check failed:\n" + errors.join("\n"));
  process.exit(1);
}
console.log(`Content OK: ${count} lessons validated.`);
