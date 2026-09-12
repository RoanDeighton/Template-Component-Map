---
title: Two-Column Content Feature Block
class: Box-rui__sc-1475jr3-0 _1nl0pqg0
examples:
  - image: ../../pages/savings/crop-two-column-content-feature-block.png
    capturedFromPage: savings
usedOn:
  - savings
  - bank-account
  - how-we-keep-your-money-safe
  - a-radically-better-account
  - revolut-plus
  - revolut-premium
  - money-transfer
  - currency-converter
  - currency-converter-convert-gbp-to-inr-exchange-rate
  - currency-converter-convert-usd-to-gbp-exchange-rate
  - currency-converter-convert-gbp-to-eur-exchange-rate
  - currency-converter-convert-gbp-to-usd-exchange-rate
  - currency-converter-convert-eur-to-gbp-exchange-rate
  - currency-converter-convert-gbp-to-pkr-exchange-rate
  - currency-converter-convert-gbp-to-try-exchange-rate
  - currency-converter-convert-gbp-to-hkd-exchange-rate
  - currency-converter-convert-krw-to-gbp-exchange-rate
  - currency-converter-convert-aed-to-gbp-exchange-rate
  - currency-converter-convert-inr-to-gbp-exchange-rate
  - travel
  - currency-converter-convert-gbp-to-cad-exchange-rate
  - compare
  - revolut-pay
  - currency-converter-convert-aed-to-bgn-exchange-rate
  - currency-converter-convert-gbp-to-aed-exchange-rate
  - currency-converter-convert-inr-to-egp-exchange-rate
  - compare-best-chf-exchange-rates
  - compare-best-pln-exchange-rates
  - compare-moneygram-gbp-to-usd
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section heading, "Add money your way" in this capture.
  - name: body
    type: string
    required: true
    description: Supporting paragraph, "Whether paying yourself first or saving what's left, add what you like, when you like. With no minimums." in this capture.
  - name: image
    type: image
    required: true
    description: Photo shown beside the copy, a phone-in-hand photo with an app transaction notification overlay in this capture.
  - name: ctaLabel
    type: string
    required: false
    description: Button label when present, "Get started" in this capture.
  - name: ctaUrl
    type: link
    required: false
    description: Destination of the call-to-action button.
  - name: tags
    type: array<string>
    required: false
    description: Optional row of secondary quick-link labels below the image, e.g. "Add money any time", "Recurring transfers" in this capture.
---

A two-column section pairing a heading and short paragraph with a supporting photo, used repeatedly across product pages to walk through individual features one at a time. Some instances add a single call-to-action link or a row of secondary quick-link labels below the image.
