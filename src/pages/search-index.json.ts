import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { postPath } from "../lib/urls";

export const GET: APIRoute = async () => {
  const articles = await getCollection("articles", ({ data }) => !data.draft);

  const index = articles
    .sort((a, b) => (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0))
    .map((a) => {
      const body = typeof a.body === "string" ? a.body : "";
      const text = body
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 400);
      return {
        t: a.data.title,
        d: a.data.description,
        u: postPath(a),
        c: a.data.category,
        s: text
      };
    });

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
};
