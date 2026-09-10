---
title: Two-Up Content Row
class: related-content block-row
exampleImage: ../../pages/nl-bezoek/crop-main-4.png
capturedFromPage: visitor-info-page
usedOn:
  - homepage
  - visitor-info-page
cmsFields:
  - name: items
    type: array<object>
    required: true
    description: Exactly two side-by-side half-width tiles, each image-led with a short title beneath.
  - name: items[].image
    type: image
    required: true
    description: Tile image.
  - name: items[].title
    type: string
    required: true
    description: Tile title/label.
  - name: items[].url
    type: link
    required: true
    description: Tile destination — an exhibition/shop promo on the Homepage, a navigation shortcut on Visitor Info.
---

Two side-by-side half-width tiles, each image-led with a short title beneath. Confirmed as the **same canonical component reused for two different jobs**: on the Homepage it pairs an exhibition promo with its companion shop/book promo (content marketing), while on the Visitor Info page it's repurposed as a simple 2-item navigation shortcut (Agenda, Praktische info). This is exactly the kind of structural match across differently-named contexts that reconciliation is meant to catch — the automated pass missed it (it only compared elements one level deep under `<main>`, and the homepage instance sits nested inside the homepage's single wrapping section), but the markup and class name are identical between the two.

## Variants observed

- Content role varies (promotional vs. navigational) but the visual/structural shape — two equal-width image tiles side by side — is identical.
