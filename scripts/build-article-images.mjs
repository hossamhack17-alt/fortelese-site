// يولّد صورتين لمقال «كلمات جميلة عن المعلم» — نص عربي من المقال نفسه، بلا أشخاص.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "public/images/blog-post_22";
mkdirSync(OUT, { recursive: true });

const G = "#123d35", G2 = "#1d6556", CREAM = "#f6f7f3", SOFT = "#edf3ed";
const FONT = "IBM Plex Sans Arabic, Segoe UI, Tahoma, sans-serif";
const W = 1200, H = 675;

const mark = (x, y, s = 74) => `
  <g transform="translate(${x} ${y})">
    <rect width="${s}" height="${s}" rx="${s * 0.22}" fill="${G}"/>
    <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.26}" fill="none" stroke="${CREAM}" stroke-width="${s * 0.055}"
      stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * s * 0.26 * 0.72).toFixed(1)} ${(2 * Math.PI * s * 0.26).toFixed(1)}"
      transform="rotate(-40 ${s / 2} ${s / 2})"/>
    <circle cx="${s / 2}" cy="${s / 2 + s * 0.25}" r="${s * 0.045}" fill="${CREAM}"/>
  </g>`;

// 1) الغلاف
const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${SOFT}"/><stop offset="65%" stop-color="#e9f0ea"/><stop offset="100%" stop-color="#dfeae3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="${W - 90}" cy="120" r="230" fill="${G}" opacity="0.055"/>
  <circle cx="${W - 210}" cy="${H - 40}" r="150" fill="${G}" opacity="0.045"/>
  ${mark(96, 92, 84)}
  <text x="${W - 92}" y="150" font-family="${FONT}" font-size="30" fill="${G2}" text-anchor="end" opacity="0.9">طموح · عبارات وكلمات</text>
  <text x="${W - 92}" y="300" font-family="${FONT}" font-size="76" font-weight="700" fill="${G}" text-anchor="end">كلمات جميلة</text>
  <text x="${W - 92}" y="392" font-family="${FONT}" font-size="76" font-weight="700" fill="${G}" text-anchor="end">عن المعلم</text>
  <rect x="${W - 470}" y="430" width="378" height="10" rx="5" fill="${G}" opacity="0.25"/>
  <rect x="${W - 380}" y="458" width="288" height="10" rx="5" fill="${G}" opacity="0.18"/>
  <text x="${W - 92}" y="560" font-family="${FONT}" font-size="28" fill="#4d5f58" text-anchor="end">عبارات ملهمة · كلمات شكر · كلمة للإذاعة</text>
</svg>`;

// 2) بطاقة اقتباس/مشاركة — عناوين حقيقية من المقال
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${G}"/>
  <circle cx="120" cy="80" r="200" fill="#ffffff" opacity="0.035"/>
  <circle cx="${W - 60}" cy="${H - 30}" r="180" fill="#ffffff" opacity="0.03"/>
  <text x="${W - 90}" y="140" font-family="${FONT}" font-size="34" fill="${CREAM}" text-anchor="end" opacity="0.85">ما تجده داخل الصفحة</text>
  <g font-family="${FONT}" font-size="42" fill="${CREAM}" text-anchor="end">
    <text x="${W - 90}" y="250">عبارات عن المعلم قصيرة</text>
    <text x="${W - 90}" y="330">كلمة عن المعلم القدوة</text>
    <text x="${W - 90}" y="410">كلام عن المعلم شكر</text>
    <text x="${W - 90}" y="490">كلمة للإذاعة المدرسية</text>
  </g>
  <g stroke="${CREAM}" stroke-width="2" opacity="0.25">
    <line x1="${W - 900}" y1="212" x2="${W - 90}" y2="212"/>
    <line x1="${W - 900}" y1="292" x2="${W - 90}" y2="292"/>
    <line x1="${W - 900}" y1="372" x2="${W - 90}" y2="372"/>
  </g>
  <text x="${W - 90}" y="600" font-family="${FONT}" font-size="26" fill="${CREAM}" text-anchor="end" opacity="0.7">www.fortelese.com</text>
  ${mark(90, H - 150, 70)}
</svg>`;

await sharp(Buffer.from(cover)).webp({ quality: 88 }).toFile(`${OUT}/1.webp`);
await sharp(Buffer.from(cover)).jpeg({ quality: 86 }).toFile(`${OUT}/1.jpg`);
await sharp(Buffer.from(card)).webp({ quality: 88 }).toFile(`${OUT}/2.webp`);
console.log("images written");
