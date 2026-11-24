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
  const isEn = rel.includes("/en/");
  if (h1 !== 1) issues.push(`${rel}: عدد H1 = ${h1}`);
  const t = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const d = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || "";
  if (!t) issues.push(`${rel}: لا يوجد title`);
  if (!d) issues.push(`${rel}: لا يوجد meta description`);
  if (CJK.test(html)) issues.push(`${rel}: محارف أجنبية دخيلة`);
  if (MOJI.test(html)) issues.push(`${rel}: ترميز تالف`);
  if (html.includes("undefined") && !rel.includes("404")) issues.push(`${rel}: نص undefined`);
  if (/\[\[|\]\]/.test(html)) issues.push(`${rel}: أقواس قالب متبقية`);
  const langAttr = (html.match(/<html[^>]+lang="([a-z-]+)"/i) || [])[1] || "?";
  const wantLang = /lang="en"/i.test(html) ? "en" : "ar";
  if (!["ar", "en"].includes(langAttr)) issues.push(`${rel}: lang غير معروف (${langAttr})`);
  if (!isEn && t && /طموح[^<]*طموح/.test(t)) issues.push(`${rel}: اسم العلامة مكرر في العنوان`);
  if (t && t.length > (isEn ? 95 : 70)) issues.push(`${rel}: عنوان طويل (${t.length})`);
  if (t) titles.set(t, [...(titles.get(t) || []), rel]);
  if (d) descs.set(d, [...(descs.get(d) || []), rel]);
}
// استبعاد النسخ المخصّصة: صفحة مسار قديم + صفحة المسار الافتراضي تُعرضان من نفس المقال
const custom = new Set(
  [...titles.values()].flat().filter((f) => /\/(?!en\/)/.test(f))
);
for (const [t, fs] of titles) {
  const distinct = new Set(fs.map((f) => f.replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/$/, "")));
  if (distinct.size > 1) issues.push(`عنوان مكرر: ${t.slice(0, 45)} → ${distinct.size} صفحة`);
}
for (const [d, fs] of descs) {
  const distinct = new Set(fs.map((f) => f.replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/$/, "")));
  if (distinct.size > 1) issues.push(`وصف مكرر: ${d.slice(0, 40)} → ${distinct.size} صفحة`);
}

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
