import { Command } from "commander";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as cheerio from "cheerio";

const program = new Command();
program.requiredOption("--input <dir>", "Crawl output directory (containing manifest.json)");
program.parse(process.argv);
const opts = program.opts();

interface StyleSample {
  path: string;
  tag: string;
  classes: string;
  backgroundColor: string;
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  paddingTop: string;
  paddingBottom: string;
  marginTop: string;
  marginBottom: string;
  top: number;
  width: number;
  height: number;
}

interface OutlineEntry {
  path: string; // "header" | "main>0" | ... | "footer"
  tag: string;
  classes: string;
  primaryClass: string;
  fingerprint: string; // coarse — for cross-page COMPONENT identity (same widget, different content length)
  templateFingerprint: string; // fine — for PAGE/TEMPLATE similarity (these pages should stay distinct even if one shared widget looks similar)
  heading: string | null;
  textSnippet: string;
  linkCount: number;
  imageCount: number;
  style: StyleSample | null;
  isBlankFlagged: boolean;
  blankNote: string | null;
  candidateIdAttrs: Record<string, string>; // "id" plus every data-* attribute present directly on this element, checked later for stable cross-page identifiers
}

interface PageAnalysis {
  slug: string;
  url: string;
  pattern: string;
  title: string;
  screenshot: string;
  outline: OutlineEntry[];
  signature: string[]; // main>* content fingerprints, used for clustering
}

function primaryClassOf(classAttr: string): string {
  const tokens = classAttr.split(/\s+/).filter(Boolean);
  return tokens[0] || "";
}

function bucket(n: number, edges: number[]): string {
  const labels = ["0", ...edges.map((e, i) => (i === 0 ? `1-${e}` : `${edges[i - 1] + 1}-${e}`)), `${edges[edges.length - 1] + 1}+`];
  if (n === 0) return labels[0];
  for (let i = 0; i < edges.length; i++) if (n <= edges[i]) return labels[i + 1];
  return labels[labels.length - 1];
}

// A structural fingerprint built from actual DOM content shape — tag,
// image/link/heading counts, element count, notable media — rather than CSS
// class names. Class-based matching (the previous approach) works for sites
// with semantic class names, but breaks on CSS-in-JS design systems
// (styled-components, Emotion, etc.), where nearly every layout wrapper
// shares the same generic base class (e.g. "Box-abc123") and the real
// differentiation lives in an auto-generated hash class that varies per
// build and can't be matched on reliably. Content shape is framework-
// agnostic: it doesn't care what the classes are called, only what's there.
// `includeTag` is false for main-region content: a design system frequently
// wraps the same visual widget in different tags on different pages (a
// <section> here, a <span> there, purely a styling choice), so requiring an
// exact tag match splits one real component into several. Header/footer
// keep their tag (passed as true) since "what tag renders the header" is a
// meaningful, stable structural fact for that specific region, not
// incidental styling.
function contentFingerprint($el: cheerio.Cheerio<any>, includeTag: boolean): string {
  const tag = (($el.get(0) as any)?.tagName || "").toLowerCase();
  const imageCount = $el.find("img").length;
  const linkCount = $el.find("a").length;
  const headingCount = $el.find("h1,h2,h3,h4,h5,h6").length;
  const elementCount = $el.find("*").length;
  const hasForm = $el.find("form,input,textarea,select").length > 0;
  const hasMedia = $el.find("video,iframe,canvas,svg").length > 0;

  // Images/links are bucketed coarsely (has-any vs none) rather than by
  // exact count: within one component TYPE (e.g. an FAQ list), the exact
  // number of images/links usually just reflects how much content that
  // particular instance happens to hold (a longer answer with more inline
  // links), not a different kind of component — three FAQ sections with
  // 4, 6, and 12 links are still the same FAQ component.
  //
  // Heading count and element count need the same treatment for the same
  // reason, which the original finer-grained buckets got backwards: a block
  // whose job is to render variable-length content (an FAQ list, a legal
  // document, a card grid) naturally has a heading/element count that scales
  // with how much content it holds, not with what kind of component it is.
  // A 5-question FAQ and a 15-question FAQ are the same component; a legal
  // disclosure that happens to mark its sections with real <h2> tags and one
  // that uses bold text instead are the same document-viewer widget. Three
  // buckets (none / one / many) for headings and two (compact / large) for
  // element count still separate a real hero (one heading, few elements)
  // from a real list-of-items (many headings, many elements) without
  // fragmenting on exactly how many items that list happens to hold.
  return [
    ...(includeTag ? [tag] : []),
    `img:${imageCount > 0 ? 1 : 0}`,
    `a:${linkCount > 0 ? 1 : 0}`,
    `h:${bucket(headingCount, [1])}`,
    `els:${bucket(elementCount, [50])}`,
    `form:${hasForm ? 1 : 0}`,
    `media:${hasMedia ? 1 : 0}`,
  ].join("|");
}

