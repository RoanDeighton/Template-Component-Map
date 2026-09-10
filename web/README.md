# Site Inventory — presentation layer

This is the shared frontend for every site inventory produced by the crawler/analyzer in the repo root — see the [root README](../README.md) for the full pipeline. It's a Next.js App Router app using real shadcn/ui (on Base UI, not Radix), statically exported for GitHub Pages.

It's a **read-only renderer**, not a content editor: it reads `../output/<site>/content/**/*.md` (and the images alongside it) at build time via `lib/content.ts`, generically for every site it finds — no site name is ever hardcoded here. See the root README's "Writing content" section for the exact markdown format this app expects.

## Local development

From the repo root (installs the crawler/analyzer deps too, needed for `output/` to exist):

```bash
npm install
npm install --prefix web
npm run dev --prefix web
```

Or from inside `web/` directly: `npm install && npm run dev`. Either way, `predev` runs two asset scripts first (`scripts/optimize-content-images.mjs`, `scripts/generate-thumbnails.mjs`) — see the root README for what they do.

Open `http://localhost:3000/<site>` for whichever site exists under `../output/`.

## Building

```bash
npm run build
```

Static export to `out/` (`output: "export"` in `next.config.ts`). Set `NEXT_BASE_PATH=/<repo-name>` when building for GitHub Pages' subpath hosting (the deploy workflow does this automatically) — leave it unset for a build meant to be served from the domain root.

## Structure

- `app/[site]/` — the dynamic per-site routes: home, `/components`, `/pages`, and their `[slug]` detail pages, all under a shared `(sidebar)` layout group.
- `components/` — app-specific components (sidebar, search, the components table, doc navigation) plus `components/ui/` — shadcn primitives, installed via the shadcn CLI, not hand-written.
- `lib/content.ts` — the entire content-reading layer: parses markdown/frontmatter, resolves image paths, classifies components as Functional/Editorial, builds the search index. If you're wondering "where does X get computed", it's here.
- `scripts/` — build-time asset generation (thumbnails, compressed images), not part of the request path.
