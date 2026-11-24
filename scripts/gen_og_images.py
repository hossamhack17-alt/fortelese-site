#!/usr/bin/env python3
"""يولّد صورة og لكل صفحة (SVG 1200x630) بلون العلامة وعنوان الصفحة."""
import glob, html, os, re, sys

DIST = sys.argv[1] if len(sys.argv) > 1 else "dist"
OUT = os.path.join(DIST, "og")
os.makedirs(OUT, exist_ok=True)

def slug(path):
    s = re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-")
    return s or "home"

made = 0
for f in glob.glob(os.path.join(DIST, "**", "*.html"), recursive=True):
    raw = open(f, encoding="utf-8", errors="ignore").read()
    t = re.search(r"<title>([^<]*)</title>", raw)
    title = html.unescape((t.group(1) if t else "Fortelese").split("|")[0].strip())[:80]
    rel = "/" + os.path.relpath(f, DIST).replace("\\", "/")
    name = slug(rel.replace(".html", "").replace("/index", "")) + ".svg"
    is_en = "/en/" in rel
    # طول السطر: قسّم العنوان إلى سطرين منطقيين
    words = title.split()
    half = max(1, len(words) // 2)
    l1, l2 = " ".join(words[:half]), " ".join(words[half:])
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" direction="{"ltr" if is_en else "rtl"}">
<rect width="1200" height="630" fill="#123d35"/>
<rect x="0" y="0" width="1200" height="8" fill="#1d6556"/>
<text x="{"72" if is_en else "1128"}" y="110" fill="#8fb3a4" font-family="Segoe UI, Arial, sans-serif" font-size="30" text-anchor={"start" if is_en else "end"}>{"Fortelese · English" if is_en else "طموح"}</text>
<text x="{"72" if is_en else "1128"}" y="300" fill="#ffffff" font-family="Segoe UI, Tahoma, sans-serif" font-size="64" font-weight="700" text-anchor={"start" if is_en else "end"}>{html.escape(l1)}</text>
<text x="{"72" if is_en else "1128"}" y="390" fill="#ffffff" font-family="Segoe UI, Tahoma, sans-serif" font-size="64" font-weight="700" text-anchor={"start" if is_en else "end"}>{html.escape(l2)}</text>
<rect x="{"72" if is_en else "1128"}" y="470" width="120" height="6" fill="#1d6556" transform="{"translate(0,0)" if is_en else "translate(-120,0)"}"/>
</svg>'''
    open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n").write(svg)
    made += 1

print(f"og images: {made}")
