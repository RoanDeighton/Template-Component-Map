import { Command } from "commander";
import { chromium, Browser } from "playwright";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { loadRobots, isAllowed, RobotsInfo } from "./lib/robots.js";
import { normalizeUrl, isSameSite, looksLikeAsset, slugFromUrl } from "./lib/urls.js";
import { groupUrlsByPattern, GroupedUrls } from "./lib/patternGroup.js";
import { buildCaptureListFromGroups, CaptureCandidate } from "./lib/captureList.js";
import {
  discoverViaNavAndListings,
  buildCaptureListFromNavDiscovery,
  FilterContext,
} from "./lib/navDiscovery.js";
import {
  promptForUrl,
  promptForOnlyUrls,
  promptForLocalePrefix,
  printNavDiscoverySummary,
  printGroupedCaptureSummary,
  promptCheckpoint,
  CheckpointDecision,
} from "./lib/interactivePrompts.js";
import { dismissCookieBanner } from "./lib/cookies.js";
import { sampleStyles } from "./lib/styleSample.js";
import { captureStitchedScreenshot } from "./lib/stitchedScreenshot.js";
import { flagBlankSections } from "./lib/flagBlankSections.js";

const CAPTURE_WIDTH = 1440;
const CAPTURE_VIEWPORT_HEIGHT = 900;

interface Options {
  url: string;
  sitemap?: string;
  output: string;
  sampleSize: number;
  pageCap: number;
  collapseThreshold: number;
  maxDiscover: number;
  maxSitemapFiles: number;
  maxUrlsPerSitemapFile: number;
  concurrency: number;
  bfsDepth: number;
  bfsMaxPages: number;
  userAgent: string;
  localePrefix: string | null;
  onlyUrls: string[] | null;
  yes: boolean;
  legacyDiscovery: boolean;
}

const program = new Command();
program
  .option("--url <url>", "Starting URL for the site")
  .option("--sitemap <url>", "Explicit sitemap.xml URL (auto-discovered from robots.txt otherwise)")
  .option("--output <dir>", "Output directory", "")
  .option("--sample-size <n>", "Pages to sample per repeating pattern group", "4")
  .option("--page-cap <n>", "Hard cap on total pages captured", "200")
  .option("--collapse-threshold <n>", "Min sibling count to treat a path segment as a repeating pattern", "5")
  .option("--max-discover <n>", "Overall safety-net cap on discovered URLs", "60000")
  .option("--max-sitemap-files <n>", "Max sub-sitemap files to fetch from a sitemap index", "300")
  .option("--max-urls-per-sitemap-file <n>", "Max URLs to take from any single sitemap file, so one huge file can't starve others of discovery budget", "500")
  .option("--concurrency <n>", "Concurrent browser pages while capturing", "3")
  .option("--bfs-depth <n>", "Extra link-following crawl depth to supplement the sitemap (legacy discovery only)", "2")
  .option("--bfs-max-pages <n>", "Max pages to visit during the supplementary link crawl (legacy discovery only)", "50")
  .option("--user-agent <ua>", "User-Agent header to send", "SiteInventoryBot/0.1 (+https://github.com/; research crawl)")
  .option("--locale-prefix <code>", "Restrict crawl to this locale path segment (e.g. 'nl'). Auto-detected from --url when it starts with a locale-looking segment; pass 'none' to disable.")
  .option("--only-urls <urls>", "Comma-separated list of exact URLs to capture, skipping discovery/sampling entirely (for small targeted test runs)")
  .option("--yes", "Skip the review checkpoint prompt and proceed with capture automatically")
  .option("--legacy-discovery", "Skip nav/footer discovery and use the original sitemap + link-crawl discovery directly, with no prompts");

program.parse(process.argv);
const opts = program.opts();

let options: Options;
let rootUrl: URL;
let rootHost: string;

function detectLocalePrefix(): string | null {
  if (opts.localePrefix === "none") return null;
  if (opts.localePrefix) return opts.localePrefix;
  const first = rootUrl.pathname.split("/").filter(Boolean)[0];
  if (first && /^[a-z]{2}(-[a-z]{2})?$/i.test(first)) return first.toLowerCase();
  return null;
}

