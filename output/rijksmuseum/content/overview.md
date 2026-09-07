---
title: Rijksmuseum — Site Inventory Overview
---

# Rijksmuseum (rijksmuseum.nl) — Site Inventory

**Test run.** This is a small, hand-picked 3-page run (homepage, "Bezoek & tickets", "Agenda") used to validate the crawl → analysis → output pipeline before running it across the full site. Numbers below reflect only these 3 pages, not the whole site.

- **Pages discovered:** 3 (explicit URL list, discovery/sampling skipped)
- **Pages captured:** 3
- **Unique templates found:** 3
- **Canonical components identified:** 10

## Scope of this run

| Page | URL | Template |
|---|---|---|
| Homepage | `/nl` | [Homepage](pages/homepage.md) |
| Bezoek & tickets | `/nl/bezoek` | [Visitor Info Page](pages/visitor-info-page.md) |
| Agenda | `/nl/zien-en-doen` | [Agenda / What's On Listing](pages/agenda-listing.md) |

Since every page in this test happens to be structurally distinct, each one produced its own template — that's expected at this scale and isn't a sign the clustering logic needs tuning yet. A larger run will show actual template reuse (e.g. individual exhibition pages, collection object pages).

## Templates

- [Homepage](pages/homepage.md) — the single landing page, hero + promo blocks + sponsor strip.
- [Visitor Info Page](pages/visitor-info-page.md) — practical "plan your visit" content with a scroll-driven image carousel.
- [Agenda / What's On Listing](pages/agenda-listing.md) — a listing/hub page pulling together exhibitions, activities, and category links.

## Components

| Component | Used on |
|---|---|
| [Site Header / Navigation](components/site-header.md) | all 3 pages |
| [Site Footer](components/site-footer.md) | all 3 pages |
| [Page Header Banner](components/page-header-banner.md) | Visitor Info, Agenda |
| [Two-Up Content Row](components/two-up-content-row.md) | Homepage, Visitor Info |
| [Full-Width Promo Block](components/full-width-promo-block.md) | Homepage |
| [Sponsor Logo Strip](components/sponsor-logo-strip.md) | Homepage |
| [Text Intro Block](components/text-intro-block.md) | Agenda, Visitor Info |
| [Highlights Carousel](components/highlights-carousel.md) | Agenda |
| [Category Link Grid](components/category-link-grid.md) | Agenda |
| [Scroll-Driven Image Carousel](components/scroll-driven-carousel.md) | Visitor Info |

## Known capture limitation

One component — the [Scroll-Driven Image Carousel](components/scroll-driven-carousel.md) on the Visitor Info page — uses `position: sticky` to drive a scroll-linked reveal animation. Full-page screenshot compositing can't represent this correctly (a well-known limitation shared by Playwright/Puppeteer, not specific to this tool): the crawler now automatically flags any unusually tall section that renders as near-blank so it's visible in the output rather than silently missing. The underlying HTML markup was still captured correctly and used for this component's description.

## Site identity, at a glance

Pulled from actual computed styles, not estimated from screenshots:

- **Base typeface:** `RijksText, Arial, sans-serif`, 17.4px / weight 400
- **Body text color:** white (`rgb(255,255,255)`) on dark/image backgrounds throughout the pages sampled
- **Footer background:** solid black (`rgb(0,0,0)`)
