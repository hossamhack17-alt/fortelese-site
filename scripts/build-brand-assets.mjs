// يولّد أيقونات الموقع وog-default.jpg من SVG — بلا نصوص، شكل هندسي فقط.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const GREEN = "#123d35";
const GREEN2 = "#1d6556";
const CREAM = "#f6f7f3";

// علامة: مربع دائري الزوايا + قوس (هلال) + ثلاث نقاط
const markSvg = (size, pad = 0) => {
  const s = size;
  const r = Math.round(s * 0.22);
  const cx = s / 2;
  const cy = s / 2;
  const arcR = s * 0.26;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect width="${s}" height="${s}" rx="${r}" fill="${GREEN}"/>
    <g transform="translate(${pad} ${pad})">
      <circle cx="${cx - pad}" cy="${cy - pad}" r="${arcR}" fill="none" stroke="${CREAM}" stroke-width="${s * 0.055}" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * arcR * 0.72).toFixed(1)} ${(2 * Math.PI * arcR).toFixed(1)}" transform="rotate(-40 ${cx - pad} ${cy - pad})"/>
      <circle cx="${cx - pad}" cy="${(cy - pad) + arcR * 0.95}" r="${s * 0.045}" fill="${CREAM}"/>
      <circle cx="${(cx - pad) - arcR * 0.66}" cy="${(cy - pad) + arcR * 0.66}" r="${s * 0.028}" fill="${GREEN2}" stroke="${CREAM}" stroke-width="${s * 0.012}"/>
      <circle cx="${(cx - pad) + arcR * 0.66}" cy="${(cy - pad) + arcR * 0.66}" r="${s * 0.028}" fill="${GREEN2}" stroke="${CREAM}" stroke-width="${s * 0.012}"/>
    </g>
  </svg>`;
};

async function png(svg, size, out) {
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(out);
  console.log("png", out);
}

const P = "public/";
await png(markSvg(512), 512, P + "icon-512.png");
await png(markSvg(192), 192, P + "icon-192.png");
await png(markSvg(512, 64), 512, P + "icon-maskable-512.png");
await png(markSvg(180), 180, P + "apple-touch-icon.png");
await png(markSvg(32), 32, P + "favicon.png");

// og-default.jpg — 1200x630
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f2f6f1"/>
      <stop offset="60%" stop-color="#edf3ed"/>
      <stop offset="100%" stop-color="#e5eee8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1050" cy="120" r="240" fill="${GREEN}" opacity="0.05"/>
  <circle cx="1030" cy="560" r="180" fill="${GREEN}" opacity="0.04"/>
  <g transform="translate(96 208) scale(1.0)">
    <rect x="0" y="0" width="150" height="150" rx="33" fill="${GREEN}"/>
    <circle cx="75" cy="75" r="39" fill="none" stroke="${CREAM}" stroke-width="8.2" stroke-linecap="round"
      stroke-dasharray="176 245" transform="rotate(-40 75 75)"/>
    <circle cx="75" cy="112" r="6.7" fill="${CREAM}"/>
    <circle cx="21" cy="101" r="4.2" fill="${GREEN2}" stroke="${CREAM}" stroke-width="1.8"/>
    <circle cx="129" cy="101" r="4.2" fill="${GREEN2}" stroke="${CREAM}" stroke-width="1.8"/>
  </g>
  <g transform="translate(300 210)">
    <rect x="0" y="0" width="180" height="14" rx="7" fill="${GREEN}" opacity="0.85"/>
    <rect x="0" y="46" width="520" height="10" rx="5" fill="${GREEN}" opacity="0.28"/>
    <rect x="0" y="76" width="430" height="10" rx="5" fill="${GREEN}" opacity="0.22"/>
    <rect x="0" y="106" width="480" height="10" rx="5" fill="${GREEN}" opacity="0.22"/>
    <rect x="0" y="152" width="150" height="40" rx="10" fill="${GREEN}" opacity="0.9"/>
  </g>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 86, progressive: true }).toFile(P + "og-default.jpg");
console.log("jpg", P + "og-default.jpg");
