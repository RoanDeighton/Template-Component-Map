# Handoff — Site Inventory Tool (2026-09-12)

## What this project is

A tool that crawls a website, analyzes its structure into templates/components, and generates a browsable documentation site (Next.js + real shadcn/ui on Base UI). Two real datasets now:

- **Rijksmuseum**: a hand-picked 3-page test crawl (homepage, Agenda listing, Visitor Info page) → 11 components, 3 page templates.
- **Revolut**: an automated nav+footer-first crawl of the "Personal" tab → 79 pages, 44 components, 50 page templates. First real proof the pipeline generalizes past Rijksmuseum, and the source of most of the fixes below.

Deployed to GitHub Pages via static export.

Repo root: `/Users/roandeighton/code/site-inventory-tool`
- `web/` — the Next.js app (this is what you build/dev in)
- `output/<site>/` — crawler output + hand-authored content per site (`rijksmuseum/`, `revolut/`)
- `src/` — the crawler/analyzer pipeline

See **[AGENTS.md](AGENTS.md)** for the durable technical reference (fingerprint design, wrapper-peeling, stable-ID detection, content-authoring workflow) — that's the file to read before touching `src/analyze.ts` or authoring a new site's content.

Git state: clean working tree except this session's uncommitted work (see below) — nothing pushed.

## Standing conventions (read these first)

- **[CLAUDE.md](CLAUDE.md)** (repo root, auto-loaded every session): all client-facing copy gets run through the `humanizer` skill before committing. No em/en dashes, no AI-vocabulary clusters, no dev jargon a visitor wouldn't recognize. Code itself is exempt.
- **[AGENTS.md](AGENTS.md)** (repo root, new this session): the site-agnostic-fixes-only principle, the crawler/analyzer architecture, and the content-authoring workflow checklist. Read this before extending `src/` or authoring a new site.
- **Never push without being asked, every time.** Commit locally by default; push only on explicit request each time.
- **Never commit unless asked.** Same standing rule, reconfirmed this session.
- Destructive git ops need explicit confirmation first.
- Offer **light vs. full content-authoring mode** up front once a new site finishes crawling — don't assume either.

## What happened this session (chronological, high level)

Starting point: Rijksmuseum-only, `src/` untouched for a while. Goal: make the crawler smarter about page selection and prove the pipeline works on a real, much larger site.

