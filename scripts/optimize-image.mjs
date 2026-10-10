// Turns one full-size screenshot or logo into the AVIF + WebP files the site serves.
//
// Usage:
//   npm run image -- <source> <output-folder> <name> [max-width]
//
// Example:
//   npm run image -- ~/Desktop/orders.png public/projects/weblanda screen-orders
//
// Writes <output-folder>/<name>-<width>.avif and .webp for each width in WIDTHS up to the
// image's own width (or max-width), and prints the values to paste into src/content.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const WIDTHS = [400, 560, 800, 1024, 1440, 1920];
const [src, outDir, name, maxArg] = process.argv.slice(2);

if (!src || !outDir || !name) {
  console.error("Usage: npm run image -- <source> <output-folder> <name> [max-width]");
  process.exit(1);
}

const { width, height } = await sharp(src).metadata();
const cap = Math.min(width, maxArg ? Number(maxArg) : Infinity);
const widths = WIDTHS.filter((w) => w < cap);
widths.push(cap);

mkdirSync(outDir, { recursive: true });
for (const w of widths) {
  const img = sharp(src).resize({ width: w, withoutEnlargement: true });
  await img
    .clone()
    .avif({ quality: 55, effort: 6 })
    .toFile(join(outDir, `${name}-${w}.avif`));
  await img
    .clone()
    .webp({ quality: 78 })
    .toFile(join(outDir, `${name}-${w}.webp`));
}

const dir =
  "/" +
  outDir
    .replace(/\\/g, "/")
    .replace(/^public\//, "")
    .replace(/\/$/, "");
console.log(`Wrote ${widths.length * 2} files. Add this to the project's screenshots in src/content:\n`);
console.log(
  `{ dir: "${dir}", name: "${name}", widths: [${widths.join(", ")}], width: ${width}, height: ${height}, alt: "", caption: "", device: "desktop" }`,
);
