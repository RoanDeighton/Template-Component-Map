// One-shot QA gate for a site's authored content — run this after any
// authoring pass and fix everything it reports before considering the pass
// done. Replaces the ad hoc validation scripts that used to get rewritten
// by hand under time pressure each session.
//
// Usage: tsx scripts/content-authoring/validate-content.ts --input output/<site>
//
// Checks:
//   - every component/page doc's YAML frontmatter actually parses
//   - every canonical component in analysis.json has exactly one matching
//     authored file (catches both missing files and slug collisions, where
//     two different components silently landed on the same filename)
//   - every component link inside a page doc resolves to a real file
//   - no banned dashes/vocabulary in prose (CLAUDE.md content-style rules)
import { Command } from "commander";
import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";

const program = new Command();
program.requiredOption("--input <dir>", "Site output directory");
program.parse(process.argv);
const opts = program.opts();

const BANNED_WORDS = ["vibrant", "seamless", "robust", "leverage", "testament", "underscores", "elevate", "empower", "delve", "showcase", "boasts"];

let issues = 0;
function report(msg: string) {
  console.log(`  ${msg}`);
  issues++;
}

function readMd(file: string): { data: any; content: string } | null {
  const raw = fs.readFileSync(file, "utf-8");
  try {
    return matter(raw);
  } catch (e: any) {
    report(`${file}: YAML error: ${e.message}`);
    return null;
  }
}

function checkStyle(file: string, content: string) {
  if (/—|–/.test(content)) report(`${file}: em/en dash in body`);
  for (const word of BANNED_WORDS) {
    const re = new RegExp(`.{0,30}\\b${word}\\b.{0,30}`, "gi");
    for (const m of content.matchAll(re)) {
      if (!/["'“]/.test(m[0])) report(`${file}: banned word "${word}": ...${m[0]}...`);
    }
  }
}

console.log("=== Components ===");
const componentsDir = path.join(opts.input, "content", "components");
const componentFiles: Record<string, { title: string; usedOn: Set<string> }> = {};
if (fs.existsSync(componentsDir)) {
  for (const f of fs.readdirSync(componentsDir)) {
    if (!f.endsWith(".md") || f === "overview.md") continue;
    const parsed = readMd(path.join(componentsDir, f));
    if (!parsed) continue;
    checkStyle(path.join(componentsDir, f), parsed.content);
    const slug = f.replace(/\.md$/, "");
    componentFiles[slug] = { title: parsed.data.title, usedOn: new Set(parsed.data.usedOn || []) };
  }
  console.log(`${Object.keys(componentFiles).length} component files checked`);
} else {
  console.log("(no content/components/ directory)");
}

// Cross-reference against analysis.json's canonical components, if present
const analysisPath = path.join(opts.input, "analysis.json");
if (fs.existsSync(analysisPath) && Object.keys(componentFiles).length > 0) {
  const analysis = JSON.parse(fs.readFileSync(analysisPath, "utf-8"));
  function jaccard(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 1;
    const intersection = [...a].filter((x) => b.has(x)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 1 : intersection / union;
  }
  // Two different components can legitimately share an identical (or
  // near-identical) usedOn set by coincidence — e.g. a site's main footer
  // and its stripped-down "legal page" footer variant can each appear on
  // a disjoint but same-shaped set of pages. Jaccard alone can't tell them
  // apart in that case, so break ties using the key's own region
  // (header:/footer:/main:) against the filename, same logic used in
  // build-scaffold.ts's templates mode — keep both in sync.
  const bestMatchPerKey = analysis.components.map((c: any) => {
    const used = new Set(c.occurrences.map((o: any) => o.pageSlug) as string[]);
    const region = c.key.split(":")[0];
    const scored = Object.entries(componentFiles)
      .map(([slug, info]) => ({ slug, score: jaccard(used, info.usedOn) }))
      .sort((a, b) => b.score - a.score);
    const topScore = scored[0]?.score ?? -1;
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
    return { key: c.key, slug: tied[0]?.slug ?? "", score: topScore };
  });
  const missing = bestMatchPerKey.filter((m: any) => m.score < 0.9);
  if (missing.length) {
    report(`${missing.length} canonical component(s) with no confidently-matching file (missing, or lost in a slug collision):`);
    for (const m of missing) console.log(`      ${m.key} (best guess: ${m.slug}, score ${m.score.toFixed(2)})`);
  }
  const bySlug = new Map<string, string[]>();
  for (const m of bestMatchPerKey) {
    if (m.score < 0.9) continue;
    if (!bySlug.has(m.slug)) bySlug.set(m.slug, []);
    bySlug.get(m.slug)!.push(m.key);
  }
  for (const [slug, keys] of bySlug) {
    if (keys.length > 1) report(`Slug collision: "${slug}" matches ${keys.length} different canonical components (only one file, one is missing/wrong)`);
  }
}

console.log("\n=== Pages ===");
const pagesDir = path.join(opts.input, "content", "pages");
const pageFiles = new Set<string>();
if (fs.existsSync(pagesDir)) {
  for (const f of fs.readdirSync(pagesDir)) {
    if (!f.endsWith(".md")) continue;
    const parsed = readMd(path.join(pagesDir, f));
    if (!parsed) continue;
    checkStyle(path.join(pagesDir, f), parsed.content);
    pageFiles.add(f.replace(/\.md$/, ""));

    // Broken component links
    for (const m of parsed.content.matchAll(/\]\(\.\.\/components\/([a-z0-9-]+)\.md\)/g)) {
      if (!componentFiles[m[1]]) report(`${f}: links to missing component "${m[1]}"`);
    }
  }
  console.log(`${pageFiles.size} page files checked`);

  if (fs.existsSync(analysisPath)) {
    const analysis = JSON.parse(fs.readFileSync(analysisPath, "utf-8"));
    const templateSlugs = new Set(analysis.templates.map((t: any) => t.slug));
    for (const slug of templateSlugs) if (!pageFiles.has(slug as string)) report(`Missing page doc for template "${slug}"`);
    for (const slug of pageFiles) if (!templateSlugs.has(slug)) report(`Page doc "${slug}" doesn't match any current template (stale from a previous clustering?)`);
  }
} else {
  console.log("(no content/pages/ directory)");
}

console.log(`\n${issues === 0 ? "All checks passed." : `${issues} issue(s) found.`}`);
process.exit(issues === 0 ? 0 : 1);
