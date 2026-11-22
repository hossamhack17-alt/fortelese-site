#!/usr/bin/env node
// فحص الروابط الداخلية في dist — يخرج بكود 1 إذا وجد رابطًا مكسورًا.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const DIST = process.argv[2] || "dist";
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (extname(p) === ".html") files.push(p);
  }
})(DIST);

// مصادر التحويلات تُعد روابط مقصودة لا مكسورة
const redirectSources = new Set();
try {
  const rl = readFileSync(join(DIST, "..", "public", "_redirects"), "utf8").split("\n");
  for (const line of rl) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const src = t.split(/\s+/)[0];
    if (src && src.startsWith("/")) {
      try { redirectSources.add(decodeURIComponent(src)); } catch { redirectSources.add(src); }
    }
  }
} catch {}

const targets = new Set();
const broken = [];
for (const f of files) {
  const html = readFileSync(f, "utf8");
  const re = /(?:href|src)="(\/[^"#?]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (href.startsWith("//")) continue;
    try { if (redirectSources.has(decodeURIComponent(href))) continue; } catch {}
    const candidates = [
      join(DIST, href),
      join(DIST, href + ".html"),
      join(DIST, href.replace(/\/$/, "") + ".html"),
      join(DIST, href, "index.html"),
    ];
    const ok = candidates.some((c) => existsSync(c) && statSync(c).isFile());
    if (!ok) broken.push({ page: f.replace(DIST + "/", ""), href });
    else targets.add(href);
  }
}

if (broken.length) {
  console.log(`✗ ${broken.length} رابطًا داخليًا مكسورًا:`);
  for (const b of broken.slice(0, 40)) console.log(`  ${b.page} -> ${b.href}`);
  process.exit(1);
}
console.log(`✓ لا روابط داخلية مكسورة (${files.length} صفحة، ${targets.size} هدفًا)`);
