import { Page } from "playwright";

/**
 * Many sites lazy-load images (blurred low-res placeholder swapped for the
 * real image once it scrolls into view). A screenshot taken right after
 * `goto` often captures those placeholders. This scrolls the full page to
 * trigger any scroll/IntersectionObserver-based loaders, then waits for
 * <img> elements to actually finish loading before returning to the top.
 */
export async function settleLazyImages(page: Page): Promise<void> {
  try {
    const height: number = await page.evaluate(() => document.body.scrollHeight);
    const viewport = page.viewportSize()?.height ?? 900;
    const steps = Math.min(30, Math.max(1, Math.ceil(height / viewport)));

    for (let i = 0; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((i * height) / steps));
      await page.waitForTimeout(150);
    }

    await page
      .waitForFunction(() => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0), undefined, { timeout: 5000 })
      .catch(() => {});

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
  } catch {
    // Best-effort only; proceed to screenshot regardless.
  }
}
