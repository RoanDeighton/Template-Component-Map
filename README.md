# Site Inventory Tool

Given a starting URL, this produces a documented inventory of a website's unique page templates and reusable components — without visiting every single page — and publishes it as a browsable docs site.

The pipeline has four stages, each a separate step on purpose (so re-tuning the analysis doesn't mean re-crawling):

1. **Crawl** (`src/crawl.ts`) — discovers URLs, groups them by path pattern, samples repeating patterns instead of visiting every page, and captures a screenshot + HTML for each page it keeps.
2. **Analyze** (`src/analyze.ts`) — extracts a structural outline from each page's HTML, clusters pages into templates, and reconciles components used across multiple templates.
3. **Write content** — turn that structural data into the actual descriptive Markdown (what a section *is*, what it holds, its variants). **This step is not automated** — it means reading the generated screenshots/outline and writing `output/<site>/content/**/*.md` by hand (or with Claude's help). `analyze.ts` gives you the scaffolding, not the prose.
4. **Present** (`site-template/`) — one shared VitePress site config, reused for every inventoried site. Only the content and site title vary per site.

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
#    (see "Writing content" below)

# 4. Preview locally
SITE=example-site npm run site:dev

# 5. Production build (what gets deployed)
SITE=example-site npm run site:build
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

The crawler also automatically: respects `robots.txt`, dismisses cookie banners (preferring reject/decline), waits for lazy-loaded images before screenshotting, crops out real horizontal-overflow layout bugs rather than letting them blow out the screenshot width, and flags sections that render near-blank (usually a `position: sticky` scroll-driven component that a static full-page screenshot can't represent — see "Known limitations" below).

Every crawl produces, in `output/<site>/`:
- `pages/<slug>/screenshot.png`, `page.html`, `styles.json` (per captured page)
- `manifest.json` — what was captured and why
- `failures.json` — every URL that failed to load, with the reason (never silently dropped)

Every analysis run additionally produces `analysis.json` — the structural outline, template clusters, and component reconciliation the crawl's HTML/screenshots were turned into.

### Writing content

`analysis.json` tells you *what's structurally there*; it doesn't write the description. For each template and component, look at its screenshot(s) and outline entries in `analysis.json`, then write a `.md` file into `output/<site>/content/pages/` or `output/<site>/content/components/` describing what it actually is — see `output/rijksmuseum/content/` for a worked example of the expected shape (frontmatter `title`, an embedded screenshot via `![...]`, a description, variants observed). `output/<site>/content/overview.md` should summarize counts (pages discovered/captured, templates, components).

Cropping a component-specific preview image (rather than embedding the whole page screenshot) uses the `top`/`height` data already captured per section in each page's `styles.json` — `sharp(...).extract({ left: 0, top, width, height })`. There's no dedicated script for this yet; it was done ad hoc for the Rijksmuseum example.

## Hosting

`site-template/.vitepress/config.ts` is the **single shared presentation layer** — its design doesn't change between sites; only two things vary per site, read at build time:

- `SITE` env var — which `output/<SITE>/` folder to serve content from
- `output/<SITE>/site.json` — that site's `{ "title": ..., "description": ... }`

Since GitHub Pages serves exactly one site per repo but this repo can hold many site inventories, `.github/workflows/deploy.yml` builds **every** `output/*/` folder that has a `content/overview.md`, into its own subfath of one combined deploy (`/<repo>/<site>/`), plus a small landing page linking to each. Adding a new site inventory needs zero workflow changes — it's discovered automatically. It deploys on every push to `main`.

**First-time setup for a new fork/clone:** GitHub Pages needs enabling once, with "Source: GitHub Actions", in the repo's Settings → Pages (or via `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`). Note GitHub Pages requires the repo to be **public** on GitHub's free plan.

## Known limitations

- **Scroll-driven / `position: sticky` components** can't be fully represented by a static full-page screenshot — this is a fundamental limitation of full-page screenshot compositing (Playwright/Puppeteer/Chromium), not specific to this tool. The crawler flags unusually-tall, near-blank sections automatically (`src/lib/flagBlankSections.ts`) so this is visible in the output rather than silently wrong, but the fix (a targeted, scrolled-into-view screenshot of just that section) isn't built yet.
- **Component reconciliation only looks one level under `<main>`** (`src/analyze.ts`). A component nested inside a generic wrapper section (rather than a direct child of `<main>`) can be missed when matching it against the same component used elsewhere — see the "Two-Up Content Row" component doc in `output/rijksmuseum/content/components/` for a concrete example this affected. Worth fixing before running this on a site with a lot of generic wrapper sections.
- The blank-section flagging threshold (`LOW_VARIANCE_STDDEV` in `src/lib/flagBlankSections.ts`) was tuned on one real example, not validated broadly.
