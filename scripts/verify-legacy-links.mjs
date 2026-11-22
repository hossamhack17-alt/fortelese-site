// فحص كامل: كل رابط قديم على oxfam → هل ينتهي بمقال موجود بحالة 200؟
import { readFileSync } from "node:fs";

const map = JSON.parse(readFileSync("functions/_legacy-hosts.json", "utf8")).oxfam.map;
const entries = Object.entries(map);
console.log("عدد الروابط القديمة:", entries.length);

const results = await Promise.all(
  entries.map(async ([oldPath, target]) => {
    const oldUrl = `https://oxfam.fortelese.com${oldPath}`;
    const newUrl = `https://www.fortelese.com${target}`;
    let oldStatus = "?", oldLoc = "";
    let newStatus = 0, finalUrl = "";
    try {
      const r1 = await fetch(oldUrl, { redirect: "manual" });
      oldStatus = r1.status;
      oldLoc = r1.headers.get("location") || "";
    } catch (e) {
      oldStatus = "ERR";
    }
    try {
      const r2 = await fetch(newUrl, { redirect: "follow" });
      newStatus = r2.status;
      finalUrl = r2.url;
    } catch (e) {
      newStatus = 0;
    }
    return { oldPath, target, oldStatus, oldLoc, newStatus, finalUrl };
  })
);

let ok = 0;
const bad = [];
for (const r of results) {
  const good = r.oldStatus === 301 && r.oldLoc.endsWith(r.target) && r.newStatus === 200;
  if (good) ok++;
  else bad.push(r);
}
console.log(`✅ سليم: ${ok}/${results.length}`);
if (bad.length) {
  console.log("❌ مشاكل:");
  for (const b of bad) console.log("  ", b.oldPath, "→", b.target, "| old", b.oldStatus, b.oldLoc, "| new", b.newStatus);
}
