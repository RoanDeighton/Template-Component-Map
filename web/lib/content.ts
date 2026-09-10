import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

// The crawler/analyzer pipeline (src/crawl.ts, src/analyze.ts) writes its
// output here — this app is a read-only frontend over that same data,
// never a copy of it.
const OUTPUT_ROOT = path.resolve(process.cwd(), "..", "output");

export interface SiteMeta {
  slug: string;
  title: string;
  description: string;
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ContentDoc {
  slug: string;
  title: string;
  html: string;
  headings: Heading[];
}

// Markdown image paths are relative to the .md file's own location on
// disk (e.g. "../../pages/nl/crop-header.png" from content/components/).
// The browser has no such filesystem — it needs an absolute URL under
// /assets/<site>/..., which public/assets/<site> is symlinked to serve
// (see public/assets/README or the symlink itself). These are plain <img>
// src strings, not Next <Link>/<Image> elements, so — unlike internal
// links — they don't get GitHub Pages' basePath prefix for free; it has to
// be added by hand here (same NEXT_BASE_PATH the build sets in
// next.config.ts).
function resolveAssetSrc(site: string, mdFileDir: string, src: string): string {
  if (/^(https?:)?\/\//.test(src)) return src;
  let absoluteFsPath = path.resolve(mdFileDir, src);
  // scripts/optimize-content-images.mjs generates a compressed .webp
  // sibling for any large screenshot — prefer it over the raw PNG/JPEG
  // capture, which can run into the tens of megabytes.
  const webpSibling = absoluteFsPath.replace(/\.(png|jpe?g)$/i, ".webp");
  if (webpSibling !== absoluteFsPath && fs.existsSync(webpSibling)) {
    absoluteFsPath = webpSibling;
  }
  const siteRoot = path.join(OUTPUT_ROOT, site);
  const relativeToSite = path.relative(siteRoot, absoluteFsPath).split(path.sep).join("/");
  const basePath = process.env.NEXT_BASE_PATH ?? "";
  return `${basePath}/assets/${site}/${relativeToSite}`;
}

function rehypeRewriteImages({ site, mdFileDir }: { site: string; mdFileDir: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName !== "img") return;
      const src = node.properties?.src;
      if (typeof src !== "string") return;
      node.properties.src = resolveAssetSrc(site, mdFileDir, src);
    });
  };
}

// Collects h2/h3 (id already assigned by rehype-slug, which must run
// before this) into `out` for the "On this page" TOC — same idea as
// VitePress's own outline: { level: [2, 3] }.
function rehypeCollectHeadings(out: Heading[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return;
      const id = node.properties?.id;
      if (typeof id !== "string") return;
      const text = node.children
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((c: any) => c.type === "text")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => c.value)
        .join("");
      out.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
    });
  };
}

// Drops the content's own leading "# Title" — used where the title is
// rendered separately (e.g. alongside DocNavArrows) so it doesn't appear
// twice.
function rehypeStripFirstHeading() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idx = tree.children.findIndex((n: any) => n.type === "element" && n.tagName === "h1");
    if (idx !== -1) tree.children.splice(idx, 1);
  };
}

function markdownToHtml(
  markdown: string,
  site: string,
  mdFileDir: string,
  options: { stripFirstHeading?: boolean } = {},
): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const pipeline = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRewriteImages, { site, mdFileDir })
    .use(rehypeSlug)
    .use(rehypeCollectHeadings, headings);
  if (options.stripFirstHeading) pipeline.use(rehypeStripFirstHeading);
  const file = pipeline.use(rehypeStringify).processSync(markdown);
  return { html: String(file), headings };
}

export function listSites(): string[] {
  if (!fs.existsSync(OUTPUT_ROOT)) return [];
  return fs
    .readdirSync(OUTPUT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(OUTPUT_ROOT, d.name, "content", "overview.md")))
    .map((d) => d.name)
    .sort();
}

export function getSiteMeta(site: string): SiteMeta {
  const siteJsonPath = path.join(OUTPUT_ROOT, site, "site.json");
  const fallback = { title: site, description: "" };
  const meta = fs.existsSync(siteJsonPath) ? JSON.parse(fs.readFileSync(siteJsonPath, "utf-8")) : fallback;
  return { slug: site, title: meta.title ?? site, description: meta.description ?? "" };
}

function docsInDir(site: string, subdir: "components" | "pages"): { slug: string; title: string }[] {
  const dir = path.join(OUTPUT_ROOT, site, "content", subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "overview.md")
    .sort()
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = matter(fs.readFileSync(path.join(dir, f), "utf-8"));
      const fallback = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { slug, title: data.title ?? fallback };
    });
}

export function listComponents(site: string) {
  return docsInDir(site, "components");
}

export function listPages(site: string) {
  return docsInDir(site, "pages");
}

