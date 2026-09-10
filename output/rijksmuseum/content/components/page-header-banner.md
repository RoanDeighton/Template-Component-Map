---
title: Page Header Banner
class: page-header block-full-width-overflow
exampleImage: ../../pages/nl-zien-en-doen/crop-main-0.png
capturedFromPage: agenda-listing
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

Full-width banner used at the top of interior (non-homepage) pages: a full-bleed photo with the page's H1 title overlaid in large white type, plus a short one-line subtitle/description. Fixed height (900px in both instances measured).

**Visitor Info variant** (with pricing box and secondary link):

![Page header banner, Visitor Info variant](../../pages/nl-bezoek/crop-main-0.png)

## Variants observed

- On the **Visitor Info** page, this component also carries a compact pricing summary box (e.g. "Volwassenen €25 / t/m 18 jaar Gratis") and a secondary link ("Praktische informatie") docked beside the intro text. The **Agenda** page's instance is plainer: title and subtitle only, no pricing box. Worth confirming with a larger sample whether the pricing box is specific to ticketed/visit-related pages or a general optional slot in this component.
