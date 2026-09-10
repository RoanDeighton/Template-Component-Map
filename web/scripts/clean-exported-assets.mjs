// `public/assets/<site>` is a symlink straight into output/<site> (see
// lib/content.ts) so the crawler's captured screenshots resolve at
// /assets/<site>/..., but `next build`'s static export copies that whole
// symlinked tree verbatim — including the crawler's raw markdown, analysis
// JSON, and failure logs, none of which should be public. This strips the
// exported out/assets/ down to just image files after the build.
import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);
const assetsDir = path.join(import.meta.dirname, "..", "out", "assets");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
    } else if (!IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      fs.unlinkSync(full);
    }
  }
}

if (fs.existsSync(assetsDir)) {
  walk(assetsDir);
  console.log("Cleaned out/assets/ down to image files only.");
}
