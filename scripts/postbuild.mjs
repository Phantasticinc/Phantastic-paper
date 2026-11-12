// SPA fallback for static hosts (GitHub Pages serves 404.html for unknown paths) + optional CNAME.
import { copyFileSync, existsSync, writeFileSync } from "node:fs";

copyFileSync("dist/index.html", "dist/404.html");
writeFileSync("dist/.nojekyll", "");
if (process.env.CNAME) writeFileSync("dist/CNAME", `${process.env.CNAME}\n`);
console.log("postbuild: wrote dist/404.html, dist/.nojekyll" + (process.env.CNAME ? ", dist/CNAME" : ""));
if (!existsSync("dist/index.html")) process.exit(1);
