import { Browser, BrowserContext, Page } from "playwright";
import { normalizeUrl, isSameSite, looksLikeAsset } from "./urls.js";
import { isAllowed, RobotsInfo } from "./robots.js";
import { groupUrlsByPattern } from "./patternGroup.js";
import { pickSamples, CaptureCandidate } from "./captureList.js";

const NAV_LINK_SELECTOR = "header a[href], nav a[href]";
const FOOTER_LINK_SELECTOR = "footer a[href]";

// Footer links pointing at legal/utility boilerplate aren't a distinct page
// template worth documenting, even though they're same-site and reachable —
// filtered out by path or link text before they ever reach discovery.
const FOOTER_UTILITY_DENYLIST = [
  /privacy/i,
  /cookie/i,
  /terms/i,
  /imprint/i,
  /accessibility/i,
  /sitemap/i,
  /legal/i,
  /disclaimer/i,
  /gdpr/i,
];

export interface FilterContext {
  rootHost: string;
  robots: RobotsInfo;
  userAgent: string;
  localePrefix: string | null;
}

export interface DiscoveryFailure {
  url: string;
  error: string;
}

export interface ListingResult {
  sourceUrls: string[];
  pattern: string;
  allUrls: string[];
  sampledUrls: string[];
}

interface RawListingGroup {
  sourceUrl: string;
  pattern: string;
  urls: string[];
}

export interface NavDiscoveryResult {
  navFooterPages: string[];
  listings: ListingResult[];
  failures: DiscoveryFailure[];
}

// The same normalize -> same-site -> not-an-asset -> robots-allowed ->
// locale-match chain used throughout crawl.ts, in one place so nav
// discovery and listing detection don't each carry their own copy.
export function filterCandidateUrl(raw: string, baseUrl: string, ctx: FilterContext): string | null {
  const normalized = normalizeUrl(raw, baseUrl);
  if (!normalized) return null;
  if (!isSameSite(normalized, ctx.rootHost)) return null;
  if (looksLikeAsset(normalized)) return null;
  if (!isAllowed(ctx.robots, normalized, ctx.userAgent)) return null;
  if (ctx.localePrefix) {
    const first = new URL(normalized).pathname.split("/").filter(Boolean)[0];
    if (first && /^[a-z]{2}(-[a-z]{2})?$/i.test(first) && first.toLowerCase() !== ctx.localePrefix) return null;
  }
  return normalized;
}

async function extractLinks(page: Page, selector: string): Promise<{ href: string; text: string }[]> {
  return page.$$eval(selector, (els) =>
    els.map((el) => ({ href: (el as HTMLAnchorElement).href, text: el.textContent?.trim() ?? "" })),
  );
}

function isFooterUtilityLink(link: { href: string; text: string }): boolean {
  let pathname = "";
  try {
    pathname = new URL(link.href).pathname;
  } catch {
    // no-op: an unparseable href still gets checked against the link text below
  }
  return FOOTER_UTILITY_DENYLIST.some((re) => re.test(pathname) || re.test(link.text));
}

export async function discoverNavAndFooterPages(
  context: BrowserContext,
  startUrl: string,
  ctx: FilterContext,
): Promise<{ urls: string[]; failures: DiscoveryFailure[] }> {
  const failures: DiscoveryFailure[] = [];
  const urls = new Set<string>();

  const start = normalizeUrl(startUrl, startUrl);
  if (start) urls.add(start);

  const page = await context.newPage();
  try {
    await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

    const navLinks = await extractLinks(page, NAV_LINK_SELECTOR);
    for (const link of navLinks) {
      const filtered = filterCandidateUrl(link.href, startUrl, ctx);
      if (filtered) urls.add(filtered);
    }

    const footerLinks = await extractLinks(page, FOOTER_LINK_SELECTOR);
    for (const link of footerLinks) {
      if (isFooterUtilityLink(link)) continue;
      const filtered = filterCandidateUrl(link.href, startUrl, ctx);
      if (filtered) urls.add(filtered);
    }
  } catch (e: any) {
    failures.push({ url: startUrl, error: String(e?.message || e) });
  } finally {
    await page.close();
  }

  return { urls: Array.from(urls), failures };
}

