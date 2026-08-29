/**
 * Génère les variantes hashées de /public/fond.jpg (centre turquoise).
 * Usage : node scripts/optimize-hero.mjs
 */
import { createHash } from "node:crypto";
import { readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SRC = "public/fond.jpg";
const PUBLIC_DIR = "public";
const CROP = "centre";

function hashBuffer(buffer) {
  return createHash("sha1").update(buffer).digest("hex").slice(0, 8);
}

function writeHashed(prefix, ext, buffer) {
  const hash = hashBuffer(buffer);
  const file = `${prefix}.${hash}.${ext}`;
  writeFileSync(join(PUBLIC_DIR, file), buffer);
  return `/${file}`;
}

for (const name of readdirSync(PUBLIC_DIR)) {
  if (
    /^(fond-hero|fond-hero-sm|fond-lqip)(\.[a-f0-9]{8})?\.(webp|avif|jpg|jpeg)$/.test(
      name,
    )
  ) {
    unlinkSync(join(PUBLIC_DIR, name));
  }
}

const colorSample = await sharp(SRC)
  .rotate()
  .resize(1920, 1080, { fit: "cover", position: CROP })
  .resize(1, 1, { fit: "cover" })
  .raw()
  .toBuffer();

const [r, g, b] = colorSample;
const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;

const lqip = await sharp(SRC)
  .rotate()
  .resize(48, 32, { fit: "cover", position: CROP })
  .blur(2)
  .jpeg({ quality: 50, mozjpeg: true })
  .toBuffer();

async function jpegVariant(width, height, quality) {
  return sharp(SRC)
    .rotate()
    .resize(width, height, { fit: "cover", position: CROP })
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

const desktop = await jpegVariant(2048, 1152, 90);
const mobile = await jpegVariant(1080, 1920, 88);

const assets = {
  color: hex,
  lqip: writeHashed("fond-lqip", "jpg", lqip),
  desktop: writeHashed("fond-hero", "jpg", desktop),
  mobile: writeHashed("fond-hero-sm", "jpg", mobile),
};

writeFileSync(
  "src/lib/hero-assets.ts",
  `/** Généré par scripts/optimize-hero.mjs — ne pas éditer à la main. */
export const HERO_COLOR = ${JSON.stringify(assets.color)};
export const HERO_LQIP = ${JSON.stringify(assets.lqip)};
export const HERO_DESKTOP = ${JSON.stringify(assets.desktop)};
export const HERO_MOBILE = ${JSON.stringify(assets.mobile)};
`,
);

console.log(
  JSON.stringify(
    {
      assets,
      sizes: { desktop: desktop.length, mobile: mobile.length, lqip: lqip.length },
      color: hex,
    },
    null,
    2,
  ),
);
