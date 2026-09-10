---
title: Page Header Banner
class: page-header block-full-width-overflow
examples:
  - image: ../../pages/nl-zien-en-doen/crop-main-0.png
    label: Agenda variant
    capturedFromPage: agenda-listing
  - image: ../../pages/nl-bezoek/crop-main-0.png
    label: Visitor Info variant, with pricing box and secondary link
    capturedFromPage: visitor-info-page
usedOn:
  - agenda-listing
  - visitor-info-page
cmsFields:
  - name: backgroundImage
    type: image
    required: true
    description: Full-bleed photo behind the banner.
  - name: heading
    type: string
    required: true
    description: Page H1, overlaid in large white type.
  - name: subheading
    type: string
    required: true
    description: Short one-line subtitle/description beneath the heading.
  - name: pricing
    type: object
    required: false
    description: "Compact pricing summary (e.g. \"Volwassenen €25 / t/m 18 jaar Gratis\"), only seen on the Visitor Info variant."
  - name: secondaryLinkLabel
    type: string
    required: false
    description: "Secondary link docked beside the intro text on the Visitor Info variant, e.g. \"Praktische informatie\"."
---

Introduces an interior page with its title and a short description, and can surface pricing or a practical next step alongside it.
