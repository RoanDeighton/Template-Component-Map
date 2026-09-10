---
title: Scroll-Driven Image Carousel
class: carousel-wrapper
examples:
  - image: ../../pages/nl-bezoek/crop-main-2.png
    capturedFromPage: visitor-info-page
usedOn:
  - visitor-info-page
cmsFields:
  - name: slides
    type: array<object>
    required: true
    description: Ordered sequence of full-height panels revealed as the visitor scrolls.
  - name: slides[].image
    type: image
    required: true
    description: "Panel image (used on the feature-tiles instance: building exterior, gallery views, audio tour, café, shop, gardens)."
  - name: variant
    type: string
    required: true
    description: "\"feature-tiles\" or \"testimonial\", the two instance types observed on this page."
  - name: testimonialQuote
    type: string
    required: false
    description: Quote text and star rating, only present on the testimonial variant.
---

A scroll-triggered sequence of full-height panels that tells a story as the visitor scrolls, used here for feature highlights and visitor testimonials.