1. **Crawler redesign**: replaced open-ended sitemap+BFS discovery with nav/footer-first discovery (`src/lib/navDiscovery.ts`) — follow header/nav/footer links, sample listing pages found along the way, review checkpoint before the expensive capture step, with the old approach kept as `--legacy-discovery` / "expand search" fallback. Added interactive prompts (`src/lib/interactivePrompts.ts`) and a locale-selection question.
2. **First Revolut crawl** (79 pages, "Personal" tab only, "Business"/"Company" excluded) — caught and fixed a real bug during testing: listing samples were being taken per source page instead of merged-by-pattern-then-sampled-once, causing duplicate/inflated capture lists.
3. **First content-authoring pass** (87 components, 50 templates) — built the full component + page doc set via parallel batch agents. Along the way, fixed a WebP image-optimization crash on very tall stitched screenshots (a general `web/scripts/optimize-content-images.mjs` bug, would hit any site with long pages) and a sidebar CSS bug where long titles wrapped and overlapped the next nav item (Rijksmuseum's short titles never exposed this).
4. **Discovered real over-fragmentation**: the user spotted that many "different" components (FAQ Accordion vs. Plain FAQ List, three separate "Legal Document" variants, Plan Tier Card List vs. Plan Overview Cards) were actually the same real widget, split apart by `analyze.ts`'s clustering being too fine-grained. Root-caused to the fingerprint's element/heading-count buckets penalizing content-length variation, and the DOM tag being part of the fingerprint even for cross-template widgets.
5. **Fixed the clustering algorithm** (see AGENTS.md for full detail): coarsened count buckets, dropped tag from the main-region fingerprint, decoupled a separate fine-grained `templateFingerprint()` so template/page clustering didn't inherit the component fingerprint's new looseness, added generic stable-content-block-ID detection (found `data-blockid` on Revolut) as a supplementary merge signal, and fixed `buildOutline()` to peel through layout-only wrapper divs that were collapsing whole pages' worth of real sections into one outline entry. Net effect: 87 → 44 components, with template count unaffected (50 → 50, precision preserved) once decoupled.
6. **Second content-authoring pass** against the corrected analysis: rewrote all 44 components (baking in cropped example images from the start this time, using the per-section bounding-box data already captured), then rebuilt the 50 page docs' cross-links. Found and fixed 3 more slug collisions from parallel batches, a stale-`usedOn` bug in the site header doc that was causing lookup ambiguity, and manually re-authored the handful of pages (`business`, `ultra-plan`, the 3 legal pages, `our-pricing-plans`) whose outlines changed shape enough (wrapper-peeling exposing real sections that were previously invisible) that a pure link-swap wasn't accurate. `air-ai-by-revolut` needed a brand new page doc (its template cluster changed once `business`+`revolut-plus` merged into one template).
7. **Final QA pass**: validated every component/page doc's YAML parses, every cross-link resolves to a real file, no banned words/dashes anywhere, verified live in the browser (components table, individual component pages showing correct crops/usedOn/"captured live from" captions, page docs showing correct section outlines).

## Current architecture notes worth knowing

- **`web/lib/content.ts`** is the single read layer over `output/<site>/`. `listSites()` gates on `content/overview.md` existing — a site with crawl data but no `content/` folder is invisible everywhere, silently, not a crash. `getComponentDoc()`'s `usedOn`/`Amount` only counts pages that have their *own* page doc file (`toPageRef()` requires a match in `listPages()`) — a page absorbed into another template's "also used on" list doesn't count itself here. This under-counts true usage for any component that appears on a non-representative page of a multi-page template; a pre-existing design choice, not something introduced this session, but worth knowing before trusting "Amount" as a precise number on a site with many multi-page templates.
- **`src/analyze.ts`** — see AGENTS.md. The short version: `contentFingerprint()` (coarse, component identity) and `templateFingerprint()` (fine, page/template similarity) are deliberately separate; `detectStableIdAttr()` only trusts UUID-shaped values as literal instance IDs, never human-readable role labels.
- **Component doc frontmatter schema** unchanged from the original Rijksmuseum design: `title`, `class`, `examples: [{image, capturedFromPage}]`, `usedOn: [pageSlug]`, `cmsFields: [{name, type, required, description}]`. Body is just the description paragraph, no headers.
- **Page/template doc schema**: frontmatter (`title`, `url`, `screenshot`), then H1, meta line, screenshot embed, intro paragraph, `## Section outline (top to bottom)` (numbered, links to component docs), `## Content pattern` paragraph. `Variants observed` only when something genuinely unusual stands out.
- **`components/overview.md`** must stay one flat table — see AGENTS.md, this broke once already this session.

## Nothing currently pending, but nothing is committed either

All of this session's work — the `src/` fixes, the two new lib files, `AGENTS.md`, this file, and the full `output/revolut/content/` tree — is sitting uncommitted. Commit only when asked; push only when asked, every time.

## Natural next steps (not requested, just visible from here)

- `output/revolut/content/` covers the crawl's "Personal" tab only, by deliberate scope decision (see the crawl session that produced it). "Business" and "Company" were never crawled.
- The one known remaining false-merge case flagged during QA: a legal disclosure page's own numbered body text got fingerprint-matched to the FAQ Accordion component (both are heading-heavy, link-bearing content blocks). Noted honestly in the affected page docs' Section Outline rather than silently forced into a misleading link; a genuine fix would need a richer signal than the current 7-field fingerprint.
- CMS field data (`cmsFields`) is still entirely hand-authored. Crawler-side automation was discussed early in the project's history and deliberately left as a future idea, not started — "required" can only ever be a presence-based proxy from rendered HTML, never true schema-level required/optional.
