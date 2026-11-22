"""تطبيع طباعي آمن للنصوص العربية داخل ملفات المقالات (لا يمسّ الوسوم ولا الكلمات)."""
import re
import glob

AR = r"\u0621-\u064A"


def clean(t: str) -> str:
    t = re.sub(r"[ \t]{2,}", " ", t)                        # مسافات مزدوجة
    t = re.sub(r"[ \t\u00a0]+([،؛؟!])", r"\1", t)           # مسافة قبل ترقيم
    t = re.sub(r"([" + AR + r"])([،؛؟])(?=[" + AR + r"])", r"\1\2 ", t)  # مسافة بعد ترقيم
    return t


def walk(match: re.Match) -> str:
    return match.group(1) + clean(match.group(2))


changed = []
for p in sorted(glob.glob("src/content/articles/*.md")):
    s = open(p, encoding="utf-8").read()
    n = re.sub(r"(^|>)([^<]+)(?=<|$)", walk, s, flags=re.M)
    if n != s:
        open(p, "w", encoding="utf-8", newline="\n").write(n)
        changed.append(p.replace("\\", "/").split("/")[-1])

print("files changed:", len(changed))
for c in changed:
    print(" -", c)
