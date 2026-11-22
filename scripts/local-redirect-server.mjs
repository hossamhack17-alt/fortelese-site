// خادم تحقق محلي: يقرأ dist/_redirects ويطبّق القواعد تمامًا كما يفعل Cloudflare Pages.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "dist";
const rules = readFileSync(join(ROOT, "_redirects"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split(/\s+/))
  .filter((p) => p.length >= 3);

const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".ico": "image/x-icon" };

function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname.split("?")[0]);
  const cands = [clean, clean + ".html", join(clean, "index.html"), clean + "/index.html"];
  for (const c of cands) {
    const p = join(ROOT, c);
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const path = url.pathname;

  for (const [from, to, code] of rules) {
    if (from === path) {
      if (code === "200") {
        const f = resolveFile(to);
        if (f) { res.writeHead(200, { "content-type": mime[extname(f)] || "text/html" }); res.end(readFileSync(f)); return; }
      } else {
        res.writeHead(Number(code), { location: to }); res.end(); return;
      }
    }
  }

  const f = resolveFile(path);
  if (f) { res.writeHead(200, { "content-type": mime[extname(f)] || "text/html" }); res.end(readFileSync(f)); return; }
  const nf = join(ROOT, "404.html");
  res.writeHead(404, { "content-type": "text/html" });
  res.end(existsSync(nf) ? readFileSync(nf) : "404");
}).listen(8793, "127.0.0.1", () => console.log("redirect-check server on 8792, rules:", rules.length));
