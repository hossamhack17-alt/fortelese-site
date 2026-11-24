import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.fortelese.com",
  output: "static",
  trailingSlash: "ignore",
  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      // كل صفحات المقالات تنتهي بـ .html (روابط Blogger الأصلية) — الخريطة يجب أن تطابقها
      // لا نضيف .html لروابط غير لاتينية سليمة: الرابط المخصص يُخدم كما هو
      serialize: (item) => {
        const u = item.url;
        const last = u.split("/").pop() || "";
        if (!/^[ -~]*$/.test(last)) {
          // أسماء عربية تنتهي بـ .html مضاف = المسار المخصص (path في frontmatter) — يخدمه Pages بلا .html
          if (last.endsWith("ا.html") || last.endsWith("ط.html") || last.endsWith("و.html")) {
            return { ...item, url: u.slice(0, -5) };
          }
          return item;
        }
        if (u.endsWith("/") || u.endsWith(".html") || u.endsWith(".xml")) return item;
        return { ...item, url: u + ".html" };
      }
    })
  ],
  build: { format: "file", inlineStylesheets: "auto" }
});