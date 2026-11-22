import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async () => {
  const posts = (await getCollection("articlesEn", ({ data }) => !data.draft)).sort(
    (a, b) => (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0)
  );
  const origin = "https://www.fortelese.com";

  const items = posts
    .map((p) => {
      const url = `${origin}/en/${p.id}/`;
      const date = (p.data.pubDate ?? new Date()).toUTCString();
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(p.data.description)}</description>
      <category>${esc(p.data.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fortelese — English</title>
    <link>${origin}/en/</link>
    <description>English guides on online education, careers and markets.</description>
    <language>en</language>
    <atom:link href="${origin}/en/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