// listComponents() sorted the same way the sidebar (and the overview
// table's default sort) groups them — functional first, then editorial,
// alphabetical within each group — so "next" from Overview, and every
// component's own prev/next, walks in the order a reader actually sees
// them in the sidebar rather than a flat alphabetical list that cuts
// across the two groups.
export function orderedComponents(site: string) {
  const list = listComponents(site);
  const functional = list.filter((c) => isFunctionalComponent(c.title));
  const editorial = list.filter((c) => !isFunctionalComponent(c.title));
  return [...functional, ...editorial];
}

// Previous/next within a doc list, by slug — used for the prev/next
// arrows next to a doc's title. The Overview page is treated as the
// (virtual) item before the first component/page, so the first doc's
// "prev" arrow goes back to Overview instead of being disabled; the last
// doc's "next" arrow has nothing after it and stays disabled.
export function getAdjacentDocs(
  site: string,
  kind: "components" | "pages",
  slug: string,
): { prev: { slug: string; title: string; href: string } | null; next: { slug: string; title: string; href: string } | null } {
  const list = kind === "components" ? orderedComponents(site) : listPages(site);
  const i = list.findIndex((d) => d.slug === slug);
  const at = (idx: number) => {
    const d = list[idx];
    return d ? { slug: d.slug, title: d.title, href: `/${site}/${kind}/${d.slug}` } : null;
  };
  const overview = { slug: "overview", title: "Overview", href: `/${site}/${kind}` };
  return { prev: i > 0 ? at(i - 1) : overview, next: i >= 0 && i < list.length - 1 ? at(i + 1) : null };
}

export interface SearchItem {
  title: string;
  href: string;
  group: "Home" | "Components" | "Pages";
}

export function getSearchIndex(site: string): SearchItem[] {
  const items: SearchItem[] = [{ title: "Home", href: `/${site}`, group: "Home" }];
  items.push(
    { title: "All components", href: `/${site}/components`, group: "Components" },
    ...listComponents(site).map((c): SearchItem => ({
      title: c.title,
      href: `/${site}/components/${c.slug}`,
      group: "Components",
    })),
  );
  items.push(
    { title: "All pages", href: `/${site}/pages`, group: "Pages" },
    ...listPages(site).map((p): SearchItem => ({
      title: p.title,
      href: `/${site}/pages/${p.slug}`,
      group: "Pages",
    })),
  );
  return items;
}

function readDoc(mdPath: string, site: string, options: { stripFirstHeading?: boolean } = {}): ContentDoc {
  const raw = fs.readFileSync(mdPath, "utf-8");
  const { data, content } = matter(raw);
  const slug = path.basename(mdPath, ".md");
  const { html, headings } = markdownToHtml(content, site, path.dirname(mdPath), options);
  return { slug, title: data.title ?? slug, html, headings };
}

export function getOverview(site: string): ContentDoc {
  return readDoc(path.join(OUTPUT_ROOT, site, "content", "overview.md"), site);
}

// Splits the overview doc around the "<!-- stat-blocks -->" marker so the
// homepage can render a real React stat-card component there (real counts,
// real Next.js links) instead of the raw HTML that lived in that spot for
// the old VitePress version. Both halves go through the normal markdown
// pipeline independently; their headings are merged back into one list for
// the TOC.
export function getOverviewSplit(site: string): { beforeHtml: string; afterHtml: string; headings: Heading[] } {
  const mdPath = path.join(OUTPUT_ROOT, site, "content", "overview.md");
  const raw = fs.readFileSync(mdPath, "utf-8");
  const { content } = matter(raw);
  const marker = "<!-- stat-blocks -->";
  const idx = content.indexOf(marker);
  const mdFileDir = path.dirname(mdPath);
  if (idx === -1) {
    const { html, headings } = markdownToHtml(content, site, mdFileDir);
    return { beforeHtml: html, afterHtml: "", headings };
  }
  const before = markdownToHtml(content.slice(0, idx), site, mdFileDir);
  const after = markdownToHtml(content.slice(idx + marker.length), site, mdFileDir);
  return { beforeHtml: before.html, afterHtml: after.html, headings: [...before.headings, ...after.headings] };
}

export function getComponentsOverview(site: string): ContentDoc | null {
  const p = path.join(OUTPUT_ROOT, site, "content", "components", "overview.md");
  return fs.existsSync(p) ? readDoc(p, site) : null;
}

export interface ComponentTableRow {
  class: string;
  title: string;
  href: string;
  pages: number;
  previewImage: string | null;
  functional: boolean;
}

