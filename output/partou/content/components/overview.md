---
title: "Partou: Components"
---

# Components (25)

The site's structural chrome (header, footer, skip link, cookie bar) plus every recurring content block found across a full pass over all 54 captured pages, plus a targeted sweep of the remaining pages for anything still missed: hero banners, alternating image/text rows, card and icon-tile grids, testimonials, a pull quote, CTA banners, the location finder and its directory/profile-card pages, the cost calculator, a recipe card, an app-store download block, a standalone photo block, two video embeds, and the blog templates.

- **Class**: the component's CSS class, ID, or HTML element if the markup doesn't give it a class
- **UX Title**: the descriptive name used throughout this inventory

| Class | UX Title | Pages |
|---|---|---|
| header | [Site Header / Navigation](site-header.md) | 41 |
| footer | [Site Footer](site-footer.md) | 41 |
| a.sr-only | [Skip Link](skip-to-content-link.md) | 41 |
| #Cookiebot | [Cookie Bar](cookie-bar.md) | 41 |
| No class listed | [Page Header Banner](page-header-banner.md) | 22 |
| No class listed | [Image + Text Split Block](image-text-split.md) | 22 |
| No class listed | [Card Grid (3-up)](card-grid-3up.md) | 15 |
| No class listed | [CTA Banner](cta-banner.md) | 10 |
| No class listed | [Accordion / Expandable List](accordion-list.md) | 9 |
| No class listed | [Blog Article Body](blog-article-body.md) | 8 |
| No class listed | [Customer Service Panel](customer-service-panel.md) | 7 |
| No class listed | [Day-in-the-Life Card Carousel](day-carousel.md) | 7 |
| No class listed | [Location Finder Widget](location-finder-widget.md) | 7 |
| No class listed | [Blog Listing Grid](blog-listing-grid.md) | 5 |
| No class listed | [Testimonial Quote](testimonial-quote.md) | 5 |
| No class listed | [Icon Tile Row](icon-tile-row.md) | 4 |
| No class listed | [Benefit Checklist](benefit-checklist.md) | 4 |
| No class listed | [Location Profile Card](location-profile-card.md) | 4 |
| No class listed | [Video Embed Block](video-embed-block.md) | 2 |
| No class listed | [App Store Download Block](app-store-download-block.md) | 1 |
| No class listed | [Calculator / Cost Estimator Form](calculator-form.md) | 1 |
| No class listed | [Full-Width Photo](full-width-photo.md) | 1 |
| No class listed | [Location Directory List](location-directory-list.md) | 1 |
| No class listed | [Pull Quote Block](pull-quote-block.md) | 1 |
| No class listed | [Recipe Card](recipe-card.md) | 1 |

## Notes

Component reconciliation only looks one level under `<main>` (see the root README's "Known limitations"), so none of the 21 editorial components above were auto-detected — they're identified by eye, from a full pass over all 54 captured pages (41 from the site's nav/footer graph, plus 13 pulled specifically for blog-article variety — see the site overview), plus a follow-up sweep of the remaining pages using measured DOM section boundaries rather than a visual skim, specifically looking for anything still missed. That sweep flagged 16 unlabeled sections across 6 pages; 15 turned out to be ordinary headingless prose paragraphs already covered by the existing vocabulary, and one was genuinely new (Full-Width Photo). Each `usedOn` list reflects a page actually inspected against that pattern; a handful of pages sharing an obviously identical template (the four `/actueel/leeftijd/*` filtered listings, the four individual location pages, several `/actueel/*` articles) were extended by template match rather than pixel-by-pixel re-verification of every one. Several components — Recipe Card, App Store Download Block, Calculator / Cost Estimator Form, Full-Width Photo, Location Directory List, and Pull Quote Block — surfaced only once each in this sample; the full ~400-article blog archive almost certainly holds more of some of these, and likely other formats not seen yet (interviews, quizzes). No CMS-field write-ups or per-page "variants observed" documentation yet — that's a further, deeper pass.
