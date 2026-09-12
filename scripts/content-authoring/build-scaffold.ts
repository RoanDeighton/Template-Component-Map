// Turns a crawled site's analysis.json into the batch JSON files that
// content-authoring agents work from (see STYLE_GUIDE_COMPONENTS.md /
// STYLE_GUIDE_TEMPLATES.md). Deterministic, no LLM calls — this exists so
// that step never has to be improvised by hand under time pressure again.
//
// Usage:
//   tsx scripts/content-authoring/build-scaffold.ts --input output/<site> --mode components [--batch-size 11] [--out-dir <dir>]
//   tsx scripts/content-authoring/build-scaffold.ts --input output/<site> --mode templates [--batch-size 7] [--out-dir <dir>]
//
// "templates" mode requires components to already be authored (reads
// output/<site>/content/components/*.md to resolve component links) — run
// "components" mode, author them, then run "templates" mode.
import { Command } from "commander";
import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";

const program = new Command();
program
  .requiredOption("--input <dir>", "Site output directory (containing manifest.json / analysis.json)")
  .requiredOption("--mode <mode>", "components | templates")
  .option("--batch-size <n>", "Items per batch file", (v) => parseInt(v, 10))
  .option("--out-dir <dir>", "Where to write batch-*.json files", "");
program.parse(process.argv);
const opts = program.opts();

const analysis = JSON.parse(fs.readFileSync(path.join(opts.input, "analysis.json"), "utf-8"));
const manifest = JSON.parse(fs.readFileSync(path.join(opts.input, "manifest.json"), "utf-8"));

function regionOf(p: string): "header" | "footer" | "main" {
  if (p === "header") return "header";
  if (p === "footer") return "footer";
  return "main";
}

function writeBatches(items: unknown[], batchSize: number, outDir: string, prefix: string) {
  fs.mkdirSync(outDir, { recursive: true });
  const batches: unknown[][] = [];
  for (let i = 0; i < items.length; i += batchSize) batches.push(items.slice(i, i + batchSize));
  batches.forEach((batch, i) => {
    const file = path.join(outDir, `${prefix}-batch-${i + 1}.json`);
    fs.writeFileSync(file, JSON.stringify(batch, null, 2), "utf-8");
    console.log(`  wrote ${file} (${batch.length} items)`);
  });
  return batches.length;
}

