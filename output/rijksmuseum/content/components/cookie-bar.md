---
title: Cookie Bar
class: cookie-consent-bar
exampleImage: ../../pages/nl-zien-en-doen/cookie-bar.png
capturedFromPage: agenda-listing
usedOn:
  - homepage
  - agenda-listing
  - visitor-info-page
cmsFields:
  - name: heading
    type: string
    required: true
    description: Card heading, "Cookiegebruik" in this capture.
  - name: body
    type: string
    required: true
    description: Short explanation text, including the inline "cookiebeleid" (cookie policy) link.
  - name: policyUrl
    type: link
    required: true
    description: Destination of the cookie policy link embedded in the body text.
  - name: acceptLabel
    type: string
    required: true
    description: Label on the filled accept button, "Accepteren" in this capture.
  - name: rejectLabel
    type: string
    required: true
    description: Label on the plain-text reject link, "Nee, liever niet" in this capture.
---

Bottom-left corner card, appears over the page content rather than a full-width bar. Heading ("Cookiegebruik"), a short explanation with a "cookiebeleid" (cookie policy) link, and two buttons: a filled "Accepteren" (secondary-styled, not the site's orange CTA color) and a plain text "Nee, liever niet" (reject) link beside it.

Shown on every page, on a visitor's first load, then dismissed for the rest of the visit once per session. Captured here from the "Zien & doen" page, since that's whichever page happened to load first in this crawl.