// Resolves --url/--only-urls from flags where given, prompting for whichever
// is missing. --legacy-discovery implies "no prompts beyond the URL itself"
// since it runs its own full discovery rather than an exact page list.
async function initOptions(): Promise<void> {
  const urlInput = opts.url || (await promptForUrl());
  rootUrl = new URL(urlInput);
  rootHost = rootUrl.hostname;

  let onlyUrls: string[] | null = opts.onlyUrls
    ? opts.onlyUrls.split(",").map((u: string) => u.trim()).filter(Boolean)
    : null;
  if (!onlyUrls && !opts.legacyDiscovery) {
    onlyUrls = await promptForOnlyUrls();
  }

  // Locale only matters for discovery (it filters which found links count);
  // an exact --only-urls list has nothing to filter, so skip asking. A
  // --locale-prefix flag is taken as-is, same as before, with no prompt.
  const localePrefix = opts.localePrefix || onlyUrls
    ? detectLocalePrefix()
    : await promptForLocalePrefix(detectLocalePrefix());

  options = {
    url: urlInput,
    sitemap: opts.sitemap,
    output: opts.output || path.join("output", rootHost.replace(/^www\./, "").replace(/\./g, "-")),
    sampleSize: parseInt(opts.sampleSize, 10),
    pageCap: parseInt(opts.pageCap, 10),
    collapseThreshold: parseInt(opts.collapseThreshold, 10),
    maxDiscover: parseInt(opts.maxDiscover, 10),
    maxSitemapFiles: parseInt(opts.maxSitemapFiles, 10),
    maxUrlsPerSitemapFile: parseInt(opts.maxUrlsPerSitemapFile, 10),
    concurrency: parseInt(opts.concurrency, 10),
    bfsDepth: parseInt(opts.bfsDepth, 10),
    bfsMaxPages: parseInt(opts.bfsMaxPages, 10),
    userAgent: opts.userAgent,
    localePrefix,
    onlyUrls,
    yes: !!opts.yes,
    legacyDiscovery: !!opts.legacyDiscovery,
  };

  if (options.localePrefix) {
    console.log(`Locale filter: restricting to /${options.localePrefix}/* paths (pass --locale-prefix none to disable)`);
  }
}

interface Failure {
  url: string;
  stage: "discover" | "capture";
  error: string;
}

const failures: Failure[] = [];

async function discoverFromSitemap(robots: RobotsInfo): Promise<string[]> {
  const sitemapUrls = options.sitemap
    ? [options.sitemap]
    : robots.sitemaps.length > 0
      ? robots.sitemaps
      : [new URL("/sitemap.xml", rootUrl.origin).toString()];

  const discovered = new Set<string>();
  let filesFetched = 0;

  // fetchSitemapUrls recurses through sitemap indexes; we cap by wrapping
  // discovery once totals or file budget are exceeded.
  for (const sm of sitemapUrls) {
    if (filesFetched >= options.maxSitemapFiles || discovered.size >= options.maxDiscover) break;
    try {
      const urls = await fetchSitemapUrlsBounded(sm, options.userAgent);
      for (const u of urls) discovered.add(u);
    } catch (e: any) {
      failures.push({ url: sm, stage: "discover", error: String(e?.message || e) });
    }
    filesFetched++;
  }

  return Array.from(discovered);
}

// Wraps fetchSitemapUrls with a file-count and total-URL budget so a huge
// sitemap index (common on large sites) doesn't force fetching everything.
async function fetchSitemapUrlsBounded(sitemapUrl: string, ua: string): Promise<string[]> {
  const { XMLParser } = await import("fast-xml-parser");
  const seen = new Set<string>();
  const results: string[] = [];
  let filesFetched = 0;

  async function visit(url: string) {
    if (seen.has(url) || filesFetched >= options.maxSitemapFiles || results.length >= options.maxDiscover) return;
    seen.add(url);
    filesFetched++;
    let xml: string;
    try {
      const res = await fetch(url, { headers: { "User-Agent": ua } });
      if (!res.ok) return;
      xml = await res.text();
    } catch {
      return;
    }
    const parser = new XMLParser({ ignoreAttributes: false });
    let parsed: any;
    try {
      parsed = parser.parse(xml);
    } catch {
      return;
    }
    if (parsed.sitemapindex) {
      const sitemaps = Array.isArray(parsed.sitemapindex.sitemap) ? parsed.sitemapindex.sitemap : [parsed.sitemapindex.sitemap];
      for (const sm of sitemaps) {
        if (results.length >= options.maxDiscover || filesFetched >= options.maxSitemapFiles) break;
        if (typeof sm?.loc === "string") await visit(sm.loc);
      }
    }
    if (parsed.urlset) {
      const entries = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
      // Cap contributions per file so one huge sitemap (e.g. a full art
      // collection with 1M+ entries) can't consume the whole discovery
      // budget before other sitemap files ever get visited.
      for (const entry of entries.slice(0, options.maxUrlsPerSitemapFile)) {
        if (typeof entry?.loc === "string") results.push(entry.loc);
      }
    }
  }

  await visit(sitemapUrl);
  return results;
}

