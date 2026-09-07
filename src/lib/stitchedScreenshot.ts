import { Page } from "playwright";
import sharp from "sharp";

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
 * scrollWidth) and replaces the need for a separate lazy-image-loading
 * scroll pass, since this is already scrolling through in real increments.
 */
export async function captureStitchedScreenshot(page: Page, outputPath: string, viewportWidth: number, viewportHeight: number): Promise<void> {
  const MAX_HEIGHT = 20000; // safety cap against pathologically tall pages
  const totalHeight = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), MAX_HEIGHT);

  const slices: { buffer: Buffer; top: number; height: number }[] = [];
  let capturedSoFar = 0;

  while (capturedSoFar < totalHeight) {
    const scrollTarget = Math.min(capturedSoFar, Math.max(0, totalHeight - viewportHeight));
    await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);

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
  }

  await page.evaluate(() => window.scrollTo(0, 0));

  await sharp({
    create: { width: viewportWidth, height: Math.max(totalHeight, 1), channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite(slices.map((s) => ({ input: s.buffer, top: s.top, left: 0 })))
    .png()
    .toFile(outputPath);
}
