---
title: Text Intro Block
class: intro-block / minimal-expanding-intro-component
examples:
  - image: ../../pages/nl-zien-en-doen/crop-main-1.png
    label: Agenda instance, plain paragraph with no link
    capturedFromPage: agenda-listing
  - image: ../../pages/nl-bezoek/crop-main-1.png
    label: Visitor Info instance, with a "read more" link
    capturedFromPage: visitor-info-page
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