async function discoverFromLinks(browser: Browser, robots: RobotsInfo, seedUrls: string[]): Promise<string[]> {
  const discovered = new Set<string>();
  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = seedUrls.map((u) => ({ url: u, depth: 0 }));
  const context = await browser.newContext({ userAgent: options.userAgent });

  while (queue.length > 0 && visited.size < options.bfsMaxPages) {
    const { url, depth } = queue.shift()!;
    if (visited.has(url) || depth > options.bfsDepth) continue;
    visited.add(url);

    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      const hrefs: string[] = await page.$$eval("a[href]", (as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const href of hrefs) {
        const normalized = normalizeUrl(href, url);
        if (!normalized) continue;
        if (!isSameSite(normalized, rootHost)) continue;
        if (looksLikeAsset(normalized)) continue;
        if (!isAllowed(robots, normalized, options.userAgent)) continue;
        discovered.add(normalized);
        if (depth + 1 <= options.bfsDepth && !visited.has(normalized)) {
          queue.push({ url: normalized, depth: depth + 1 });
        }
      }
    } catch (e: any) {
      failures.push({ url, stage: "discover", error: String(e?.message || e) });
    } finally {
      await page.close();
    }
  }

  await context.close();
  return Array.from(discovered);
}

interface LegacyDiscoveryResult {
  allDiscovered: Set<string>;
  groups: GroupedUrls[];
  captureList: CaptureCandidate[];
}

// The original sitemap + generic link-crawl discovery, unchanged in
// behavior — reachable either directly via --legacy-discovery, or as the
// "expand search" fallback offered at the nav-first review checkpoint.
async function runLegacyDiscovery(browser: Browser, robots: RobotsInfo): Promise<LegacyDiscoveryResult> {
  console.log("Discovering URLs from sitemap...");
  const sitemapUrls = await discoverFromSitemap(robots);
  console.log(`  found ${sitemapUrls.length} URLs from sitemap`);

  console.log(`Discovering additional URLs via link crawl (depth ${options.bfsDepth}, up to ${options.bfsMaxPages} pages)...`);
  const linkUrls = await discoverFromLinks(browser, robots, [options.url]);
  console.log(`  found ${linkUrls.length} additional URLs from link crawl`);

  const allDiscovered = new Set<string>();
  for (const u of [...sitemapUrls, ...linkUrls]) {
    const normalized = normalizeUrl(u, rootUrl.origin);
    if (!normalized) continue;
    if (!isSameSite(normalized, rootHost)) continue;
    if (looksLikeAsset(normalized)) continue;
    if (!isAllowed(robots, normalized, options.userAgent)) continue;
    if (options.localePrefix) {
      const first = new URL(normalized).pathname.split("/").filter(Boolean)[0];
      if (first && /^[a-z]{2}(-[a-z]{2})?$/i.test(first) && first.toLowerCase() !== options.localePrefix) continue;
    }
    allDiscovered.add(normalized);
  }

  console.log(`Total unique discovered URLs: ${allDiscovered.size}`);

  const groups = groupUrlsByPattern(Array.from(allDiscovered), options.collapseThreshold);
  groups.sort((a, b) => b.urls.length - a.urls.length);

  console.log(`Grouped into ${groups.length} path patterns`);

  const totalDesired = groups.reduce(
    (sum, g) => sum + (g.pattern.endsWith("/[*]") ? Math.min(g.urls.length, options.sampleSize) : g.urls.length),
    0,
  );
  if (totalDesired > options.pageCap) {
    console.log(
      `Desired captures (${totalDesired}: full unique coverage + pattern samples) exceed page cap (${options.pageCap}); filling round-robin across all ${groups.length} distinct shapes so coverage breadth isn't lost to one category.`,
    );
  }

  const captureList = buildCaptureListFromGroups(groups, options);

  return { allDiscovered, groups, captureList };
}

async function withConcurrency<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) {
  let cursor = 0;
  async function runNext(): Promise<void> {
    const index = cursor++;
    if (index >= items.length) return;
    await worker(items[index], index);
    return runNext();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runNext()));
}

