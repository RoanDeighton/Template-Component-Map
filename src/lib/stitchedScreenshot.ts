import { Page } from "playwright";
import sharp from "sharp";
import { prepareStitchChrome, restoreStitchChrome, scrollAndWaitStable, settleChromeForSlice } from "./unstickChrome.js";

// How long to wait for scrollHeight to stop changing before moving on, and
// the hard cap regardless — same values validated in ~/code/Sequence.
// Prewarm gets more patience since it's what actually gives network-fed
// widgets time to mount and resolve; the real capture pass just needs to
// not be fooled by a shift that's still mid-flight.
const PREWARM_STABLE_MS = 200;
const PREWARM_MAX_WAIT_MS = 3000;
const SLICE_STABLE_MS = 200;
const SLICE_MAX_WAIT_MS = 1500;

/**
 * Captures a full page by scrolling through it in real, normal-viewport-
 * sized increments and stitching the individual screenshots together,
 * instead of using Playwright's `fullPage: true` option.
 *
 * Why: `fullPage: true` works by rendering the page in one pass at an
 * artificially expanded (page-height-tall) viewport. `position: sticky`
 * elements and scroll-triggered/JS scroll-linked animations resolve their
 * position and reveal state against that fake viewport, not a real one —
 * so they render collapsed, blank, or stuck in their initial state (this is
 * a known, general limitation of Chromium/Playwright/Puppeteer full-page
 * capture, not specific to any one site). A screenshot at a real, normal
 * viewport size is always correct, because it's genuinely how the page
 * would render if a visitor scrolled there. So: scroll for real, in normal
 * viewport-height steps, screenshot each stop normally, stitch after.
 *
 * This also incidentally fixes the horizontal-overflow bug some sites have
 * (a normal screenshot is always exactly viewport-width, unlike fullPage
 * which follows the document's real — sometimes buggily inflated —
 * scrollWidth).
 *
 * Two problems remain with plain real-increment scrolling, both ported
 * from ~/code/Sequence (a sibling full-page-screenshot tool that solved
 * them first — see unstickChrome.ts for the fuller rationale):
 *
 * 1. A `position: fixed`/`sticky` chrome element (nav bar, a floating
 *    "book a tour" pill) gets captured fresh in every slice, since nothing
 *    hides or un-sticks it — it repeats down the stitched image instead of
 *    appearing once, the way a visitor would actually see it.
 * 2. The page's total height is measured once, up front, and never
 *    rechecked. Content that lazy-mounts after that (a below-fold
 *    carousel, a "load more" list) grows the page after slicing has
 *    already been planned against the stale height, which can misalign or
 *    duplicate later slices.
 *
 * Fixed by: a pre-scroll pass (scroll top to bottom once, capturing
 * nothing, waiting for scrollHeight to stabilize at each stop) before the
 * real capture pass, so lazy content gets a chance to mount first and the
 * real pass starts from a settled height; and per-slice chrome-hiding /
 * un-sticking before each screenshot. See unstickChrome.ts.
 */
export async function captureStitchedScreenshot(page: Page, outputPath: string, viewportWidth: number, viewportHeight: number): Promise<void> {
  const MAX_HEIGHT = 20000; // safety cap against pathologically tall pages

  await prepareStitchChrome(page);

  let totalHeight = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), MAX_HEIGHT);

  // Prewarm: scroll the whole page once, capturing nothing, so anything
  // lazy/IntersectionObserver-triggered gets a chance to mount and finish
  // loading before the real capture pass starts — see the module comment.
  let prewarmScrolled = 0;
  while (prewarmScrolled < totalHeight) {
    const target = Math.min(prewarmScrolled, Math.max(0, totalHeight - viewportHeight));
    const measured = await scrollAndWaitStable(page, target, PREWARM_STABLE_MS, PREWARM_MAX_WAIT_MS);
    totalHeight = Math.min(Math.max(totalHeight, measured.totalHeight), MAX_HEIGHT);
    viewportHeight = measured.viewportHeight;
    prewarmScrolled += viewportHeight;
  }
  await scrollAndWaitStable(page, 0, PREWARM_STABLE_MS, PREWARM_MAX_WAIT_MS);

  const slices: { buffer: Buffer; top: number; height: number }[] = [];
  let capturedSoFar = 0;
  let first = true;

  while (capturedSoFar < totalHeight) {
    const scrollTarget = Math.min(capturedSoFar, Math.max(0, totalHeight - viewportHeight));
    const measured = await scrollAndWaitStable(page, scrollTarget, SLICE_STABLE_MS, SLICE_MAX_WAIT_MS);
    totalHeight = Math.min(Math.max(totalHeight, measured.totalHeight), MAX_HEIGHT);
    viewportHeight = measured.viewportHeight;

    // Persistent chrome should show up once, on the first slice, matching
    // what a visitor actually sees on load — hidden on every later slice
    // so it doesn't repeat down the page. A brief settle wait only when
    // something was actually just hidden for the first time, in case the
    // next screenshot would otherwise land before the browser has
    // repainted without it.
    const justHidChrome = await settleChromeForSlice(page, !first);
    if (justHidChrome) await page.waitForTimeout(100);

    // Let scroll-triggered reveals/animations resolve, and wait for any
    // images that just came into view to finish loading, before capturing.
    // Blur-up placeholders report .complete immediately for the tiny
    // placeholder itself, then swap in a full-res src shortly after — so
    // check naturalWidth too (a real decoded image), and re-check once more
    // after a short pause to catch that swap-and-load rather than only the
    // placeholder's own "complete" state.
    await page.waitForTimeout(300);
    await page
      .waitForFunction(() => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0), undefined, { timeout: 3000 })
      .catch(() => {});
    await page.waitForTimeout(300);
    await page
      .waitForFunction(() => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0), undefined, { timeout: 2000 })
      .catch(() => {});

    const offsetWithinShot = capturedSoFar - scrollTarget;
    const sliceHeight = Math.min(viewportHeight - offsetWithinShot, totalHeight - capturedSoFar);
    const shot = await page.screenshot();
    const slice = await sharp(shot).extract({ left: 0, top: offsetWithinShot, width: viewportWidth, height: sliceHeight }).toBuffer();

    slices.push({ buffer: slice, top: capturedSoFar, height: sliceHeight });
    capturedSoFar += sliceHeight;
    first = false;
  }

  // Must happen before anything downstream re-reads the DOM (crawl.ts
  // calls page.content() for page.html right after this function returns)
  // — otherwise the visibility/position overrides applied above would get
  // permanently baked into the saved HTML.
  await restoreStitchChrome(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  await sharp({
    create: { width: viewportWidth, height: Math.max(totalHeight, 1), channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite(slices.map((s) => ({ input: s.buffer, top: s.top, left: 0 })))
    .png()
    .toFile(outputPath);
}
