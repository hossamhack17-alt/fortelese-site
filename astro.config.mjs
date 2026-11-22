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
      serialize: (item) => {
        const u = item.url;
        if (u.endsWith("/") || u.endsWith(".html") || u.endsWith(".xml")) return item;
        const last = u.split("/").pop() || "";
        if (u.includes("%") || !/^[ -~]*$/.test(last)) return item;
        return { ...item, url: u + ".html" };
      }
    })
  ],
  build: { format: "file" }
});