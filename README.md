# Site Inventory Tool

Given a starting URL, this produces a documented inventory of a website's unique page templates and reusable components — without visiting every single page — and publishes it as a browsable docs site.

The pipeline has four stages, each a separate step on purpose (so re-tuning the analysis doesn't mean re-crawling):

1. **Crawl** (`src/crawl.ts`) — discovers URLs, groups them by path pattern, samples repeating patterns instead of visiting every page, and captures a screenshot + HTML for each page it keeps. Also captures the cookie consent banner itself (before dismissing it) as its own asset — see `src/lib/cookies.ts`.
2. **Analyze** (`src/analyze.ts`) — extracts a structural outline from each page's HTML, clusters pages into templates, and reconciles components used across multiple templates.
3. **Write content** — turn that structural data into the actual descriptive Markdown (what a section *is*, what it holds, its variants). **This step is not automated** — it means reading the generated screenshots/outline and writing `output/<site>/content/**/*.md` by hand (or with Claude's help). `analyze.ts` gives you the scaffolding, not the prose. See "Writing content" below for the exact format the presentation layer expects.
4. **Present** (`web/`) — a Next.js + real shadcn/ui app, statically exported. One shared presentation layer reused for every inventoried site — it reads every `output/<site>/content/` folder generically (site names are never hardcoded), so adding a new site inventory needs zero code changes to `web/`.

## Prerequisites

- Node.js (v20+) and npm
- Playwright's Chromium browser: `npx playwright install chromium` (one-time, after `npm install`)

## Running it on a site

```bash
npm install

# 1. Crawl — discovers, samples, and captures pages
npm run crawl -- --url https://example.com --output output/example-site

# 2. Analyze — extracts outline/templates/components from the crawl
npm run analyze -- --input output/example-site

# 3. Write content by hand into output/example-site/content/
#    (see "Writing content" below — the format is enforced by the
#    presentation layer, not just a style convention)

# 4. Preview locally (reads every site under output/*, this one included)
npm install --prefix web
npm run dev --prefix web
# → http://localhost:3000/example-site

# 5. Production build (what gets deployed — see "Hosting" below)
npm run build --prefix web
```

### Crawl options worth knowing about

Run `npm run crawl -- --help` for the full list. The ones you're most likely to need:

| Flag | Default | What it does |
|---|---|---|
| `--sample-size` | 4 | Pages to sample per repeating pattern group (e.g. blog posts, product pages) |
| `--page-cap` | 200 | Hard cap on total pages captured — a safety net independent of sampling |
| `--only-urls` | — | Comma-separated exact URLs to capture, skipping discovery entirely. Good for a small test run before committing to a full crawl. |
| `--locale-prefix` | auto-detected | Restricts the crawl to one locale path (e.g. `nl`) on multi-language sites. Auto-detected from `--url` when it starts with a language code; pass `none` to disable. |
| `--collapse-threshold` | 5 | How many sibling URLs at a path segment before it's treated as a repeating pattern rather than distinct pages |

The crawler also automatically: respects `robots.txt`, dismisses cookie banners (preferring reject/decline, and screenshotting the banner itself first), waits for lazy-loaded images before screenshotting, crops out real horizontal-overflow layout bugs rather than letting them blow out the screenshot width, and flags sections that render near-blank (usually a `position: sticky` scroll-driven component that a static full-page screenshot can't represent — see "Known limitations" below).

Every crawl produces, in `output/<site>/`:
- `pages/<slug>/screenshot.png`, `page.html`, `styles.json` (per captured page)
- `pages/<slug>/cookie-bar.png` — only on whichever page happened to load first, only if a cookie banner was actually found
- `manifest.json` — what was captured and why
- `failures.json` — every URL that failed to load, with the reason (never silently dropped)

Every analysis run additionally produces `analysis.json` — the structural outline, template clusters, and component reconciliation the crawl's HTML/screenshots were turned into.

### Writing content

`analysis.json` tells you *what's structurally there*; it doesn't write the description. For each template and component, look at its screenshot(s) and outline entries in `analysis.json`, then write a `.md` file describing what it actually is. Unlike the crawl/analyze stages, **the presentation layer (`web/`) parses this content structurally, not just as prose** — a few things are load-bearing, not stylistic choices:

**`output/<site>/content/overview.md`** (the homepage) — frontmatter `title`, then whatever intro copy you like, with one required marker: a literal `<!-- stat-blocks -->` HTML comment on its own line, wherever you want the "N Components / N Pages" stat cards to appear. Without it, the cards simply don't render (the rest of the content still does) — see `output/rijksmuseum/content/overview.md` for a worked example, including the hand-styled classes (`.eyebrow`, `.callout`, `.how-steps`, `.identity-list`) already themed in `web/app/globals.css`.

**`output/<site>/content/components/overview.md`** — frontmatter `title`, then a markdown table with the *exact* header `| Class | UX Title | Pages |` (the parser in `web/lib/content.ts`'s `getComponentsTable()` matches on that literal string to find where the table starts). Each row:

```md
| <css-class-or-element> | [<UX Title>](<slug>.md) | <pages-count> |
```

The UX Title column must be a markdown link — its target (`<slug>.md`) becomes the component's URL and is used to look up its preview thumbnail; a plain (non-linked) cell breaks both. Content before the table renders as the page's intro; content after it (e.g. a `## Notes` section) renders below the table.

**Functional vs. Editorial** — the overview page and sidebar automatically split components into these two groups. Classification is a fixed set of title-matching patterns (`isFunctionalComponent()` in `web/lib/content.ts`), not derived from the crawl data, so it's consistent across every site: give a component's UX Title one of these words/phrases and it lands in Functional — `top bar`, `header` (only as `site header`, to avoid matching e.g. "Page Header Banner"), `navigation`, `nav bar`, `cookie bar/banner/consent/notice`, `fly-out`/`flyout`, `mega menu`, `search`, `back link`/`back to top`, `breadcrumb(s)`, `footer` (bare or `site footer`), `skip link`/`skip to content`, `language switch(er)`. Anything else is Editorial. Update that list directly in code if a new site's chrome uses different vocabulary.

**Individual component/page docs** (`content/components/<slug>.md`, `content/pages/<slug>.md`) — frontmatter `title` (shown as the page's `<h1>` and in nav/search — the doc's own first `# Heading` in the body is stripped and *not* shown, so don't rely on it for the title), then a `![alt](path/to/image.png)` embed (paths are relative to the `.md` file, same as any markdown), then description and any `## ` subsections (e.g. "Measured styles", "Variants observed" — freeform, these just become normal headings picked up by the page's own "On This Page" TOC).

`output/<site>/site.json` — optional `{ "title": ..., "description": ... }`, used for the `<title>`/meta description; falls back to the site's folder name if missing.

See `output/rijksmuseum/content/` in full for a real worked example of everything above.

**Images:** anything under `output/<site>/pages/**` referenced from content is served automatically (via a symlink into `web/public/assets/<site>/`) — no need to copy files anywhere. Two scripts run automatically before both `next dev` and `next build` (wired as `predev`/`prebuild` in `web/package.json`, no manual step needed): `scripts/optimize-content-images.mjs` compresses any source image over 150KB into a `.webp` sibling that content resolution prefers automatically, and `scripts/generate-thumbnails.mjs` generates a small (480px) preview thumbnail per component for the overview table's hover card. Cropping a component-specific preview image out of a full page screenshot (rather than embedding the whole thing) uses the `top`/`height` data already captured per section in each page's `styles.json` — `sharp(...).extract({ left: 0, top, width, height })`; there's no dedicated script for this yet, it's done ad hoc per component.

## Hosting

`web/` is the **single shared presentation layer** — its design doesn't change between sites; it reads every `output/<site>/content/` folder it finds generically via `listSites()` (`web/lib/content.ts`), so multiple site inventories are served from one build, each under its own `/<site>/` route.

It's a static export (`output: "export"` in `web/next.config.ts`) — no server needed at runtime, just files. `NEXT_BASE_PATH` (set by the deploy workflow to `/<repo-name>`) prefixes every internal link and asset for GitHub Pages' subpath hosting; it's empty for local dev.

`.github/workflows/deploy.yml` builds `web/` once — covering every site under `output/*/` in that single build — and publishes the static export to GitHub Pages. Adding a new site inventory needs zero workflow changes, as long as it has a `content/overview.md`. Deploys on every push to `main`.

**First-time setup for a new fork/clone:** GitHub Pages needs enabling once, with "Source: GitHub Actions", in the repo's Settings → Pages (or via `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`). Note GitHub Pages requires the repo to be **public** on GitHub's free plan (private repos need GitHub Pro/Team/Enterprise for Pages).

The deployed site is unlisted, not indexed — reachable by direct link only (`robots.txt` + per-page `noindex` metadata).

## Known limitations

- **Scroll-driven / `position: sticky` components** can't be fully represented by a static full-page screenshot — this is a fundamental limitation of full-page screenshot compositing (Playwright/Puppeteer/Chromium), not specific to this tool. The crawler flags unusually-tall, near-blank sections automatically (`src/lib/flagBlankSections.ts`) so this is visible in the output rather than silently wrong, but the fix (a targeted, scrolled-into-view screenshot of just that section) isn't built yet.
- **Component reconciliation only looks one level under `<main>`** (`src/analyze.ts`). A component nested inside a generic wrapper section (rather than a direct child of `<main>`) can be missed when matching it against the same component used elsewhere — see the "Two-Up Content Row" component doc in `output/rijksmuseum/content/components/` for a concrete example this affected. Worth fixing before running this on a site with a lot of generic wrapper sections.
- The blank-section flagging threshold (`LOW_VARIANCE_STDDEV` in `src/lib/flagBlankSections.ts`) was tuned on one real example, not validated broadly.
- **Cookie banner capture** only recognizes English and Dutch reject/accept phrasing for non-vendor (custom) banners; known vendors (OneTrust, Cookiebot, Didomi) are matched by selector regardless of language. See `src/lib/cookies.ts`.
