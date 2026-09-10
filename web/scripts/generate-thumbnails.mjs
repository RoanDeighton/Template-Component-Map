// The components table's hover-card preview used the crawler's raw
// screenshots directly — several MBs each, since they're full-page
// captures — so the preview took a long time to appear on hover. This
// generates a small compressed thumbnail per component next to the source
// image (output/<site>/.thumbnails/<slug>.webp), which
// lib/content.ts's getComponentPreviewImage() then points at instead.
// Runs before both `next dev` and `next build` (see package.json) so
// thumbnails exist locally too, not just in the CI build.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const OUTPUT_ROOT = path.resolve(import.meta.dirname, "..", "..", "output");
const THUMBNAIL_WIDTH = 480;

async function generateForSite(site) {
  const componentsDir = path.join(OUTPUT_ROOT, site, "content", "components");
  if (!fs.existsSync(componentsDir)) return;
  const thumbsDir = path.join(OUTPUT_ROOT, site, ".thumbnails");
  fs.mkdirSync(thumbsDir, { recursive: true });

  for (const file of fs.readdirSync(componentsDir)) {
    if (!file.endsWith(".md") || file === "overview.md") continue;
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(componentsDir, file), "utf-8");
    const { data } = matter(raw);
    const src = Array.isArray(data.examples) ? data.examples[0]?.image : null;
    if (!src || /^(https?:)?\/\//.test(src)) continue;

    const sourcePath = path.resolve(componentsDir, src);
    const thumbPath = path.join(thumbsDir, `${slug}.webp`);
    if (!fs.existsSync(sourcePath)) continue;
    if (fs.existsSync(thumbPath) && fs.statSync(thumbPath).mtimeMs >= fs.statSync(sourcePath).mtimeMs) {
      continue;
    }

    await sharp(sourcePath).resize({ width: THUMBNAIL_WIDTH }).webp({ quality: 72 }).toFile(thumbPath);
    console.log(`  ${site}/${slug}.webp`);
  }
}

if (fs.existsSync(OUTPUT_ROOT)) {
  console.log("Generating component preview thumbnails...");
  for (const site of fs.readdirSync(OUTPUT_ROOT, { withFileTypes: true })) {
    if (site.isDirectory()) await generateForSite(site.name);
  }
}