async function main() {
  await initOptions();

  console.log(`Starting crawl of ${rootUrl.origin}`);
  await fs.mkdir(options.output, { recursive: true });
  await fs.mkdir(path.join(options.output, "pages"), { recursive: true });

  const robots = await loadRobots(rootUrl.origin, options.userAgent);
  const browser = await chromium.launch({ headless: true });

  let allDiscovered: Set<string>;
  let groups: GroupedUrls[];
  let finalCaptureList: CaptureCandidate[];
  let discoveryMode: "onlyUrls" | "legacyDiscovery" | "navFooter" | "navFooterExpanded";

  if (options.onlyUrls) {
    console.log(`Explicit URL list provided: capturing exactly ${options.onlyUrls.length} pages, skipping discovery/sampling.`);
    allDiscovered = new Set(options.onlyUrls);
    groups = options.onlyUrls.map((u) => ({ pattern: new URL(u).pathname, urls: [u] }));
    finalCaptureList = options.onlyUrls.map((u) => ({ url: u, pattern: new URL(u).pathname }));
    discoveryMode = "onlyUrls";
  } else if (options.legacyDiscovery) {
    const legacy = await runLegacyDiscovery(browser, robots);
    allDiscovered = legacy.allDiscovered;
    groups = legacy.groups;
    finalCaptureList = legacy.captureList;
    discoveryMode = "legacyDiscovery";
  } else {
    const ctx: FilterContext = {
      rootHost,
      robots,
      userAgent: options.userAgent,
      localePrefix: options.localePrefix,
    };

    console.log("Discovering pages from header/nav and footer links...");
    const navResult = await discoverViaNavAndListings(browser, options.url, ctx, {
      collapseThreshold: options.collapseThreshold,
      sampleSize: options.sampleSize,
    });
    for (const f of navResult.failures) failures.push({ url: f.url, stage: "discover", error: f.error });

    let mergedGroups: GroupedUrls[] | null = null;
    let mergedDiscovered: Set<string> | null = null;
    let decision: CheckpointDecision = "proceed";

    for (;;) {
      if (mergedGroups) {
        printGroupedCaptureSummary(mergedGroups, buildCaptureListFromGroups(mergedGroups, options));
      } else {
        printNavDiscoverySummary(navResult);
      }

      decision = options.yes ? "proceed" : await promptCheckpoint();
      if (decision !== "expand") break;

      console.log("Expanding search: running legacy sitemap + link-crawl discovery...");
      const legacy = await runLegacyDiscovery(browser, robots);
      const combined = new Set<string>([
        ...navResult.navFooterPages,
        ...navResult.listings.flatMap((l) => l.allUrls),
        ...legacy.allDiscovered,
      ]);
      mergedDiscovered = combined;
      mergedGroups = groupUrlsByPattern(Array.from(combined), options.collapseThreshold);
    }

    if (decision === "cancel") {
      console.log("Crawl cancelled.");
      await browser.close();
      return;
    }

    if (mergedGroups) {
      groups = mergedGroups;
      finalCaptureList = buildCaptureListFromGroups(mergedGroups, options);
      allDiscovered = mergedDiscovered!;
      discoveryMode = "navFooterExpanded";
    } else {
      groups = [
        ...navResult.navFooterPages.map((u) => ({ pattern: new URL(u).pathname || "/", urls: [u] })),
        ...navResult.listings.map((l) => ({ pattern: l.pattern, urls: l.allUrls })),
      ];
      finalCaptureList = buildCaptureListFromNavDiscovery(navResult);
      if (finalCaptureList.length > options.pageCap) {
        console.log(`Capture list (${finalCaptureList.length}) exceeds page cap (${options.pageCap}); truncating.`);
        finalCaptureList = finalCaptureList.slice(0, options.pageCap);
      }
      allDiscovered = new Set([...navResult.navFooterPages, ...navResult.listings.flatMap((l) => l.allUrls)]);
      discoveryMode = "navFooter";
    }
  }

  console.log(`Capturing ${finalCaptureList.length} pages (screenshot + HTML)...`);

  const usedSlugs = new Set<string>();
  const capturedPages: any[] = [];
  const context = await browser.newContext({ userAgent: options.userAgent, viewport: { width: CAPTURE_WIDTH, height: CAPTURE_VIEWPORT_HEIGHT } });

  // The context (and its cookies) is shared across every captured page, so
  // the banner only ever appears once — on whichever page happens to load
  // first — after which it's dismissed for the rest of the run. Claim the
  // capture optimistically before the (concurrent) dismiss call so two
  // pages can't both try; release the claim if nothing was actually there
  // so a later page still gets a chance.
  let cookieBannerClaimed = false;

  await withConcurrency(finalCaptureList, options.concurrency, async ({ url, pattern }) => {
    let slug = slugFromUrl(url);
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugFromUrl(url)}-${n}`;
      n++;
    }
    usedSlugs.add(slug);

    const pageDir = path.join(options.output, "pages", slug);
    await fs.mkdir(pageDir, { recursive: true });

    const page = await context.newPage();
    try {
      // "networkidle" (zero network activity for 500ms) is unreliable on
      // modern sites with chat widgets, analytics beacons, or live-updating
      // content (price tickers etc.) — some pages never go fully idle, which
      // reads as a capture failure even though the page loaded fine. "load"
      // (the standard DOM load event) is far more robust; settleLazyImages
      // below handles waiting for images regardless of the wait strategy
      // used here. Keep one retry for genuine transient network blips.
      let response;
      try {
        response = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      } catch {
        response = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      }
      if (!response || response.status() >= 400) {
        throw new Error(`HTTP ${response?.status() ?? "no response"}`);
      }
      // Brief buffer for client-side hydration/rendering that happens after
      // the "load" event on JS-heavy sites, before we start interacting.
      await page.waitForTimeout(1000);
      const wantsCookieScreenshot = !cookieBannerClaimed;
      if (wantsCookieScreenshot) cookieBannerClaimed = true;
      const cookieBannerScreenshotPath = wantsCookieScreenshot ? path.join(pageDir, "cookie-bar.png") : undefined;
      const { screenshotTaken: cookieBannerCaptured } = await dismissCookieBanner(page, cookieBannerScreenshotPath);
      if (wantsCookieScreenshot && !cookieBannerCaptured) cookieBannerClaimed = false;
      const title = await page.title();

      // Deliberately not `page.screenshot({ fullPage: true })`: that renders
      // the whole page in one pass at an artificially page-height-tall
      // viewport, which breaks position:sticky and scroll-triggered reveal
      // animations (they resolve against that fake viewport, not a real
      // one) — a known, general limitation of Chromium full-page capture,
      // not specific to any one site. Scrolling for real in normal-viewport
      // increments and stitching the results together is always correct,
      // since each slice is genuinely how the page renders when a visitor
      // scrolls there — and it also sidesteps any real horizontal-overflow
      // layout bugs a page might have, since a normal screenshot is always
      // exactly viewport-width regardless of the document's scrollWidth.
      const screenshotPath = path.join(pageDir, "screenshot.png");
      await captureStitchedScreenshot(page, screenshotPath, CAPTURE_WIDTH, CAPTURE_VIEWPORT_HEIGHT);
      const html = await page.content();
      await fs.writeFile(path.join(pageDir, "page.html"), html, "utf-8");

      const styles = await sampleStyles(page);
      await fs.writeFile(path.join(pageDir, "styles.json"), JSON.stringify(styles, null, 2), "utf-8");

      const blankSectionFlags = await flagBlankSections(screenshotPath, styles);

      capturedPages.push({
        url,
        pattern,
        slug,
        title,
        screenshot: `pages/${slug}/screenshot.png`,
        html: `pages/${slug}/page.html`,
        styles: `pages/${slug}/styles.json`,
        capturedAt: new Date().toISOString(),
        blankSectionFlags,
        ...(cookieBannerCaptured ? { cookieBannerScreenshot: `pages/${slug}/cookie-bar.png` } : {}),
      });
      if (cookieBannerCaptured) console.log(`    captured cookie banner: pages/${slug}/cookie-bar.png`);
      console.log(`  captured: ${url}`);
      for (const flag of blankSectionFlags) {
        console.log(`    ⚠ ${flag.path} (.${flag.classes.split(" ")[0]}): ${flag.note}`);
      }
    } catch (e: any) {
      failures.push({ url, stage: "capture", error: String(e?.message || e) });
      console.log(`  FAILED: ${url} (${String(e?.message || e)})`);
    } finally {
      await page.close();
    }
  });

  await context.close();
  await browser.close();

  const manifest = {
    startUrl: options.url,
    crawledAt: new Date().toISOString(),
    options,
    discoveryMode,
    totalDiscovered: allDiscovered.size,
    totalCaptured: capturedPages.length,
    groups: groups.map((g) => ({ pattern: g.pattern, totalUrls: g.urls.length })),
    pages: capturedPages,
  };

  await fs.writeFile(path.join(options.output, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  await fs.writeFile(path.join(options.output, "failures.json"), JSON.stringify(failures, null, 2), "utf-8");

  console.log("\nDone.");
  console.log(`  Discovered: ${allDiscovered.size}`);
  console.log(`  Captured:   ${capturedPages.length}`);
  console.log(`  Failed:     ${failures.length}`);
  console.log(`  Manifest:   ${path.join(options.output, "manifest.json")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
