import type { GroupedUrls } from "./patternGroup.js";

export interface CaptureCandidate {
  url: string;
  pattern: string;
}

export function pickSamples<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  const sorted = [...items].sort();
  const step = sorted.length / n;
  const picked: T[] = [];
  for (let i = 0; i < n; i++) {
    picked.push(sorted[Math.floor(i * step)]);
  }
  return picked;
}

export interface BuildCaptureListOptions {
  sampleSize: number;
  pageCap: number;
}

// Every distinct URL shape (unique one-off, or repeating pattern) is a quota
// bucket. Unique groups need only 1 page (fully captured); repeating groups
// want up to sampleSize. We fill round-robin, one page per bucket per round,
// so a page cap smaller than the total desired captures still spreads
// coverage across every distinct shape first rather than exhausting the
// budget on one category (e.g. hundreds of one-off pages) before the other
// (e.g. the site's largest, most important repeating template) gets a look.
export function buildCaptureListFromGroups(groups: GroupedUrls[], opts: BuildCaptureListOptions): CaptureCandidate[] {
  const buckets = groups.map((g) => ({
    pattern: g.pattern,
    pool: g.pattern.endsWith("/[*]") ? pickSamples(g.urls, opts.sampleSize) : g.urls,
    taken: 0,
  }));

  const captureList: CaptureCandidate[] = [];
  let addedThisPass = true;
  while (captureList.length < opts.pageCap && addedThisPass) {
    addedThisPass = false;
    for (const bucket of buckets) {
      if (captureList.length >= opts.pageCap) break;
      if (bucket.taken >= bucket.pool.length) continue;
      captureList.push({ url: bucket.pool[bucket.taken], pattern: bucket.pattern });
      bucket.taken++;
      addedThisPass = true;
    }
  }

  return captureList;
}
