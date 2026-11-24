#!/usr/bin/env node
/**
 * يتحقق من كل رابط في gsc-urls.json على خادم محلي يقرأ _redirects فعليًا.
 * التشغيل: node scripts/verify-gsc-urls.mjs [port]
 */
import { readFileSync, existsSync } from "node:fs";

const PORT = process.argv[2] || "8794";
const list = JSON.parse(readFileSync("..\\gsc-urls.json", "utf8").replace(/^\uFEFF/, ""));

const rows = [];
for (const u of list) {
  const path = u.replace("https://www.fortelese.com", "") || "/";
  const encoded = encodeURI(path);
  let status = 0, final = "", hops = [];
  try {
    let url = `http://127.0.0.1:${PORT}${encoded}`;
    for (let i = 0; i < 6; i++) {
      const r = await fetch(url, { redirect: "manual" });
      hops.push(r.status);
      if (r.status === 301 || r.status === 302) {
        const loc = r.headers.get("location") || "";
        url = loc.startsWith("http") ? loc : `http://127.0.0.1:${PORT}${loc}`;
        continue;
      }
      status = r.status;
      final = url.replace(`http://127.0.0.1:${PORT}`, "");
      break;
    }
  } catch (e) {
    status = -1;
  }
  rows.push({ path, status, final, hops });
}

let ok = 0;
const expected301 = new Set(["/2025/01/siprogut-0-3-why-it-is-used.html", "/category/real-estate/"]);
for (const r of rows) {
  const pass = r.status === 200 || (expected301.has(r.path) && r.hops[0] === 301);
  if (pass) ok++;
  console.log(`${pass ? "OK " : "FAIL"} ${String(r.status).padEnd(3)} ${r.path}  hops=${r.hops.join(">")}  → ${r.final}`);
}
console.log(`\n${ok}/${rows.length} روابط صحيحة`);
process.exit(ok === rows.length ? 0 : 1);
