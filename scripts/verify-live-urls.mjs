#!/usr/bin/env node
/** يتحقق من الروابط الـ32 على الموقع الحي (بعد النشر). */
import { readFileSync } from "node:fs";

const list = JSON.parse(readFileSync("..\\gsc-urls.json", "utf8").replace(/^\uFEFF/, ""));
const ORIGIN = "https://www.fortelese.com";

async function check(path) {
  const url = ORIGIN + path;
  const hops = [];
  let current = url;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(current, { redirect: "manual" });
    hops.push(r.status);
    if (r.status === 301 || r.status === 302) {
      const loc = r.headers.get("location");
      current = loc.startsWith("http") ? loc : ORIGIN + loc;
      continue;
    }
    return { path, status: r.status, final: current.replace(ORIGIN, ""), hops };
  }
  return { path, status: -1, final: "", hops };
}

const rows = [];
for (const u of list) {
  rows.push(await check(u.replace(ORIGIN, "") || "/"));
}

let ok = 0;
for (const r of rows) {
  const pass = r.status === 200;
  if (pass) ok++;
  console.log(`${pass ? "OK " : "FAIL"} ${String(r.status).padEnd(3)} ${r.path}  [${r.hops.join(">")}] → ${r.final}`);
}
console.log(`\n${ok}/${rows.length} على الموقع الحي`);
process.exit(ok === rows.length ? 0 : 1);
