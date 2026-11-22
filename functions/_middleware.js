// Cloudflare Pages middleware — طموح
// 1) توحيد المضيف: apex → www   2) إزالة باراميترات Blogger القديمة (?m=1)
// ملاحظة: لا نُحوّل *.pages.dev الآن كي تبقى نسخة المعاينة قابلة للاختبار.
// عند الانتقال النهائي: أضف شرط pages.dev → www هنا.

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

  const junk = ["m", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
  let dirty = false;
  for (const k of junk) {
    if (url.searchParams.has(k)) { url.searchParams.delete(k); dirty = true; }
  }
  if (dirty) return Response.redirect(url.toString(), 301);

  return next();
}