if (opts.mode === "components") {
  const pageInfoBySlug = new Map<string, any>(manifest.pages.map((p: any) => [p.slug, p]));
  const components = analysis.components
    .map((c: any) => {
      const pageSlugs = c.occurrences.map((o: any) => o.pageSlug);
      const enrichedOccurrences = c.occurrences.map((o: any) => {
        const page = analysis.pages.find((pg: any) => pg.slug === o.pageSlug);
        const block = page?.outline.find((b: any) => b.path === o.path);
        return {
          pageSlug: o.pageSlug,
          path: o.path,
          heading: block?.heading ?? null,
          textSnippet: block?.textSnippet ? block.textSnippet.slice(0, 250) : null,
          linkCount: block?.linkCount ?? null,
          imageCount: block?.imageCount ?? null,
          style: block?.style ?? null,
        };
      });
      return {
        key: c.key,
        tag: c.tag,
        classesSeen: c.classesSeen,
        usedOnCount: pageSlugs.length,
        usedOn: pageSlugs,
        representativeScreenshot: pageInfoBySlug.get(pageSlugs[0])?.screenshot,
        occurrences: enrichedOccurrences,
      };
    })
    .sort((a: any, b: any) => b.usedOnCount - a.usedOnCount);

  const batchSize = opts.batchSize || 11;
  const outDir = opts.outDir || path.join(opts.input, ".scaffold");
  console.log(`Components: ${components.length}`);
  const n = writeBatches(components, batchSize, outDir, "components");
  console.log(`${n} batches written to ${outDir}`);
} else if (opts.mode === "templates") {
  const componentsDir = path.join(opts.input, "content", "components");
  if (!fs.existsSync(componentsDir)) {
    console.error(`No ${componentsDir} — author components first (mode=components), then run mode=templates.`);
    process.exit(1);
  }

  const files: Record<string, { title: string; usedOn: Set<string> }> = {};
  for (const f of fs.readdirSync(componentsDir)) {
    if (!f.endsWith(".md") || f === "overview.md") continue;
    const raw = fs.readFileSync(path.join(componentsDir, f), "utf-8");
    const { data } = matter(raw);
    const slug = f.replace(/\.md$/, "");
    files[slug] = { title: data.title, usedOn: new Set(data.usedOn || []) };
  }

  function jaccard(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 1;
    const intersection = [...a].filter((x) => b.has(x)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 1 : intersection / union;
  }

  const lookup: Record<string, { title: string; slug: string }> = {};
  const ambiguous: string[] = [];
  for (const c of analysis.components) {
    const used = new Set(c.occurrences.map((o: any) => o.pageSlug) as string[]);
    const region = c.key.split(":")[0];
    const scored = Object.entries(files)
      .map(([slug, info]) => ({ slug, title: info.title, score: jaccard(used, info.usedOn) }))
      .sort((a, b) => b.score - a.score);
    const topScore = scored[0]?.score ?? 0;
    let tied = scored.filter((s) => s.score === topScore);
    if (tied.length > 1) {
      if (region === "header" || region === "footer") {
        const filtered = tied.filter((t) => t.slug.toLowerCase().includes(region));
        if (filtered.length) tied = filtered;
      } else {
        const filtered = tied.filter((t) => !t.slug.toLowerCase().includes("header") && !t.slug.toLowerCase().includes("footer"));
        if (filtered.length) tied = filtered;
      }
    }
    if (tied.length > 1) ambiguous.push(c.key);
    if (topScore < 0.9) console.warn(`  WARNING: no confident component match for ${c.key} (best score ${topScore.toFixed(2)} -> ${tied[0]?.slug})`);
    lookup[c.key] = { title: tied[0].title, slug: tied[0].slug };
  }
  if (ambiguous.length) {
    console.warn(`${ambiguous.length} ambiguous key(s), resolved by best guess, spot-check these:`);
    for (const k of ambiguous) console.warn(`  ${k}`);
  }

  const pageInfoBySlug = new Map<string, any>(manifest.pages.map((p: any) => [p.slug, p]));
  const templates = analysis.templates.map((t: any) => {
    const repSlug = t.pageSlugs[0];
    const page = analysis.pages.find((pg: any) => pg.slug === repSlug);
    const pInfo = pageInfoBySlug.get(repSlug);
    const outline =
      page?.outline.map((b: any) => {
        const key = `${regionOf(b.path)}:${b.fingerprint}`;
        const comp = lookup[key];
        return {
          path: b.path,
          tag: b.tag,
          heading: b.heading,
          textSnippet: b.textSnippet ? b.textSnippet.slice(0, 250) : null,
          linkCount: b.linkCount,
          imageCount: b.imageCount,
          componentTitle: comp?.title ?? null,
          componentSlug: comp?.slug ?? null,
        };
      }) ?? [];
    return {
      slug: t.slug,
      pageSlugs: t.pageSlugs,
      representativeUrl: pInfo?.url,
      representativeTitle: pInfo?.title,
      representativeScreenshot: pInfo?.screenshot,
      outline,
    };
  });

  const unresolved = templates.reduce((sum: number, t: any) => sum + t.outline.filter((b: any) => !b.componentSlug).length, 0);
  console.log(`Templates: ${templates.length}, outline blocks: ${templates.reduce((s: number, t: any) => s + t.outline.length, 0)}, unresolved: ${unresolved}`);
  if (unresolved > 0) console.warn("Unresolved outline blocks mean a component exists in analysis.json with no matching authored file — check output above.");

  const batchSize = opts.batchSize || 7;
  const outDir = opts.outDir || path.join(opts.input, ".scaffold");
  const n = writeBatches(templates, batchSize, outDir, "templates");
  console.log(`${n} batches written to ${outDir}`);
} else {
  console.error(`Unknown mode "${opts.mode}", expected "components" or "templates".`);
  process.exit(1);
}
