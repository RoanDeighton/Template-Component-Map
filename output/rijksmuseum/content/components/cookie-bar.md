---
title: Cookie Bar
class: cookie-consent-bar
examples:
  - image: ../../pages/nl-zien-en-doen/cookie-bar.png
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

A banner that communicates how cookies are used on the website and allows users to choose their preferred cookie settings.
