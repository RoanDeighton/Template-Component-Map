---
title: Two-Up Content Row
class: related-content block-row
examples:
  - image: ../../pages/nl-bezoek/crop-main-4.png
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
    description: Tile destination, an exhibition/shop promo on the Homepage, a navigation shortcut on Visitor Info.
---

Pairs two related pieces of content or navigation side by side, reused for both promotional pairings and simple navigation shortcuts.
