// Builds the favicon set and the downloadable logo files from the JC mark.
//
// Usage: npm run icons
//
// Writes src/app/icon.svg, src/app/apple-icon.png, src/app/favicon.ico and public/brand/*.
// The mark itself matches src/components/brand/logo-mark.tsx; edit both together.
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const LIME = "#c6f432";
const OLIVE = "#4a6600";
const INK = "#0e0e0d";
const PAPER = "#f5f5f0";

// Fine version, for large sizes (same paths as logo-mark.tsx).
const fine = (color, width = 1) => `
  <g fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="miter">
    <path d="M8 28.5V4h36v40H8v-3.5"/>
    <path d="M8 31v5.25a2.6 2.6 0 0 1-5.2 0"/>
    <path d="M18.1 32.4A3.9 3.9 0 1 0 18.1 37.6"/>
  </g>`;

// Heavier version with larger initials, so it still reads at 16 to 32 px.
const bold = (color) => `
  <g fill="none" stroke="${color}" stroke-width="3.4" stroke-linejoin="miter">
    <path d="M11 20V4h33v40H11v-3"/>
    <path d="M11 23v9a4 4 0 0 1-8 0"/>
    <path d="M27.6 24.9A6.5 6.5 0 1 0 27.6 34.1"/>
  </g>`;

// 64x64 dark tile with the mark centred.
const tile = (mark, radius = 14) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${radius}" fill="${INK}"/>
  <g transform="translate(8.5 8)">${mark}</g>
</svg>`;

const plain = (mark, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 60 60">
  ${bg ? `<rect x="-6" y="-6" width="60" height="60" fill="${bg}"/>` : ""}${mark}
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();

// favicon.ico holding PNG images (supported by every current browser).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const iconSvg = tile(bold(LIME));
writeFileSync("src/app/icon.svg", iconSvg + "\n");
// Apple pads and rounds the icon itself, so this one is a full square.
writeFileSync("src/app/apple-icon.png", await png(tile(bold(LIME), 0), 180));
writeFileSync(
  "src/app/favicon.ico",
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(iconSvg, size) })))),
);

mkdirSync("public/brand", { recursive: true });
writeFileSync("public/brand/jc-mark-olive.svg", plain(fine(OLIVE)) + "\n");
writeFileSync("public/brand/jc-mark-lime.svg", plain(fine(LIME)) + "\n");
writeFileSync("public/brand/jc-logo-on-dark.png", await png(plain(fine(LIME), INK), 1024));
writeFileSync("public/brand/jc-logo-on-light.png", await png(plain(fine(OLIVE), PAPER), 1024));

console.log("Icons and brand files written.");