// A finer-grained sibling of contentFingerprint(), used only for PAGE/
// TEMPLATE similarity (clusterPages() below), never for component identity.
// The two jobs want opposite precision: a component should merge across
// pages despite content-length variation (an FAQ with 5 vs 15 questions is
// still one component), but two pages should NOT be folded into "the same
// template" just because they happen to share a few similarly-shaped
// sections — that conflation is exactly what using one shared fingerprint
// for both jobs caused. Keeps the tag and the original finer count buckets.
function templateFingerprint($el: cheerio.Cheerio<any>): string {
  const tag = (($el.get(0) as any)?.tagName || "").toLowerCase();
  const imageCount = $el.find("img").length;
  const linkCount = $el.find("a").length;
  const headingCount = $el.find("h1,h2,h3,h4,h5,h6").length;
  const elementCount = $el.find("*").length;
  const hasForm = $el.find("form,input,textarea,select").length > 0;
  const hasMedia = $el.find("video,iframe,canvas,svg").length > 0;

  return [
    tag,
    `img:${imageCount > 0 ? 1 : 0}`,
    `a:${linkCount > 0 ? 1 : 0}`,
    `h:${bucket(headingCount, [1, 3])}`,
    `els:${bucket(elementCount, [15, 50, 150])}`,
    `form:${hasForm ? 1 : 0}`,
    `media:${hasMedia ? 1 : 0}`,
  ].join("|");
}

function textSnippetOf($el: cheerio.Cheerio<any>): string {
  const text = $el.clone().children("script,style").remove().end().text().replace(/\s+/g, " ").trim();
  return text.slice(0, 160);
}

function headingOf($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): string | null {
  const h = $el.find("h1,h2,h3").first();
  if (h.length === 0) return null;
  const text = h.text().replace(/\s+/g, " ").trim();
  return text || null;
}

function elementChildren($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): cheerio.Cheerio<any> {
  return $el.children().filter((_, el) => {
    const tag = (el as any).tagName;
    return !!tag && tag !== "script" && tag !== "style";
  });
}

function ownTextOf($el: cheerio.Cheerio<any>): string {
  return $el
    .contents()
    .filter((_, n) => (n as any).type === "text")
    .text()
    .replace(/\s+/g, "");
}

// CSS-in-JS design systems (styled-components, Emotion, etc.) commonly wrap
// a page's real content in one or more layout-only divs (positioning, max-
// width, grid context) that carry no content of their own — just one child
// that holds everything. Walking direct children of <main> without seeing
// through these collapses an entire page's worth of real, distinct sections
// into a single outline entry. Peel through any number of such wrappers
// (recursively, since a design system often nests several) by DOM shape
// alone — no class-name matching, so this works regardless of a given
// site's naming conventions: a wrapper is exactly one element child, no
// text of its own, whose own child in turn has more than one child (i.e.
// that's where the real siblings live).
function peelWrapper($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): cheerio.Cheerio<any> {
  let current = $el;
  for (;;) {
    const kids = elementChildren($, current);
    if (kids.length !== 1 || ownTextOf(current).length > 0) break;
    const onlyChild = $(kids.get(0));
    if (elementChildren($, onlyChild).length <= 1) break;
    current = onlyChild;
  }
  return current;
}

