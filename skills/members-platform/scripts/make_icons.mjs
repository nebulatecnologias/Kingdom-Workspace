// Favicon, app icons and social sharing images from one square logo (PNG or JPG, ideally 1080 px or more).
//
//   node scripts/make_icons.mjs <logo.png> <members/app/src/app> [--crop 0.6]
//
// Run it from the app folder after `npm install` (it uses sharp, which Next.js already installs).
// Writes, using the Next.js metadata file conventions (no code changes needed):
//   favicon.ico (16/32/48 px, RGBA PNG entries — Next's build rejects RGB ones) and icon.png (512 px):
//     a centred crop (--crop, default 0.6 of the side) so a small mark stays readable in a browser tab;
//   apple-icon.png (180 px): the full artwork;
//   opengraph-image.png and twitter-image.png: the full artwork, with .alt.txt files.
// Root layout metadata should set metadataBase and twitter.card "summary" for a square image.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
const sharp = require("sharp");

const [src, out, ...rest] = process.argv.slice(2);
if (!src || !out) {
  console.error("Usage: node make_icons.mjs <logo.png> <app/src/app> [--crop 0.6]");
  process.exit(1);
}
const cropIdx = rest.indexOf("--crop");
const cropShare = cropIdx >= 0 ? Number(rest[cropIdx + 1]) : 0.6;
const altText = rest.includes("--alt") ? rest[rest.indexOf("--alt") + 1] : "Logo";

const meta = await sharp(src).metadata();
const side = Math.min(meta.width, meta.height);
const cropSide = Math.round(side * cropShare);
const crop = { left: Math.round((meta.width - cropSide) / 2), top: Math.round((meta.height - cropSide) / 2), width: cropSide, height: cropSide };

const tab = (size) => sharp(src).extract(crop).resize(size, size, { kernel: "lanczos3" }).ensureAlpha().png({ compressionLevel: 9 }).toBuffer();
const full = (size) => sharp(src).resize(size, size, { kernel: "lanczos3", fit: "cover" }).png({ compressionLevel: 9 }).toBuffer();

const dir = resolve(out);
writeFileSync(join(dir, "icon.png"), await tab(512));
writeFileSync(join(dir, "apple-icon.png"), await full(180));

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(tab));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
writeFileSync(join(dir, "favicon.ico"), Buffer.concat([header, ...entries, ...images]));

const social = await sharp(src).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(join(dir, "opengraph-image.png"), social);
writeFileSync(join(dir, "twitter-image.png"), social);
writeFileSync(join(dir, "opengraph-image.alt.txt"), altText);
writeFileSync(join(dir, "twitter-image.alt.txt"), altText);
console.log(`Icons written to ${dir}`);
