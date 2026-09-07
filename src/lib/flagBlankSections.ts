import sharp from "sharp";
import { StyleSample } from "./styleSample.js";

export interface BlankSectionFlag {
  path: string;
  classes: string;
  top: number;
  height: number;
  note: string;
}

const TALL_THRESHOLD = 1200; // px — well beyond a normal content block or hero
const LOW_VARIANCE_STDDEV = 45; // rough heuristic — a mostly-blank region with a little text/edge content still reads low; tune per-site if this over/under-flags

/**
 * Flags sections that are unusually tall and render as near-blank/uniform
 * color — the signature of a scroll-hijacked (position: sticky-driven)
 * component whose reveal animation can't be captured by a single full-page
 * screenshot composite (see crawl.ts for why). This doesn't fix the capture;
 * it surfaces the gap so it's visible in the output instead of silently
 * looking like an empty section.
 */
export async function flagBlankSections(screenshotPath: string, samples: StyleSample[]): Promise<BlankSectionFlag[]> {
  const image = sharp(screenshotPath);
  const metadata = await image.metadata();
  const imageHeight = metadata.height ?? 0;
  const imageWidth = metadata.width ?? 0;

  const candidates = samples.filter((s) => s.path.startsWith("main>") && s.height >= TALL_THRESHOLD && s.width > 0);

  const flags: BlankSectionFlag[] = [];
  for (const s of candidates) {
    const top = Math.max(0, s.top);
    const height = Math.min(s.height, imageHeight - top);
    const width = Math.min(s.width, imageWidth);
    if (height <= 0 || width <= 0) continue;

    let stats;
    try {
      stats = await sharp(screenshotPath).extract({ left: 0, top, width, height }).stats();
    } catch {
      continue;
    }

    const maxChannelStdDev = Math.max(...stats.channels.map((c) => c.stdev));
    if (maxChannelStdDev < LOW_VARIANCE_STDDEV) {
      flags.push({
        path: s.path,
        classes: s.classes,
        top: s.top,
        height: s.height,
        note: `${s.height}px tall section renders as near-uniform color (stddev ${maxChannelStdDev.toFixed(1)}) — likely a scroll-driven/sticky component whose content can't be captured by a static full-page screenshot. Check page.html for this section's actual markup.`,
      });
    }
  }

  return flags;
}
