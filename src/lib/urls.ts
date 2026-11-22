/**
 * مصدر وحيد لروابط المقالات.
 * الروابط القديمة على Blogger هي `/YYYY/MM/<slug>.html` — تبقى كما هي حرفيًا
 * (تُخدَم 200 من الموقع الجديد، بلا تحويل 301) لأنها الروابط المفهرسة في جوجل.
 */
export type ArticleLike = {
  id: string;
  data: { oldUrl?: string; pubDate?: Date };
};

const ORIGIN = "https://www.fortelese.com";

/** المسار النسبي الذي يُخدَم فعليًا: /YYYY/MM/slug.html */
export function postPath(article: ArticleLike): string {
  const old = article.data.oldUrl;
  if (old) {
    try {
      const p = new URL(old).pathname;
      if (p && p !== "/") return p;
    } catch {
      /* ignore malformed */
    }
  }
  const d = article.data.pubDate ?? new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const slug = article.id.replace(/\.md$/, "");
  return `/${y}/${m}/${slug}.html`;
}

/** نفس المسار بصيغة params لـ Astro (بلا امتداد .html، لأن format:file يضيفه) */
export function postParams(article: ArticleLike): string {
  return postPath(article).replace(/^\/+/, "").replace(/\.html$/, "");
}

/** رابط مطلق للنطاق (للـ canonical وsitemap) */
export function postUrl(article: ArticleLike): string {
  return ORIGIN + postPath(article);
}