// Functional components are the site's structural chrome — the same
// handful of things every site has, reused around whatever content sits
// between them — as opposed to editorial components, the building blocks
// used to actually compose a page. This is a fixed, hardcoded set of
// categories (not derived from the crawl data, e.g. "used on every page")
// so the same kinds of components always land as functional regardless of
// how many pages happened to get sampled. Matched against a component's UX
// Title; a title matching none of these is editorial.
//
// "site header" (not bare "header") deliberately excludes things like
// "Page Header Banner" — an editorial banner that merely has "header" in
// its name — while still matching "Site Header / Navigation": the header
// *is* the site's navigation, one category, not two.
const FUNCTIONAL_COMPONENT_PATTERNS: RegExp[] = [
  /\btop\s*bar\b/i,
  /\bsite\s+header\b/i,
  /\bnavigation\b/i,
  /\bnav\s*bar\b/i,
  /\bcookie\s*(bar|banner|consent|notice)\b/i,
  /\bfly[\s-]?out\b/i,
  /\bmega\s*menu\b/i,
  /\bsearch\b/i,
  /\bback\s*(link|to\s*top)\b/i,
  /\bbreadcrumbs?\b/i,
  /\b(site\s+)?footer\b/i,
  /\bskip\s*(link|to\s*content)\b/i,
  /\blanguage\s*switch(er)?\b/i,
];

export function isFunctionalComponent(title: string): boolean {
  return FUNCTIONAL_COMPONENT_PATTERNS.some((pattern) => pattern.test(title));
}

// The first image referenced in a component's own doc — its captured
// screenshot — used as a small preview thumbnail in the components table's
// hover card. Prefers the small pre-generated thumbnail (see
// scripts/generate-thumbnails.mjs — the raw screenshots are full-page
// captures, several MB each, too slow to load on hover) and only falls
// back to the original if that hasn't been generated for some reason.
function getComponentPreviewImage(site: string, slug: string): string | null {
  const thumbPath = path.join(OUTPUT_ROOT, site, ".thumbnails", `${slug}.webp`);
  if (fs.existsSync(thumbPath)) {
    const basePath = process.env.NEXT_BASE_PATH ?? "";
    return `${basePath}/assets/${site}/.thumbnails/${slug}.webp`;
  }

  const mdPath = path.join(OUTPUT_ROOT, site, "content", "components", `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;
  const raw = fs.readFileSync(mdPath, "utf-8");
  const { content } = matter(raw);
  const match = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (!match) return null;
  return resolveAssetSrc(site, path.dirname(mdPath), match[1]);
}

export interface ComponentsTable {
  title: string;
  beforeHtml: string;
  rows: ComponentTableRow[];
  afterHtml: string;
  headings: Heading[];
}

// Parses the "| Class | UX Title | Pages |" markdown table out of
// components/overview.md into structured rows for the real shadcn <Table>,
// keeping everything else (the intro bullets, the "## Notes" section) as
// normal prose HTML around it.
export function getComponentsTable(site: string): ComponentsTable | null {
  const mdPath = path.join(OUTPUT_ROOT, site, "content", "components", "overview.md");
  if (!fs.existsSync(mdPath)) return null;
  const raw = fs.readFileSync(mdPath, "utf-8");
  const { content } = matter(raw);
  const mdFileDir = path.dirname(mdPath);

  const lines = content.split("\n");
  const tableStart = lines.findIndex((l) => l.trim().startsWith("| Class"));
  if (tableStart === -1) {
    const { html, headings } = markdownToHtml(content, site, mdFileDir, { stripFirstHeading: true });
    return { title: "Components (0)", beforeHtml: html, rows: [], afterHtml: "", headings };
  }

  let tableEnd = tableStart + 2;
  while (tableEnd < lines.length && lines[tableEnd].trim().startsWith("|")) tableEnd++;

  const rows: ComponentTableRow[] = lines.slice(tableStart + 2, tableEnd).map((line) => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    const [cls, titleCell, pagesCell] = cells;
    const linkMatch = titleCell.match(/\[(.*?)\]\((.*?)\)/);
    const slug = linkMatch ? linkMatch[2].replace(/\.md$/, "") : "";
    const title = linkMatch ? linkMatch[1] : titleCell;
    return {
      class: cls,
      title,
      href: `/${site}/components/${slug}`,
      pages: Number(pagesCell),
      previewImage: slug ? getComponentPreviewImage(site, slug) : null,
      functional: isFunctionalComponent(title),
    };
  });

  const before = markdownToHtml(lines.slice(0, tableStart).join("\n"), site, mdFileDir, { stripFirstHeading: true });
  const after = markdownToHtml(lines.slice(tableEnd).join("\n"), site, mdFileDir);

  return {
    title: `Components (${rows.length})`,
    beforeHtml: before.html,
    rows,
    afterHtml: after.html,
    headings: [...before.headings, ...after.headings],
  };
}

export function getComponentDoc(site: string, slug: string): ContentDoc | null {
  const p = path.join(OUTPUT_ROOT, site, "content", "components", `${slug}.md`);
  return fs.existsSync(p) ? readDoc(p, site, { stripFirstHeading: true }) : null;
}

export function getPageDoc(site: string, slug: string): ContentDoc | null {
  const p = path.join(OUTPUT_ROOT, site, "content", "pages", `${slug}.md`);
  return fs.existsSync(p) ? readDoc(p, site, { stripFirstHeading: true }) : null;
}
