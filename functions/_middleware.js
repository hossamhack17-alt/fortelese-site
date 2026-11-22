// Cloudflare Pages middleware — fortelese.com
// 1) توحيد المضيف: apex → www   2) إزالة باراميترات Blogger القديمة (?m=1)
// 3) تحويل المضيفات القديمة (النطاقات الفرعية) — يعمل فقط بعد ربطها بـ Cloudflare
//    ووصلها بهذا المشروع. الخرائط في functions/_legacy-hosts.json (مولّدة آليًا).
// ملاحظة: لا نُحوّل *.pages.dev الآن كي تبقى نسخة المعاينة قابلة للاختبار.

import legacy from "./_legacy-hosts.json";

const CANONICAL_HOST = "www.fortelese.com";
const APEX_HOST = "fortelese.com";
const PROD_PAGES_HOST = "fortelese-site.pages.dev";

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.hostname === APEX_HOST) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  // 2) اسم الإنتاج على pages.dev → النطاق الرسمي (منع المحتوى المكرر).
  //    نستثني معاينات النشر <hash>.fortelese-site.pages.dev كي تبقى قابلة للاختبار.
  if (url.hostname === PROD_PAGES_HOST) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  // 3) نطاقات فرعية ميتة → نفس المسار على www
  if (Array.isArray(legacy.toCanonical) && legacy.toCanonical.includes(url.hostname)) {
    const dest = new URL(url.pathname + url.search, `https://${CANONICAL_HOST}`);
    return Response.redirect(dest.toString(), 301);
  }

  // 4) oxfam: كل رابط إلى مقاله داخل /en/ وإلا فهرس /oxfam
  if (legacy.oxfam && url.hostname === legacy.oxfam.host) {
    const key = url.pathname.replace(/\/+$/, "") || "/";
    const target = (legacy.oxfam.map && (legacy.oxfam.map[key] || legacy.oxfam.map[key + ".html"])) || legacy.oxfam.fallback;
    return Response.redirect(new URL(target, `https://${CANONICAL_HOST}`).toString(), 301);
  }

  // 5) ar / hilal: إلى قسم اللغة الإنجليزية
  for (const key of ["ar", "hilal"]) {
    if (legacy[key] && url.hostname === legacy[key].host) {
      const dest = new URL(legacy[key].fallback, `https://${CANONICAL_HOST}`);
      dest.searchParams.set("from", key);
      return Response.redirect(dest.toString(), 301);
    }
  }

  const junk = ["m", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
  let dirty = false;
  for (const k of junk) {
    if (url.searchParams.has(k)) { url.searchParams.delete(k); dirty = true; }
  }
  if (dirty) return Response.redirect(url.toString(), 301);

  return next();
}
