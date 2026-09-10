---
title: Text Intro Block
class: intro-block / minimal-expanding-intro-component
exampleImage: ../../pages/nl-zien-en-doen/crop-main-1.png
capturedFromPage: agenda-listing
usedOn:
  - agenda-listing
  - visitor-info-page
cmsFields:
  - name: body
    type: string
    required: true
    description: Short orienting paragraph placed directly under the Page Header Banner.
  - name: readMoreLabel
    type: string
    required: false
    description: "Optional \"read more\" style link — present on the Visitor Info instance (\"Kom meer te weten over je bezoek\"), absent on the Agenda instance."
  - name: readMoreUrl
    type: link
    required: false
    description: Destination of the optional read-more link.
---

A short orienting paragraph placed directly under the Page Header Banner, with an optional "read more" style link. Kept as two separate but related entries rather than force-merged into one: the two instances use different class names (`intro-block` vs `minimal-expanding-intro-component`), and the Visitor Info page's class name explicitly suggests expand/collapse behavior that a static screenshot/HTML capture can't confirm. Worth checking with a larger sample whether these are genuinely the same component with a naming inconsistency, or two different components that happen to serve a similar role.

**Visitor Info instance:**

![Text intro block, Visitor Info instance](../../pages/nl-bezoek/crop-main-1.png)

## Variants observed

- **Agenda instance:** plain paragraph, no visible link, no heading.
- **Visitor Info instance:** paragraph plus a "Kom meer te weten over je bezoek" (Learn more about your visit) link — 2 links counted vs. 0 on the Agenda page.