function buildOutline($: cheerio.CheerioAPI, styles: StyleSample[], blankFlags: { path: string; note: string }[]): OutlineEntry[] {
  const styleByPath = new Map(styles.map((s) => [s.path, s]));
  const blankByPath = new Map(blankFlags.map((f) => [f.path, f.note]));
  const entries: OutlineEntry[] = [];

  const header = $("header").first();
  if (header.length) {
    entries.push(makeEntry($, header, "header", styleByPath, blankByPath));
  }

  const mainRoot = $("main").first().length ? $("main").first() : $("body").first();
  const main = peelWrapper($, mainRoot);
  main.children().each((i, child) => {
    const $child = $(child);
    const tag = (child as any).tagName;
    if (!tag || tag === "script" || tag === "style") return;

    // Skip genuinely empty elements: no text, no images/links/headings, no
    // descendants at all. These are typically implementation noise — scroll-
    // trigger anchors or animation spacer divs some component libraries
    // insert (e.g. Revolut's own design system does this) — not real
    // content sections, and documenting them as "components" is actively
    // misleading rather than merely imprecise.
    const isEmpty =
      $child.find("*").length === 0 &&
      $child.find("img,a,h1,h2,h3,h4,h5,h6").length === 0 &&
      $child.text().replace(/\s+/g, "").length === 0;
    if (isEmpty) return;

    entries.push(makeEntry($, $child, `main>${i}`, styleByPath, blankByPath));
  });

  const footer = $("footer").first();
  if (footer.length) {
    entries.push(makeEntry($, footer, "footer", styleByPath, blankByPath));
  }

  return entries;
}

// "id" plus every data-* attribute directly on this element — candidates for
// a site-provided stable content-block identifier (see detectStableIdAttr
// below). Collected per-element here since that's where cheerio access is
// cheap; which of these (if any) is actually useful is decided later, once
// every page has been scanned.
function candidateIdAttrsOf($el: cheerio.Cheerio<any>): Record<string, string> {
  const el = $el.get(0) as any;
  const attribs: Record<string, string> = el?.attribs || {};
  const result: Record<string, string> = {};
  for (const [name, value] of Object.entries(attribs)) {
    if ((name === "id" || name.startsWith("data-")) && value) result[name] = value;
  }
  return result;
}

function makeEntry(
  $: cheerio.CheerioAPI,
  $el: cheerio.Cheerio<any>,
  pathKey: string,
  styleByPath: Map<string, StyleSample>,
  blankByPath: Map<string, string>
): OutlineEntry {
  const classes = ($el.attr("class") || "").trim();
  const note = blankByPath.get(pathKey) || null;
  return {
    path: pathKey,
    tag: (($el.get(0) as any)?.tagName || "").toLowerCase(),
    classes,
    primaryClass: primaryClassOf(classes),
    fingerprint: contentFingerprint($el, pathKey === "header" || pathKey === "footer"),
    templateFingerprint: templateFingerprint($el),
    heading: headingOf($, $el),
    textSnippet: note ? "" : textSnippetOf($el),
    linkCount: $el.find("a").length,
    imageCount: $el.find("img").length,
    style: styleByPath.get(pathKey) || null,
    isBlankFlagged: !!note,
    blankNote: note,
    candidateIdAttrs: candidateIdAttrsOf($el),
  };
}

// Jaccard similarity on the set of "main>*" primaryClass tokens. Two pages
// are the same template if most of their top-level block types match.
function similarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1 : intersection / union;
}

interface TemplateCluster {
  slug: string;
  pageSlugs: string[];
  signature: string[];
}

function clusterPages(pages: PageAnalysis[], threshold = 0.5): TemplateCluster[] {
  const clusters: TemplateCluster[] = [];
  for (const page of pages) {
    let best: { cluster: TemplateCluster; score: number } | null = null;
    for (const cluster of clusters) {
      const score = similarity(page.signature, cluster.signature);
      if (score >= threshold && (!best || score > best.score)) best = { cluster, score };
    }
    if (best) {
      best.cluster.pageSlugs.push(page.slug);
    } else {
      clusters.push({ slug: page.slug, pageSlugs: [page.slug], signature: page.signature });
    }
  }
  return clusters;
}

