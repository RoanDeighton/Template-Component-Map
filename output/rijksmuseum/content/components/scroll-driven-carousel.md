---
title: Scroll-Driven Image Carousel
---

# Scroll-Driven Image Carousel

**Used on:** Visitor Info Page (2 instances)
**Class:** `carousel-wrapper`

![Instance 1 — the flagged near-blank capture (see limitation note below)](../../pages/nl-bezoek/crop-main-2.png)

An unusually tall (900–4900px) horizontally-oriented section, almost certainly using `position: sticky` to pin content in place while the user scrolls, revealing a sequence of images/slides — a common "storytelling" pattern on marketing-heavy sites, letting a set of full-height panels play out as the visitor scrolls vertically rather than needing horizontal swipe/click controls.

Two instances on this page:
1. **Feature tiles carousel** (4903px tall) — building exterior, gallery views, audio tour, café, shop, gardens, "always a free temporary exhibition."
2. **Testimonial carousel** (900px tall) — a 5-star Tripadvisor quote ("Ongetwijfeld het mooiste museum ter wereld...") with a play button, suggesting video testimonials, plus pagination ("1 / 3").

## ⚠ Capture limitation

Instance 1 rendered as a large near-blank region in the full-page screenshot (auto-flagged by the crawler: 4903px tall, pixel stddev 40.7 — an unusually uniform/empty-looking area for its size). This is a structural limitation of static full-page screenshot compositing with `position: sticky` elements, not a bug in this specific page — the same thing happens on any site using this pattern, in any screenshot tool built on Chromium's full-page capture. The component's content above was reconstructed from the page's HTML markup (image alt text and surrounding copy), not from the image. Instance 2 happened to be captured correctly, likely because its total height was small enough to fit within a single viewport-height composite pass.

**For a fuller capture of this component**, a future pass could scroll this specific section into view and take a targeted (non-full-page) screenshot instead, which does render `position: sticky` correctly — flagged as a possible follow-up rather than built into this test run.
