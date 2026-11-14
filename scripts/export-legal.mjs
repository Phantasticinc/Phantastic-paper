// Writes plain-text copies of the Terms and Privacy drafts for legal review.
// Usage: node scripts/export-legal.mjs [outDir]   (default: ../legal-drafts)
import fs from "node:fs";
import path from "node:path";
import { TERMS, TERMS_STATUS } from "../src/content/legal/terms.ts";
import { PRIVACY, PRIVACY_STATUS } from "../src/content/legal/privacy.ts";

const out = path.resolve(process.argv[2] ?? "../legal-drafts");
fs.mkdirSync(out, { recursive: true });
const plain = (t) => t.replace(/\[([^\]]+)\]\((\/[^)]*)\)/g, "$1 ($2)");
const wrap = (t, w = 92) => {
  const lines = [];
  let line = "";
  for (const word of t.split(/\s+/)) {
    if ((line + " " + word).trim().length > w) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines.join("\n");
};
function render(doc, status, file) {
  const head = [
    `*** ${status.toUpperCase()} ***`,
    "Prepared for review by Eli (Huy's legal assistant). General drafting, not a lawyer's opinion.",
    "Items in square brackets are placeholders Huy must fill in (see src/lib/legal-config.ts).",
    "This status line is NOT shown on the website.",
    "",
    "=".repeat(60),
    doc.title.toUpperCase() + "  -  Phantastic Paper",
    "Effective " + doc.effective,
    "=".repeat(60),
    "",
    wrap(plain(doc.intro)),
    "",
  ];
  doc.sections.forEach((s, i) => {
    head.push(`${i + 1}. ${s.title}  (#${s.id})`, "");
    s.paragraphs.forEach((p) => head.push(wrap(plain(p)), ""));
    (s.bullets ?? []).forEach((b) => head.push(wrap("  - " + plain(b), 92).replace(/\n/g, "\n    "), ""));
    if (s.id === "delete" && doc === PRIVACY)
      head.push("  [Site shows a button here: \"Delete my data on this device\".]", "");
  });
  const text = head.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
  fs.writeFileSync(path.join(out, file), text);
  const open = [...new Set(text.match(/\[[^\]\n]+\]/g) ?? [])].filter((x) => !/^\[Site shows/.test(x));
  return { file, open };
}
const a = render(TERMS, TERMS_STATUS, "terms-of-use-DRAFT.txt");
const b = render(PRIVACY, PRIVACY_STATUS, "privacy-notice-DRAFT.txt");
console.log("Wrote", path.join(out, a.file), "and", path.join(out, b.file));
console.log("Open placeholders:", [...new Set([...a.open, ...b.open])].join("  "));
