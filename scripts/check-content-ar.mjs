#!/usr/bin/env node
/**
 * فحص جودة محتوى عربي موضوعي (بلا LLM): أخطاء ميكانيكية + سلامة بنيوية + عبارات AI شائعة.
 * الاستخدام: node scripts/check-content-ar.mjs [--fix] [--json]
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";

const ROOT = ".";
const ARTICLES = join(ROOT, "src/content/articles");
const PAGES = join(ROOT, "src/pages");
const FIX = process.argv.includes("--fix");
const JSONOUT = process.argv.includes("--json");

const CJK = /[\u3000-\u9FFF\uAC00-\uD7AF\u0400-\u04FF\u0900-\u097F]/g;
const MOJIBAKE = /(Ø[\u0080-\u00BF]|Ù[\u0080-\u00BF]|â€[\u0080-\u2122]|Ã[\u0080-\u00BF])/g;

// أخطاء إملائية/لغوية شائعة (كلمة => تصحيح)
const SPELL = {
  "إنشالله": "إن شاء الله",
  "انشالله": "إن شاء الله",
  "لاكن": "لكن",
  "هاذا": "هذا",
  "هاذه": "هذه",
  "الذى": "الذي",
  "التى": "التي",
  "إبن": "ابن",
  "هيئه": "هيئة",
  "لأكن": "لكن",
  "تشبيغ": "تشغيل",
  "ماليزي ": "مالي ",
  "أهمال": "إهمال",
  "بأذن": "بإذن",
  "الأن": "الآن",
  "إستخدام": "استخدام",
  "إختبار": "اختبار",
  "إجتماع": "اجتماع",
};

// عبارات AI/إنشاء آلي شائعة بالعربية
const AI_ISMS = [
  "في عالم اليوم", "في عصرنا الحالي", "لا شك أن", "مما لا شك فيه", "تجدر الإشارة",
  "من المهم أن نلاحظ", "من الجدير بالذكر", "علاوة على ذلك", "في الختام", "خلاصة القول",
  "يكمن في", "يلعب دورًا حيويًا", "لا يقتصر الأمر على", "ليس مجرد", "بشكل ملحوظ",
  "في سياق متصل", "وفي هذا الصدد", "تجدر الإشارة إلى أن", "مما يجعلها", "نسيج",
];

const issues = [];
const perFile = new Map();
const add = (file, rule, detail, line = null) => {
  issues.push({ file: file.replace(/\\/g, "/"), rule, detail, line });
  perFile.set(file, (perFile.get(file) || 0) + 1);
};

function listMd(dir) {
  return readdirSync(dir)
    .filter((f) => extname(f) === ".md")
    .map((f) => join(dir, f));
}

function splitFront(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: "", body: text };
  return { fm: m[1], body: m[2] };
}

function stripHtml(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const files = [...listMd(ARTICLES)];

for (const f of files) {
  let raw = readFileSync(f, "utf8");
  const slug = basename(f, ".md");
  const { fm, body } = splitFront(raw);
  const isImported = /^oldUrl:/m.test(fm);
  // نص بلا وسوم (بلا إدخال مسافة مكان الوسم حتى لا نصنع أخطاء وهمية)
  const text = body
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ");
  let fixed = raw;

  // 1) محارف أجنبية دخيلة
  const cjk = body.match(CJK);
  if (cjk) add(f, "CJK_OR_FOREIGN", `محارف أجنبية دخيلة: ${[...new Set(cjk)].join(" ")}`);

  // 2) ترميز تالف
  const moj = body.match(MOJIBAKE);
  if (moj) add(f, "MOJIBAKE", `ترميز تالف: ${[...new Set(moj)].slice(0, 5).join(" ")}`);

  // 3) مسافات مزدوجة / مسافة قبل ترقيم
  const dbl = (body.match(/[^\n] {2,}[^\n]/g) || []).length;
  if (dbl) {
    add(f, "DOUBLE_SPACE", `${dbl} موضعًا بمسافات مزدوجة`);
    if (FIX) fixed = fixed.replace(/([^\n])\s{2,}([^\n])/g, "$1 $2");
  }
  const beforePunct = (text.match(/\s+[،؛؟!]/g) || []).length;
  if (beforePunct) {
    add(f, "SPACE_BEFORE_PUNCT", `${beforePunct} موضعًا بمسافة قبل علامة ترقيم`);
    if (FIX) fixed = fixed.replace(/\s+([،؛؟!])/g, "$1");
  }
  const noSpaceAfter = (text.match(/[،؛؟!](?=[ء-ي])/g) || []).length;
  if (noSpaceAfter) {
    add(f, "NO_SPACE_AFTER_PUNCT", `${noSpaceAfter} موضعًا بلا مسافة بعد الترقيم`);
    if (FIX) fixed = fixed.replace(/([،؛؟!])(?=[^\s<،؛؟!])/g, "$1 ");
  }

  // 4) كلمة مكررة متتالية
  const rep = body.match(/\b([\u0621-\u064A]{2,})\s+\1\b/g);
  if (rep) add(f, "REPEATED_WORD", `تكرار: ${[...new Set(rep)].slice(0, 4).join(" | ")}`);

  // 5) أخطاء إملائية شائعة (بحدود كلمة عربية)
  const escRe = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const [bad, good] of Object.entries(SPELL)) {
    const rx = new RegExp(`(^|[^\\u0621-\\u064A])${escRe(bad)}(?=[^\\u0621-\\u064A]|$)`, "g");
    if (rx.test(text)) {
      add(f, isImported ? "SPELLING(مستورد-للعلم)" : "SPELLING", `«${bad}» ← «${good}»`);
      if (FIX && !isImported) fixed = fixed.replace(rx, (m, a) => a + good);
    }
  }

  // 6) وسم HTML غير مغلق في المحتوى
  const opens = (body.match(/<(h[1-6]|p|div|ul|ol|li|strong|em|blockquote)\b/gi) || []).length;
  const closes = (body.match(/<\/(h[1-6]|p|div|ul|ol|li|strong|em|blockquote)>/gi) || []).length;
  if (Math.abs(opens - closes) > 0) add(f, "HTML_UNBALANCED", `فتح ${opens} / إغلاق ${closes}`);

  // 7) أقواس وعلامات تنصيص غير متوازنة
  const pairs = [["(", ")"], ["[", "]"], ["«", "»"]];
  for (const [o, c] of pairs) {
    const a = (body.split(o).length - 1), b = (body.split(c).length - 1);
    if (a !== b) add(f, "UNBALANCED_BRACKETS", `${o}${c}: ${a}/${b}`);
  }

  // 8) عبارات AI
  const hits = AI_ISMS.filter((p) => text.includes(p));
  if (hits.length) add(f, isImported ? "AI_PHRASE(مستورد-للعلم)" : "AI_PHRASE", hits.join(" | "));

  // 9) عناوين
  const h2 = (body.match(/<h2\b/gi) || []).length;
  const hasMdH2 = /^##\s+/m.test(body);
  if (h2 === 0 && !hasMdH2) add(f, "NO_H2", "لا يوجد عنوان فرعي H2");
  const emptyH = body.match(/<(h[1-6])[^>]*>\s*<\/\1>/gi);
  if (emptyH) add(f, "EMPTY_HEADING", `${emptyH.length} عنوان فارغ`);

  // 10) وسم frontmatter
  const title = (fm.match(/^title:\s*"?(.*?)"?$/m) || [])[1] || "";
  const desc = (fm.match(/^description:\s*"?(.*?)"?$/m) || [])[1] || "";
  const plain = stripHtml(body);
  const words = plain.split(/\s+/).filter(Boolean).length;

  if (!title) add(f, "NO_TITLE", "title مفقود");
  if (title.length > 70) add(f, "LONG_TITLE", `${title.length} حرفًا`);
  if (!desc) add(f, "NO_DESC", "description مفقود");
  if (desc && (desc.length < 120 || desc.length > 165)) add(f, "DESC_LENGTH", `${desc.length} حرفًا`);
  if (words < 300 && !/^compact/m.test(fm)) add(f, "SHORT_CONTENT", `${words} كلمة`);

  // 11) مسافات في نهاية السطر
  const trail = (raw.match(/[ \t]+\n/g) || []).length;
  if (trail) {
    add(f, "TRAILING_SPACE", `${trail} سطرًا`);
    if (FIX) fixed = fixed.replace(/[ \t]+\n/g, "\n");
  }

  if (FIX && fixed !== raw) writeFileSync(f, fixed, "utf8");

  perFile.set(slug, perFile.get(f) || 0);
}

// فحص الصفحات الثابتة (نصوص عربية مكتوبة يدويًا)
const staticPages = readdirSync(PAGES).filter((f) => extname(f) === ".astro").map((f) => join(PAGES, f));
const staticDirs = ["author"].map((d) => join(PAGES, d)).filter((d) => existsSync(d));
for (const d of staticDirs) for (const f of readdirSync(d)) if (extname(f) === ".astro") staticPages.push(join(d, f));

for (const f of staticPages) {
  const raw = readFileSync(f, "utf8");
  const cjk = raw.match(CJK);
  if (cjk) add(f, "CJK_OR_FOREIGN", `محارف دخيلة: ${[...new Set(cjk)].join(" ")}`);
  for (const [bad, good] of Object.entries(SPELL)) {
    if (raw.includes(bad)) add(f, "SPELLING", `«${bad}» ← «${good}»`);
  }
  const hits = AI_ISMS.filter((p) => raw.includes(p));
  if (hits.length) add(f, "AI_PHRASE", hits.join(" | "));
}

// تكرار العناوين والأوصاف بين المقالات
const titles = new Map(), descs = new Map();
for (const f of files) {
  const { fm } = splitFront(readFileSync(f, "utf8"));
  const t = (fm.match(/^title:\s*"?(.*?)"?$/m) || [])[1] || "";
  const d = (fm.match(/^description:\s*"?(.*?)"?$/m) || [])[1] || "";
  if (t) titles.set(t, [...(titles.get(t) || []), f]);
  if (d) descs.set(d, [...(descs.get(d) || []), f]);
}
for (const [t, fs] of titles) if (fs.length > 1) fs.forEach((f) => add(f, "DUPLICATE_TITLE", t.slice(0, 40)));
for (const [d, fs] of descs) if (fs.length > 1) fs.forEach((f) => add(f, "DUPLICATE_DESC", d.slice(0, 40)));

// التقرير
const byRule = {};
for (const i of issues) byRule[i.rule] = (byRule[i.rule] || 0) + 1;

if (JSONOUT) {
  writeFileSync("content-qa-report.json", JSON.stringify({ generatedAt: new Date().toISOString(), files: files.length, total: issues.length, byRule, issues }, null, 2));
}

console.log(`\nملفات مفحوصة: ${files.length} مقالًا + ${staticPages.length} صفحة ثابتة`);
console.log(`إجمالي الملاحظات: ${issues.length}`);
if (issues.length) {
  console.log("\nالتوزيع:");
  for (const [r, n] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) console.log(`  ${r}: ${n}`);
  console.log("\nأول 25 ملاحظة:");
  for (const i of issues.slice(0, 25)) console.log(`  [${i.rule}] ${i.file} — ${i.detail}`);
} else {
  console.log("✓ لا ملاحظات");
}
process.exit(issues.length ? 1 : 0);
