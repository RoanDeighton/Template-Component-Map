import sharp from "sharp";

/**
 * Crops a screenshot PNG to a fixed width (keeping full height), in-place.
 * Used to fix pages with real horizontal-overflow layout bugs where the
 * document is wider than the intended viewport, without touching the page's
 * own rendering (see crawl.ts for why we don't fix this via viewport resize
 * or injected CSS). A no-op if the image is already at or under that width.
 */
export async function cropToWidth(filePath: string, width: number): Promise<void> {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  if (!metadata.width || metadata.width <= width) return;
  const buffer = await image.extract({ left: 0, top: 0, width, height: metadata.height! }).toBuffer();
  await sharp(buffer).toFile(filePath);
}
