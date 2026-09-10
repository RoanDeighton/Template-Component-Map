---
title: Site Header / Navigation
class: No class listed
exampleImage: ../../pages/nl/crop-header.png
capturedFromPage: homepage
usedOn:
  - homepage
  - agenda-listing
  - visitor-info-page
cmsFields:
  - name: backLink
    type: link
    required: false
    description: "Breadcrumb-style \"back\" link (e.g. \"‹ Home\"), present on interior pages, absent on the homepage."
  - name: languageOptions
    type: array<string>
    required: true
    description: Language switcher options, NL/EN in this capture.
  - name: ctaLabel
    type: string
    required: true
    description: "Label on the filled orange call-to-action button, \"Rijksmuseum tickets\" in this capture."
  - name: ctaUrl
    type: link
    required: true
    description: Destination of the ticketing call-to-action button.
  - name: navLinks
    type: array<object>
    required: true
    description: Remaining nav links (hamburger menu, search, login, giftshop), count varies 25 to 37 by page.
---

Persistent top navigation, transparent background over the page content (no white bar). Left side: hamburger menu icon, search icon, a "back" breadcrumb-style link on interior pages (e.g. "‹ Home" on the Bezoek and Agenda pages, absent on the homepage itself). Right side: language switcher, login, giftshop link, and a filled orange "Rijksmuseum tickets" call-to-action button that's visually distinct from the rest of the nav (only colored element in the header).

## Variants observed

- Link count varies by page (25 to 37 `<a>` tags counted). The homepage's header has fewer links than interior pages, likely due to an additional in-page breadcrumb/back link present only on non-homepage pages.
