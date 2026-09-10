---
title: Scroll-Driven Image Carousel
class: carousel-wrapper
exampleImage: ../../pages/nl-bezoek/crop-main-2.png
capturedFromPage: visitor-info-page
usedOn:
  - visitor-info-page
cmsFields:
  - name: slides
    type: array<object>
    required: true
    description: Ordered sequence of full-height panels revealed as the visitor scrolls.
  - name: slides[].image
    type: image
    required: true
    description: "Panel image (used on the feature-tiles instance: building exterior, gallery views, audio tour, café, shop, gardens)."
  - name: variant
    type: string
    required: true
    description: "\"feature-tiles\" or \"testimonial\", the two instance types observed on this page."
  - name: testimonialQuote
    type: string
    required: false
    description: Quote text and star rating, only present on the testimonial variant.
---

A scroll-triggered sequence of full-height panels that tells a story as the visitor scrolls, used here for feature highlights and visitor testimonials.

Two instances on this page:
1. **Feature tiles carousel** (4903px tall): building exterior, gallery views, audio tour, café, shop, gardens, "always a free temporary exhibition."
2. **Testimonial carousel** (900px tall): a 5-star Google review quote ("Het museum wat je minimaal een keer gezien moet hebben...") with a play button, suggesting video testimonials, plus pagination ("2 / 2").

Earlier capture attempts of this component rendered as a large blank region. Chromium's full-page screenshot mode renders the whole page at an artificially page-height-tall viewport, which breaks `position: sticky` positioning and scroll-triggered reveals (they resolve against that fake viewport, not a real one). The crawler now captures by scrolling through the page in real, normal-viewport increments and stitching the results together instead, which resolves this correctly. See `src/lib/stitchedScreenshot.ts`.
