---
title: "Partou: Components"
---

# Components (15)

The site's structural chrome (header, footer, skip link, cookie bar) plus the recurring content blocks identified across a sample of pages: hero banners, alternating image/text rows, card grids, testimonials, CTA banners, the location finder, and the blog templates.

- **Class**: the component's CSS class, ID, or HTML element if the markup doesn't give it a class
- **UX Title**: the descriptive name used throughout this inventory

| Class | UX Title | Pages |
|---|---|---|
| header | [Site Header / Navigation](site-header.md) | 41 |
| footer | [Site Footer](site-footer.md) | 41 |
| a.sr-only | [Skip Link](skip-to-content-link.md) | 41 |
| #Cookiebot | [Cookie Bar](cookie-bar.md) | 41 |
| No class listed | [Page Header Banner](page-header-banner.md) | 4 |
| No class listed | [Image + Text Split Block](image-text-split.md) | 3 |
| No class listed | [Card Grid (3-up)](card-grid-3up.md) | 3 |
| No class listed | [Testimonial Quote](testimonial-quote.md) | 3 |
| No class listed | [CTA Banner](cta-banner.md) | 4 |
| No class listed | [Location Finder Widget](location-finder-widget.md) | 3 |
| No class listed | [Customer Service Panel](customer-service-panel.md) | 3 |
| No class listed | [Accordion / Expandable List](accordion-list.md) | 2 |
| No class listed | [Day-in-the-Life Card Carousel](day-carousel.md) | 1 |
| No class listed | [Blog Listing Grid](blog-listing-grid.md) | 1 |
| No class listed | [Blog Article Body](blog-article-body.md) | 10 |

## Notes

Component reconciliation only looks one level under `<main>` (see the root README's "Known limitations"), so these editorial components weren't auto-detected — they're identified by eye from a sample of pages (home, kinderdagverblijf, contact, privacy-en-cookies, kinderopvang-apeldoorn, actueel, and one blog article), not a full pass over all 41. Each one's "Pages" count and `usedOn` list only cover pages actually inspected during this pass; a component may well appear on more pages than listed. No CMS-field write-ups or per-page "variants observed" documentation yet — that's a further, deeper pass.