// Returns raw groups (no sampling yet) — the same listing is frequently
// linked from many different nav/footer pages (e.g. every product page
// links into the same /legal/[*] set), so sampling has to happen once per
// pattern after merging across all source pages, not once per source page.
async function detectListingPage(
  context: BrowserContext,
  pageUrl: string,
  ctx: FilterContext,
  collapseThreshold: number,
): Promise<{ listings: RawListingGroup[]; failures: DiscoveryFailure[] }> {
  const failures: DiscoveryFailure[] = [];
  const found: RawListingGroup[] = [];
  const page = await context.newPage();

  try {
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Header/nav/footer are identical (or near-identical) on every page of a
    // site, so a page's own chrome links would otherwise always look like a
    // "repeating pattern" and every page would misread as a listing. Only
    // this page's actual content links count toward listing detection.
    const structuralLinks = await extractLinks(page, `${NAV_LINK_SELECTOR}, ${FOOTER_LINK_SELECTOR}`);
    const structuralHrefs = new Set(structuralLinks.map((l) => l.href));

    const links = await extractLinks(page, "a[href]");
    const filtered = new Set<string>();
    for (const link of links) {
      if (structuralHrefs.has(link.href)) continue;
      const candidate = filterCandidateUrl(link.href, pageUrl, ctx);
      if (candidate) filtered.add(candidate);
    }

    const groups = groupUrlsByPattern(Array.from(filtered), collapseThreshold);
    for (const group of groups) {
      if (group.pattern.endsWith("/[*]") && group.urls.length >= collapseThreshold) {
        found.push({ sourceUrl: pageUrl, pattern: group.pattern, urls: group.urls });
      }
    }
  } catch (e: any) {
    failures.push({ url: pageUrl, error: String(e?.message || e) });
  } finally {
    await page.close();
  }

  return { listings: found, failures };
}

export interface DiscoverViaNavOptions {
  collapseThreshold: number;
  sampleSize: number;
}

// Orchestrates the nav+footer-first discovery: one scan of the start page's
// header/nav/footer links, then one listing check per page found there (not
// recursed any further — a sampled detail page never gets crawled itself).
export async function discoverViaNavAndListings(
  browser: Browser,
  startUrl: string,
  ctx: FilterContext,
  opts: DiscoverViaNavOptions,
): Promise<NavDiscoveryResult> {
  const context = await browser.newContext({ userAgent: ctx.userAgent });
  const failures: DiscoveryFailure[] = [];

  try {
    const navResult = await discoverNavAndFooterPages(context, startUrl, ctx);
    failures.push(...navResult.failures);

    const rawListings: RawListingGroup[] = [];
    for (const url of navResult.urls) {
      const listingResult = await detectListingPage(context, url, ctx, opts.collapseThreshold);
      rawListings.push(...listingResult.listings);
      failures.push(...listingResult.failures);
    }

    // The same listing is often linked from many nav/footer pages (every
    // product page links into /legal/[*], for instance) — merge by pattern
    // and sample once from the combined set, instead of once per page that
    // happens to link into it.
    const byPattern = new Map<string, { sourceUrls: Set<string>; urls: Set<string> }>();
    for (const raw of rawListings) {
      let entry = byPattern.get(raw.pattern);
      if (!entry) {
        entry = { sourceUrls: new Set(), urls: new Set() };
        byPattern.set(raw.pattern, entry);
      }
      entry.sourceUrls.add(raw.sourceUrl);
      for (const u of raw.urls) entry.urls.add(u);
    }

    const listings: ListingResult[] = Array.from(byPattern.entries()).map(([pattern, entry]) => {
      const allUrls = Array.from(entry.urls);
      return {
        sourceUrls: Array.from(entry.sourceUrls),
        pattern,
        allUrls,
        sampledUrls: pickSamples(allUrls, opts.sampleSize),
      };
    });

    return { navFooterPages: navResult.urls, listings, failures };
  } finally {
    await context.close();
  }
}

export function buildCaptureListFromNavDiscovery(result: NavDiscoveryResult): CaptureCandidate[] {
  const list: CaptureCandidate[] = [];
  for (const url of result.navFooterPages) {
    list.push({ url, pattern: new URL(url).pathname || "/" });
  }
  for (const listing of result.listings) {
    for (const url of listing.sampledUrls) {
      list.push({ url, pattern: listing.pattern });
    }
  }
  return list;
}
