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
  heading: string | null;
  textSnippet: string;
  linkCount: number;
  imageCount: number;
  style: StyleSample | null;
  isBlankFlagged: boolean;
  blankNote: string | null;
}

interface PageAnalysis {
  slug: string;
  url: string;
  pattern: string;
  title: string;
  screenshot: string;
  outline: OutlineEntry[];
  signature: string[]; // main>* primaryClass tokens only, used for clustering
}

function primaryClassOf(classAttr: string): string {
  const tokens = classAttr.split(/\s+/).filter(Boolean);
  return tokens[0] || "";
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

function buildOutline($: cheerio.CheerioAPI, styles: StyleSample[], blankFlags: { path: string; note: string }[]): OutlineEntry[] {
  const styleByPath = new Map(styles.map((s) => [s.path, s]));
  const blankByPath = new Map(blankFlags.map((f) => [f.path, f.note]));
  const entries: OutlineEntry[] = [];

  const header = $("header").first();
  if (header.length) {
    entries.push(makeEntry($, header, "header", styleByPath, blankByPath));
  }

  const main = $("main").first().length ? $("main").first() : $("body").first();
  main.children().each((i, child) => {
    const $child = $(child);
    const tag = (child as any).tagName;
    if (!tag || tag === "script" || tag === "style") return;
    entries.push(makeEntry($, $child, `main>${i}`, styleByPath, blankByPath));
  });

  const footer = $("footer").first();
  if (footer.length) {
    entries.push(makeEntry($, footer, "footer", styleByPath, blankByPath));
  }

  return entries;
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
    heading: headingOf($, $el),
    textSnippet: note ? "" : textSnippetOf($el),
    linkCount: $el.find("a").length,
    imageCount: $el.find("img").length,
    style: styleByPath.get(pathKey) || null,
    isBlankFlagged: !!note,
    blankNote: note,
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
  occurrences: { pageSlug: string; path: string; heading: string | null }[];
}

// Reconciles components across the whole site (not just within one template
// cluster): entries sharing the same primary class token are treated as the
// same canonical component, since the same block type (e.g. a full-width
// image+text block) commonly appears across multiple different templates.
function reconcileComponents(pages: PageAnalysis[]): CanonicalComponent[] {
  const byKey = new Map<string, CanonicalComponent>();
  for (const page of pages) {
    for (const entry of page.outline) {
      const key = entry.primaryClass || `${entry.tag}:${entry.path}`;
      if (!byKey.has(key)) byKey.set(key, { key, tag: entry.tag, occurrences: [] });
      byKey.get(key)!.occurrences.push({ pageSlug: page.slug, path: entry.path, heading: entry.heading });
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
    const signature = outline.filter((e) => e.path.startsWith("main>")).map((e) => e.primaryClass);

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
  const components = reconcileComponents(pages);

  const analysis = {
    analyzedAt: new Date().toISOString(),
    input: opts.input,
    totalPages: pages.length,
    totalTemplates: clusters.length,
    totalComponents: components.length,
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
