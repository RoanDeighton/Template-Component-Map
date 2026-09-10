---
title: Highlights Carousel
class: whatson-highlights
examples:
  - image: ../../pages/nl-zien-en-doen/crop-main-2.png
    capturedFromPage: agenda-listing
usedOn:
  - agenda-listing
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section heading, "Uitgelicht" in this capture.
  - name: viewAllUrl
    type: link
    required: false
    description: "\"Zie alle\" (See all) link shown above the grid, alongside sub-links to Tentoonstellingen and Rondleidingen."
  - name: items
    type: array<object>
    required: true
    description: Cards in the grid, each with an image, status tag, title, and secondary line.
  - name: items[].statusTag
    type: string
    required: true
    description: "Short status label per card, e.g. \"LAATSTE KANS\" (last chance) or \"NU TE ZIEN\" (on view now)."
  - name: items[].secondaryLine
    type: string
    required: true
    description: "Either a date range (\"t/m 13 september\") or a price (\"Al vanaf €7,50 pp\"), depending on the card type."
---

A scannable grid of current exhibitions and activities, so visitors can see what's on and how urgent or available each one is at a glance.