interface CanonicalComponent {
  key: string;
  tag: string;
  classesSeen: string[];
  occurrences: { pageSlug: string; path: string; heading: string | null }[];
}

function regionOf(path: string): "header" | "footer" | "main" {
  if (path === "header") return "header";
  if (path === "footer") return "footer";
  return "main";
}

// Reconciles components across the whole site (not just within one template
// cluster): entries sharing the same content fingerprint are treated as the
// same canonical component, since the same block type (e.g. a full-width
// image+text block) commonly appears across multiple different templates.
// Keyed by fingerprint (not CSS class — see contentFingerprint's comment)
// plus a coarse region (header/footer/main), so a header and footer that
// happen to have a similar shape (few links, no images) don't merge.
const MIN_STABLE_ID_DISTINCT_VALUES = 5; // excludes boolean-ish flags (e.g. a theme toggle) that happen to repeat
const MIN_STABLE_ID_REUSED_VALUES = 2; // needs actual cross-page reuse, not just per-page-unique values
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Different sites mark up "this is the same content block" differently (or
// not at all) — there's no standard attribute name to hardcode. Instead,
// scan every element's own attributes (collected as candidateIdAttrs) across
// every captured page and look for one that behaves like a stable
// identifier: many distinct values (rules out flags like a theme toggle),
// several of which repeat across genuinely different pages (rules out
// per-render-random ids). Only that behavior, not the name, decides whether
// an attribute qualifies — a site with none of this (most sites) yields
// null and the pipeline falls back to fingerprint-only matching, unchanged.
function detectStableIdAttr(pages: PageAnalysis[]): string | null {
  const valuesByAttr = new Map<string, Map<string, Set<string>>>();
  for (const page of pages) {
    for (const entry of page.outline) {
      for (const [attr, value] of Object.entries(entry.candidateIdAttrs)) {
        if (!valuesByAttr.has(attr)) valuesByAttr.set(attr, new Map());
        const values = valuesByAttr.get(attr)!;
        if (!values.has(value)) values.set(value, new Set());
        values.get(value)!.add(page.slug);
      }
    }
  }

  let best: { attr: string; reusedValues: number; distinctValues: number } | null = null;
  for (const [attr, values] of valuesByAttr) {
    const distinctValues = values.size;
    if (distinctValues < MIN_STABLE_ID_DISTINCT_VALUES) continue;
    const reusedValues = Array.from(values.values()).filter((pageSlugs) => pageSlugs.size >= 2).length;
    if (reusedValues < MIN_STABLE_ID_REUSED_VALUES) continue;
    if (!best || reusedValues > best.reusedValues) best = { attr, reusedValues, distinctValues };
  }
  return best?.attr ?? null;
}

// Fingerprint-based grouping (byKey) already does the main job: recognizing
// the same WIDGET TYPE regardless of content (a 5-question FAQ and a
// 15-question FAQ are the same component). This second pass only handles a
// narrower, higher-confidence case on top: if a site's own markup confirms
// two occurrences are the exact same literal content block reused across
// pages (matching stableIdAttr value), merge their groups even if incidental
// differences split them on fingerprint alone. It never overrides
// fingerprint grouping for same-type-different-content occurrences — those
// naturally carry different stable-id values (different content = different
// block), so this pass simply doesn't touch them.
function reconcileComponents(pages: PageAnalysis[], stableIdAttr: string | null): CanonicalComponent[] {
  const byKey = new Map<string, CanonicalComponent>();
  const keyByOccurrence = new Map<string, string>(); // `${pageSlug}|${path}` -> fingerprint key, for the merge pass below
  for (const page of pages) {
    for (const entry of page.outline) {
      const key = `${regionOf(entry.path)}:${entry.fingerprint}`;
      if (!byKey.has(key)) byKey.set(key, { key, tag: entry.tag, classesSeen: [], occurrences: [] });
      const component = byKey.get(key)!;
      if (entry.primaryClass && !component.classesSeen.includes(entry.primaryClass)) component.classesSeen.push(entry.primaryClass);
      component.occurrences.push({ pageSlug: page.slug, path: entry.path, heading: entry.heading });
      keyByOccurrence.set(`${page.slug}|${entry.path}`, key);
    }
  }

  if (stableIdAttr) {
    const keysByStableId = new Map<string, Set<string>>();
    for (const page of pages) {
      for (const entry of page.outline) {
        const value = entry.candidateIdAttrs[stableIdAttr];
        // Only a UUID-shaped value is trusted as a literal per-instance
        // identifier. A short, human-readable value (e.g. "navigation",
        // "signup-button") is a ROLE/CATEGORY label a CMS applies to every
        // instance of that role — including structurally different ones
        // (a stripped-down header on legal pages still gets tagged
        // "navigation") — so treating it as "same instance" would merge
        // genuinely different components. This was caught directly: it
        // collapsed a legal page's distinct, link-free header into the
        // main site header purely because both carry data-blockid=
        // "navigation".
        if (!value || !UUID_PATTERN.test(value)) continue;
        const key = keyByOccurrence.get(`${page.slug}|${entry.path}`)!;
        if (!keysByStableId.has(value)) keysByStableId.set(value, new Set());
        keysByStableId.get(value)!.add(key);
      }
    }

    // Redirect map so a key merged into a survivor still resolves correctly
    // if a later stable-id group also touches it (chained merges).
    const redirect = new Map<string, string>();
    const resolve = (key: string): string => (redirect.has(key) ? resolve(redirect.get(key)!) : key);

    for (const keys of keysByStableId.values()) {
      const resolvedKeys = Array.from(new Set(Array.from(keys).map(resolve)));
      if (resolvedKeys.length < 2) continue;
      // Merge into whichever group already has the most occurrences, so the
      // survivor's key (and thus its later-authored doc, if reused) is the
      // one covering the most ground.
      resolvedKeys.sort((a, b) => byKey.get(b)!.occurrences.length - byKey.get(a)!.occurrences.length);
      const survivorKey = resolvedKeys[0];
      const survivor = byKey.get(survivorKey)!;
      for (const loserKey of resolvedKeys.slice(1)) {
        const loser = byKey.get(loserKey)!;
        survivor.occurrences.push(...loser.occurrences);
        for (const cls of loser.classesSeen) if (!survivor.classesSeen.includes(cls)) survivor.classesSeen.push(cls);
        byKey.delete(loserKey);
        redirect.set(loserKey, survivorKey);
      }
    }
  }

  return Array.from(byKey.values());
}

async function main() {
  const manifestPath = path.join(opts.input, "manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8"));

  const pages: PageAnalysis[] = [];
  for (const p of manifest.pages) {
    const htmlPath = path.join(opts.input, p.html);
    const stylesPath = path.join(opts.input, p.styles);
    const html = await fs.readFile(htmlPath, "utf-8");
    const styles: StyleSample[] = JSON.parse(await fs.readFile(stylesPath, "utf-8"));
    const $ = cheerio.load(html);

    const outline = buildOutline($, styles, p.blankSectionFlags || []);
    const signature = outline.filter((e) => e.path.startsWith("main>")).map((e) => e.templateFingerprint);

    pages.push({
      slug: p.slug,
      url: p.url,
      pattern: p.pattern,
      title: p.title,
      screenshot: p.screenshot,
      outline,
      signature,
    });
  }

  const clusters = clusterPages(pages);
  const stableIdAttr = detectStableIdAttr(pages);
  if (stableIdAttr) {
    console.log(`Detected a stable content-block identifier on this site: "${stableIdAttr}" — using it to confirm same-instance merges alongside structural matching.`);
  }
  const components = reconcileComponents(pages, stableIdAttr);

  const analysis = {
    analyzedAt: new Date().toISOString(),
    input: opts.input,
    totalPages: pages.length,
    totalTemplates: clusters.length,
    totalComponents: components.length,
    stableIdAttr,
    pages,
    templates: clusters,
    components,
  };

  const outPath = path.join(opts.input, "analysis.json");
  await fs.writeFile(outPath, JSON.stringify(analysis, null, 2), "utf-8");

  console.log(`Analyzed ${pages.length} pages -> ${clusters.length} templates, ${components.length} canonical components`);
  console.log(`Written: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
