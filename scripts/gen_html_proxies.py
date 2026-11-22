#!/usr/bin/env python3
"""يولّد public/_redirects: قاعدة 200-proxy لكل ملف .html في dist.

سبب الوجود: Cloudflare Pages يحذف امتداد .html بحالة 308 قبل تحليل الأصول،
فتفقد روابط Blogger المفهرسة (/YYYY/MM/<slug>.html) حالتها 200.
قاعدة 200-proxy تُعيد الخدمة على المسار نفسه بحالة 200.

الاستخدام:
    python scripts/gen_html_proxies.py dist public/_redirects
"""
import glob
import os
import sys
import urllib.parse

dist = sys.argv[1] if len(sys.argv) > 1 else "dist"
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join("public", "_redirects")

# مصادر ميتة يُعاد توجيهها 301 إلى أقرب صفحة قائمة
LEGACY_301 = [
    ("/عبارات-تحفيزية", "/categories/phrases.html"),
    ("/أمثال-شعبية", "/categories/knowledge.html"),
]

htmls = sorted(
    "/" + os.path.relpath(p, dist).replace("\\", "/")
    for p in glob.glob(os.path.join(dist, "**", "*.html"), recursive=True)
)

lines = [
    "# Cloudflare Pages يحذف امتداد .html بـ 308 — لذلك نُظهر كل ملف .html كـ 200 على مساره الأصلي.",
    "# مولّد آليًا عبر scripts/gen_html_proxies.py — لا تُحرّره يدويًا.",
    "",
]
count = 0
for rel in htmls:
    if rel == "/index.html":
        continue
    if rel.endswith("/index.html"):
        dst = rel[: -len("index.html")]
    else:
        dst = rel[: -len(".html")]
    lines.append(f"{rel}  {dst}  200")
    count += 1

# تحويلات الأرشيف القديم (من Wayback) — تُقرأ من data/legacy-redirects.tsv
legacy_file = os.path.join("data", "legacy-redirects.tsv")
legacy_count = 0
if os.path.exists(legacy_file):
    proxy_srcs = {ln.split()[0] for ln in lines if ln.endswith("200")}
    for ln in open(legacy_file, encoding="utf-8"):
        ln = ln.strip()
        if not ln or ln.startswith("#"):
            continue
        src = ln.split()[0]
        if src in proxy_srcs:      # المسار الحالي يخدم 200 — لا نكسره بتحويل
            continue
        lines.append(ln)
        legacy_count += 1

# قواعد إضافية (نهايات مائلة للأقسام الإنجليزية)
extra_file = os.path.join("data", "extra-redirects.tsv")
if os.path.exists(extra_file):
    for ln in open(extra_file, encoding="utf-8"):
        ln = ln.strip()
        if ln and not ln.startswith("#"):
            lines.append(ln)

lines.append("")
for src, dst in LEGACY_301:
    lines.append(f"{urllib.parse.quote(src)}  {dst}  301")

os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
with open(out, "w", encoding="utf-8", newline="\n") as fh:
    fh.write("\n".join(lines) + "\n")
print(f"wrote {out}: {count} proxies + {legacy_count} legacy 301 + {len(LEGACY_301)} manual 301")
