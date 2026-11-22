#!/usr/bin/env node
/** فحص مخرجات البناء: بنية الصفحة وSEO والنصوص */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".html")) files.push(p);
  }
})(DIST);

const issues = [];
const titles = new Map(), descs = new Map();
const CJK = /[\u3000-\u9FFF\u0400-\u04FF]/;
const MOJI = /(Ø[\u0080-\u00BF]|Ù[\u0080-\u00BF]|â€)/;

for (const f of files) {
  const html = readFileSync(f, "utf8");
  const rel = f.replace(/\\/g, "/");
  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 !== 1) issues.push(`${rel}: عدد H1 = ${h1}`);
  const t = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const d = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || "";
  if (!t) issues.push(`${rel}: لا يوجد title`);
  if (!d) issues.push(`${rel}: لا يوجد meta description`);
  if (CJK.test(html)) issues.push(`${rel}: محارف أجنبية دخيلة`);
  if (MOJI.test(html)) issues.push(`${rel}: ترميز تالف`);
  if (html.includes("undefined") && !rel.includes("404")) issues.push(`${rel}: نص undefined`);
  if (/\[\[|\]\]/.test(html)) issues.push(`${rel}: أقواس قالب متبقية`);
  if (!/<html[^>]+lang="ar"/i.test(html)) issues.push(`${rel}: lang غير عربي`);
  if (t && /طموح[^<]*طموح/.test(t)) issues.push(`${rel}: اسم العلامة مكرر في العنوان`);
  if (t && t.length > 70) issues.push(`${rel}: عنوان طويل (${t.length} حرفًا)`);
  if (t) titles.set(t, [...(titles.get(t) || []), rel]);
  if (d) descs.set(d, [...(descs.get(d) || []), rel]);
}
for (const [t, fs] of titles) if (fs.length > 1) issues.push(`عنوان مكرر: ${t.slice(0, 45)} → ${fs.length} صفحة`);
for (const [d, fs] of descs) if (fs.length > 1) issues.push(`وصف مكرر: ${d.slice(0, 40)} → ${fs.length} صفحة`);

console.log(`صفحات HTML مفحوصة: ${files.length}`);
if (!issues.length) console.log("✓ لا ملاحظات بنيوية");
else {
  console.log(`ملاحظات: ${issues.length}`);
  for (const i of issues.slice(0, 30)) console.log("  -", i);
}
const titleLens = [...titles.keys()].map((t) => t.length);
console.log(`طول العنوان: ${Math.min(...titleLens)}–${Math.max(...titleLens)} حرفًا | متوسّط ${Math.round(titleLens.reduce((a, b) => a + b, 0) / titleLens.length)}`);
const descLens = [...descs.keys()].map((d) => d.length);
console.log(`طول الوصف: ${Math.min(...descLens)}–${Math.max(...descLens)} حرفًا`);
process.exit(issues.length ? 1 : 0);
