# fortelese-site — موقع طموح (fortelese.com)

مشروع Astro ثابت لموقع «طموح» العربي، منشور على Cloudflare Pages.

## الحالة الحقيقية (محدّثة 2026-11-22)
- **22 مقالًا مرحّلة** من Blogger إلى `src/content/articles/*.md` (محتوى HTML حرفي من `blogger-export-fortelese.com-2026-11-21.xml`).
- **الروابط القديمة تُخدَم 200 على مساراتها الأصلية**: `/YYYY/MM/<slug>.html` — لا تحويل 301 للمقالات، لأنها روابط مفهرسة في جوجل.
- المصدر الوحيد للروابط: `src/lib/urls.ts` (`postPath` / `postParams` / `postUrl`).
- 38 صفحة في البناء، وsitemap بصيغة `.html`.
- JSON-LD على كل صفحة: `WebSite` + `SearchAction`، وللمقالات `Article` + `BreadcrumbList`.
- RSS على `/rss.xml`، وبحث داخلي على `/search` مع `/search-index.json`.
- PWA: `manifest.webmanifest` + `sw.js` + أيقونات + `og-default.jpg`.
- خطوط عربية محلية في `public/fonts` (IBM Plex Sans Arabic) — لا طلب إلى Google Fonts.
- `_headers` (أمان + كاش) و`functions/_middleware.js` (توحيد apex → www وتنظيف الباراميترات).

## الأوامر
```bash
npm install
npx astro build                        # ينتج dist/
node scripts/check-links.mjs dist      # كشف الروابط الداخلية المكسورة
node scripts/build-brand-assets.mjs    # إعادة توليد الأيقونات والـog
```

## النشر (Cloudflare Pages — حساب hossamhack17)
```bash
export XDG_CONFIG_HOME="C:/Users/Administrator/AppData/Roaming/xdg.config"
npx wrangler pages deploy dist --project-name=fortelese-site --branch=main --commit-dirty=true
```
- المشروع: `fortelese-site` (account `a62a648e…`)، النطاق المخصص لاحقًا: `www.fortelese.com`.
- `fortelese.com` ما زال على Blogger؛ ربط النطاق خطوة منفصلة.

## قواعد ثابتة
1. لا تُغيَّر مسارات المقالات المنشورة ولا تُعاد كتابة نصوصها.
2. لا محتوى مُختلق ولا بيانات منظمة عن كيانات أو أشخاص غير موجودين.
3. التصميم الحالي معتمد من المالك — لا تغييرات بصرية بدون طلب صريح.
4. `ads.txt` بلا معرّف ناشر حتى يُؤكَّد حساب AdSense الخاص بهذا الموقع.
5. القرارات الملزمة كلها في `DECISIONS.md`.
