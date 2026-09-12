# Task: write page/template documentation for a site inventory tool

You're documenting page templates found by crawling and analyzing `<SITE_URL>`. Each "template" is a cluster of pages that share the same underlying structure. This is one batch of a larger job; other agents handle other templates in parallel.

## Content style rules (STRICT, project-wide via CLAUDE.md)

- No em dashes or en dashes anywhere in prose.
- No AI-vocabulary clusters: never "vibrant", "seamless", "robust", "leverage", "testament", "underscores", "elevate", "empower", "delve", "showcase", "boasts". No promotional/marketing tone.
- No padded inline-header bullet lists.
- No hedging ("might", "could potentially").
- Short, plain, technical sentences. Prefer specific quoted UI copy over vague claims.

## Exact schema (mirror this structure and length precisely)

```
---
title: <Human-readable page name, Title Case, e.g. "Bank Account Product Page">
url: <the page's real path, e.g. /bank-account>
screenshot: ../../pages/<pageSlug>/screenshot.png
---

# <Title>

**URL:** `<path>` (page title: "<real <title> tag text>") · **Occurrences:** <N> page(s) in this run<if N>1, list the other pageSlugs briefly>

![<Title> screenshot](../../pages/<pageSlug>/screenshot.png)

<One paragraph: what kind of page this is and what it's for. 1-3 sentences.>

## Section outline (top to bottom)

1. **[<Component Title>](../components/<component-slug>.md)**: <one short clause naming what this component actually is or does, so the outline reads as a complete account of the page on its own — the link is for deep-dive detail (CMS fields, full description), not a requirement just to know what's there><, then optionally: a note on what this specific instance shows, quoting real heading/text from the data given>
2. **[<Component Title>](../components/<component-slug>.md)**: <short clause>
...(one line per outline block, in order, always linking to the given componentSlug)

## Content pattern

<One paragraph describing the overall pattern/purpose this template follows, how its sections work together.>
```

Do not add a "Variants observed" section unless something genuinely unusual stands out (rare), most templates just need Section outline + Content pattern.

### Real approved example (mirror this exactly for length/tone)

```
---
title: Visitor Info Page
url: /nl/bezoek
screenshot: ../../pages/nl-bezoek/screenshot.png
---

# Visitor Info Page

**URL:** `/nl/bezoek` (page title: "Bezoek het Rijksmuseum" / "Visit the Rijksmuseum") · **Occurrences:** 1 in this test run

![Visitor info page screenshot](../../pages/nl-bezoek/screenshot.png)

The "plan your visit" page: practical info (hours, pricing) paired with persuasive content (why visit, testimonials). More layout variety than the Agenda page, including a scroll-driven storytelling carousel.

## Section outline (top to bottom)

1. **[Site Header / Navigation](../components/site-header.md)**: persistent nav with search, language switching, and ticket purchasing.
2. **[Page Header Banner](../components/page-header-banner.md)**: "Bezoek het Rijksmuseum" title over a photo of visitors viewing a Vermeer painting, with a compact "Volwassenen / t/m 18 jaar" (Adults / Under 18) pricing summary box and a "Praktische informatie" (Practical info) link docked to the right of the intro text.
3. **[Text Intro Block](../components/text-intro-block.md)**: short paragraph ("In Amsterdam is veel te doen...") with a "Kom meer te weten over je bezoek" (Learn more about your visit) link.
4. **[Two-Up Content Row](../components/two-up-content-row.md)**: two navigational tiles, "Agenda en activiteiten" (link to the Agenda page) and "Praktische info" (practical info).
5. **[Site Footer](../components/site-footer.md)**: visiting info, secondary navigation, and trust signals.

## Content pattern

This template mixes marketing content (testimonials, feature highlights) with transactional/practical content (pricing, hours) more than either other template in this test. It's doing double duty as both a sales page and a reference page.
```

## Your data

Your batch file is JSON: an array of template objects, each with `slug`, `pageSlugs` (all pages using this template), `representativeUrl`, `representativeTitle`, `representativeScreenshot`, and `outline` (ordered array of blocks, each with `path`, `tag`, `heading`, `textSnippet`, `linkCount`, `imageCount`, `componentTitle`, `componentSlug`, componentSlug is ALREADY resolved for you, always use it verbatim for the link, never invent your own).

For each template:
1. Read the representative screenshot to understand the page's actual layout before writing.
2. Write the numbered Section outline using the outline array IN ORDER, one line per block, linking `[componentTitle](../components/componentSlug.md)` and including a short inline clause on what it actually is (per the schema above), plus a per-instance note when this specific occurrence has something worth calling out.
3. If `pageSlugs` has more than one entry, mention the others briefly in the meta line (e.g. "also used on: X, Y"), don't write a Section outline for each, one representative outline is enough.
4. Determine a human title from `representativeTitle`/`representativeUrl` (strip marketing suffixes like "| Site Name").

## Output

Write each file to `<REPO_ROOT>/output/<SITE>/content/pages/<slug>.md` using the template's own `slug` field verbatim as the filename (already URL-safe).

## Batch dispatch notes (for whoever is orchestrating this, not the writing agent)

- Templates must be authored *after* components are finalized, page docs link to components by name; author components first or the links have nothing to point to.
- If re-authoring after a clustering fix, don't assume page-to-template groupings are unchanged, verify with `scripts/content-authoring/build-scaffold.ts` against the current `analysis.json` rather than reusing an old batch file.
- After all batches finish, run `scripts/content-authoring/validate-content.ts`.
