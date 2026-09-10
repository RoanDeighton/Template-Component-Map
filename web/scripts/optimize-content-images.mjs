// The crawler's captured screenshots are full-resolution PNGs — several
// MB each, some over 10MB — and until now the content pages loaded them
// as-is. This generates a compressed WebP sibling (same directory, same
// basename) for every image over a size threshold; lib/content.ts's
// resolveAssetSrc() then points at the sibling instead of the original
// whenever one exists. Runs before both `next dev` and `next build` (see
// package.json), same as generate-thumbnails.mjs.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUTPUT_ROOT = path.resolve(import.meta.dirname, "..", "..", "output");
const MAX_WIDTH = 1600;
const MIN_SOURCE_BYTES = 150 * 1024; // skip images already small enough
const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".thumbnails") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

async function optimizeSite(site) {
  const pagesDir = path.join(OUTPUT_ROOT, site, "pages");
  if (!fs.existsSync(pagesDir)) return;

  for (const sourcePath of walk(pagesDir)) {
    if (!SOURCE_EXTENSIONS.has(path.extname(sourcePath).toLowerCase())) continue;
    const sourceStat = fs.statSync(sourcePath);
    if (sourceStat.size < MIN_SOURCE_BYTES) continue;

    const webpPath = sourcePath.replace(/\.(png|jpe?g)$/i, ".webp");
    if (fs.existsSync(webpPath) && fs.statSync(webpPath).mtimeMs >= sourceStat.mtimeMs) continue;

    await sharp(sourcePath).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 75 }).toFile(webpPath);
    const savedKb = Math.round((sourceStat.size - fs.statSync(webpPath).size) / 1024);
    console.log(`  ${path.relative(OUTPUT_ROOT, sourcePath)} → .webp (-${savedKb}KB)`);
  }
}

if (fs.existsSync(OUTPUT_ROOT)) {
  console.log("Optimizing large content images...");
  for (const site of fs.readdirSync(OUTPUT_ROOT, { withFileTypes: true })) {
    if (site.isDirectory()) await optimizeSite(site.name);
  }
}
