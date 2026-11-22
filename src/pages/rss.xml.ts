import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../data/site";
import { postUrl } from "../lib/urls";

export const GET: APIRoute = async () => {
  const articles = (await getCollection("articles", ({ data }) => !data.draft)).sort(
    (a, b) => (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0)
  );

  const items = articles
    .map((a) => {
      const url = postUrl(a);
      const date = a.data.pubDate ? new Date(a.data.pubDate).toUTCString() : new Date().toUTCString();
      return `    <item>
      <title>${escapeXml(a.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(a.data.description)}</description>
      <category>${escapeXml(a.data.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}/</link>
    <description>${escapeXml(site.description)}</description>
    <language>ar</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
