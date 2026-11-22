// صور 3 و4 للمقال الأول — نفس الهوية، بلا أشخاص، نصوص من عناوين المقال الحقيقية.
import sharp from "sharp";

const OUT = "public/images/blog-post_22";
const G = "#123d35", G2 = "#1d6556", CREAM = "#f6f7f3", SOFT = "#edf3ed";
const FONT = "IBM Plex Sans Arabic, Segoe UI, Tahoma, sans-serif";
const W = 1200, H = 675;

const mark = (x, y, s = 70) => `
  <g transform="translate(${x} ${y})">
    <rect width="${s}" height="${s}" rx="${s * 0.22}" fill="${G}"/>
    <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.26}" fill="none" stroke="${CREAM}" stroke-width="${s * 0.055}"
      stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * s * 0.26 * 0.72).toFixed(1)} ${(2 * Math.PI * s * 0.26).toFixed(1)}"
      transform="rotate(-40 ${s / 2} ${s / 2})"/>
    <circle cx="${s / 2}" cy="${s / 2 + s * 0.25}" r="${s * 0.045}" fill="${CREAM}"/>
  </g>`;

// 3) بطاقة شكر — ثلاثة عناوين حقيقية في إطار موحّد
const img3 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="b3" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#eaf1eb"/><stop offset="100%" stop-color="#dbe8e0"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#b3)"/>
  <rect x="70" y="90" width="${W - 140}" height="${H - 180}" rx="26" fill="#ffffff" opacity="0.72"/>
  <text x="${W - 120}" y="180" font-family="${FONT}" font-size="34" fill="${G2}" text-anchor="end">كلمات شكر للمعلم</text>
  <g font-family="${FONT}" font-size="46" font-weight="700" fill="${G}" text-anchor="end">
    <text x="${W - 120}" y="286">كلمة عن المعلم القدوة:</text>
    <text x="${W - 120}" y="366">كلام عن المعلم شكر:</text>
    <text x="${W - 120}" y="446">كلمة للإذاعة المدرسية:</text>
  </g>
  <g stroke="${G2}" stroke-width="2" opacity="0.2">
    <line x1="180" y1="248" x2="${W - 120}" y2="248"/>
    <line x1="180" y1="328" x2="${W - 120}" y2="328"/>
    <line x1="180" y1="408" x2="${W - 120}" y2="408"/>
  </g>
  <text x="${W - 120}" y="535" font-family="${FONT}" font-size="26" fill="#4d5f58" text-anchor="end">طموح · عبارات وكلمات</text>
  ${mark(110, 470, 66)}
</svg>`;

// 4) بطاقة أرقام/محتوى — تمييز القسم داخل الصفحة
const img4 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${SOFT}"/>
  <circle cx="120" cy="${H - 40}" r="220" fill="${G}" opacity="0.05"/>
  <rect x="0" y="0" width="${W}" height="14" fill="${G}"/>
  <text x="${W - 100}" y="180" font-family="${FONT}" font-size="30" fill="${G2}" text-anchor="end">ماذا تجد في هذه الصفحة؟</text>
  <g font-family="${FONT}" font-size="44" font-weight="700" fill="${G}" text-anchor="end">
    <text x="${W - 100}" y="280">عبارات قصيرة جاهزة للنشر</text>
    <text x="${W - 100}" y="360">كلمات تصلح للتهنئة والمناسبات</text>
    <text x="${W - 100}" y="440">صيغ شكر وتقدير للمعلم</text>
  </g>
  <g fill="${G2}">
    <circle cx="${W - 700}" cy="262" r="7"/><circle cx="${W - 700}" cy="342" r="7"/><circle cx="${W - 700}" cy="422" r="7"/>
  </g>
  <text x="${W - 100}" y="560" font-family="${FONT}" font-size="26" fill="#4d5f58" text-anchor="end">www.fortelese.com</text>
  ${mark(100, 90, 66)}
</svg>`;

await sharp(Buffer.from(img3)).webp({ quality: 88 }).toFile(`${OUT}/3.webp`);
await sharp(Buffer.from(img4)).webp({ quality: 88 }).toFile(`${OUT}/4.webp`);
console.log("images 3,4 written");
