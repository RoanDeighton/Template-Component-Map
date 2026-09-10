---
title: Site Header / Navigation
class: No class listed
examples:
  - image: ../../pages/nl/crop-header.png
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

Persistent navigation that keeps search, language switching, and ticket purchasing within reach from anywhere on the site.
