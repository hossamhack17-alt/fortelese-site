// Worker: تحويل المضيفات القديمة إلى www.fortelese.com
// يعمل فقط على النطاقات الفرعية المسجّلة في routes (www وapex لا يمرّان من هنا).

const CANONICAL = "https://www.fortelese.com";

// نطاقات ميتة → نفس المسار على النطاق الرسمي
const TO_CANONICAL = new Set([
  "so.fortelese.com",
  "ma.fortelese.com",
  "a.fortelese.com",
  "ea.fortelese.com",
  "anera.fortelese.com",
  "newsletter.fortelese.com",
  "gazateam.fortelese.com",
  "mo.fortelese.com",
]);

// نطاقات إلى القسم الإنجليزي
const TO_ENGLISH = new Set(["ar.fortelese.com", "hilal.fortelese.com"]);

// خريطة oxfam: كل رابط إلى مقاله في /en/ وإلا فهرس /oxfam
const OXFAM_MAP = {
 "/2026/07/affordable-accredited-best-online-mba.html": "/en/affordable-accredited-best-online-mba",
 "/2025/04/best-online-mba-programs-in-2025.html": "/en/best-online-mba-programs-in-2025",
 "/2026/07/best-online-mba-programs-in-usa-for.html": "/en/best-online-mba-programs-in-usa-for",
 "/2025/02/bitcoin-trading-predictions-for-2023.html": "/en/bitcoin-trading-predictions-for-2023",
 "/2026/07/climbing-ladder-best-flexible-online.html": "/en/climbing-ladder-best-flexible-online",
 "/2025/02/cryptocurrency-trading-and-its-future.html": "/en/cryptocurrency-trading-and-its-future",
 "/2026/07/executive-edge-comprehensive-guide-to.html": "/en/executive-edge-comprehensive-guide-to",
 "/2026/07/fast-track-your-career-fastest-1-year.html": "/en/fast-track-your-career-fastest-1-year",
 "/2025/04/fastest-online-mba-programs-get-your.html": "/en/fastest-online-mba-programs-get-your",
 "/2025/04/ivy-league-online-mba-is-it-worth-it.html": "/en/ivy-league-online-mba-is-it-worth-it",
 "/2026/07/marketing-mastery-from-home-everything.html": "/en/marketing-mastery-from-home-everything",
 "/2026/07/masters-online-courses-comprehensive.html": "/en/masters-online-courses-comprehensive",
 "/2026/07/no-gmat-no-problem-ultimate-guide-to.html": "/en/no-gmat-no-problem-ultimate-guide-to",
 "/2025/04/no-gmat-online-mba-universities-that.html": "/en/no-gmat-online-mba-universities-that",
 "/2025/04/online-mba-for-working-professionals.html": "/en/online-mba-for-working-professionals",
 "/2025/04/online-mba-in-finance-best-schools.html": "/en/online-mba-in-finance-best-schools",
 "/2025/04/online-mba-in-marketing-what-you-need.html": "/en/online-mba-in-marketing-what-you-need",
 "/2025/04/online-mba-vs-traditional-mba-pros-cons.html": "/en/online-mba-vs-traditional-mba-pros-cons",
 "/2026/07/the-finance-accelerator-strategic-guide.html": "/en/the-finance-accelerator-strategic-guide",
 "/2026/07/the-ivy-league-at-your-fingertips-are.html": "/en/the-ivy-league-at-your-fingertips-are",
 "/2025/04/top-affordable-online-mba-programs.html": "/en/top-affordable-online-mba-programs"
};
const OXFAM_FALLBACK = "/en";

function redirect(location, status = 301) {
  return new Response(null, { status, headers: { location, "cache-control": "public, max-age=3600" } });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    if (TO_CANONICAL.has(host)) {
      // تحقق سريع: إن لم يكن المسار موجودًا على النطاق الرسمي، اذهب إلى فهرس التصنيفات
      const candidate = CANONICAL + url.pathname + url.search;
      try {
        const probe = await fetch(candidate, { method: "GET", redirect: "manual" });
        if (probe.status >= 400) return redirect(CANONICAL + "/categories");
      } catch (e) {
        // عند فشل التحقق نُكمل بالتحويل العادي
      }
      return redirect(candidate);
    }

    if (TO_ENGLISH.has(host)) {
      return redirect(`${CANONICAL}/en?from=${encodeURIComponent(host.split(".")[0])}`);
    }

    if (host === "oxfam.fortelese.com") {
      const key = url.pathname.replace(/\/+$/, "") || "/";
      const target = OXFAM_MAP[key] || OXFAM_MAP[key + ".html"] || OXFAM_FALLBACK;
      return redirect(CANONICAL + target);
    }

    // أي نطاق فرعي آخر: إلى الرئيسية بدل الظهور كخطأ
    return redirect(CANONICAL + url.pathname + url.search);
  },
};
