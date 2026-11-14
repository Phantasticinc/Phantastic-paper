// Warns (never fails) about legal placeholders that are still unfilled in src/lib/legal-config.ts.
import { LEGAL } from "../src/lib/legal-config.ts";
const open = Object.entries(LEGAL).filter(([, v]) => typeof v === "string" && /\[[^\]]+\]/.test(v));
if (open.length)
  console.warn(
    `legal: ${open.length} placeholder(s) still open in src/lib/legal-config.ts: ${open.map(([k]) => k).join(", ")}. Fill them before the legal pages go live on phantastic.net.`,
  );
else console.log("legal: no open placeholders.");
