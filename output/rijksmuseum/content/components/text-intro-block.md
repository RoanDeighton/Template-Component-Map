---
title: Text Intro Block
---

# Text Intro Block

**Used on:** Agenda / What's On Listing (`intro-block`), Visitor Info Page (`minimal-expanding-intro-component`)

**Agenda instance:**

![Text intro block, Agenda instance](../../pages/nl-zien-en-doen/crop-main-1.png)

**Visitor Info instance:**

![Text intro block, Visitor Info instance](../../pages/nl-bezoek/crop-main-1.png)

A short orienting paragraph placed directly under the [Page Header Banner](page-header-banner.md), with an optional "read more" style link. Kept as two separate but related entries rather than force-merged into one: the two instances use different class names (`intro-block` vs `minimal-expanding-intro-component`), and the Visitor Info page's class name explicitly suggests expand/collapse behavior that a static screenshot/HTML capture can't confirm. Worth checking with a larger sample whether these are genuinely the same component with a naming inconsistency, or two different components that happen to serve a similar role.

## Variants observed

- **Agenda instance:** plain paragraph, no visible link, no heading.
- **Visitor Info instance:** paragraph plus a "Kom meer te weten over je bezoek" (Learn more about your visit) link — 2 links counted vs. 0 on the Agenda page.
