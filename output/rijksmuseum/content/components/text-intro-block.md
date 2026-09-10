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
    description: "Optional \"read more\" style link, present on the Visitor Info instance (\"Kom meer te weten over je bezoek\"), absent on the Agenda instance."
  - name: readMoreUrl
    type: link
    required: false
    description: Destination of the optional read-more link.
---

A short paragraph that orients visitors right under the page banner, sometimes inviting them to read more.

**Visitor Info instance:**

![Text intro block, Visitor Info instance](../../pages/nl-bezoek/crop-main-1.png)

## Variants observed

- **Agenda instance:** plain paragraph, no visible link, no heading.
- **Visitor Info instance:** paragraph plus a "Kom meer te weten over je bezoek" (Learn more about your visit) link, 2 links counted vs. 0 on the Agenda page.
