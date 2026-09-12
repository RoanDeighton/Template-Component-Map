---
title: Feature Card Row
class: Box-rui__sc-1475jr3-0 _1nl0pqg0
examples:
  - image: ../../pages/joint-accounts/crop-feature-card-row.png
    capturedFromPage: joint-accounts
usedOn:
  - a-radically-better-account
  - bank-account
  - best-budget-planner
  - business
  - commodities-trading
  - currency-converter
  - currency-converter-convert-aed-to-bgn-exchange-rate
  - currency-converter-convert-aed-to-gbp-exchange-rate
  - currency-converter-convert-eur-to-gbp-exchange-rate
  - currency-converter-convert-gbp-to-aed-exchange-rate
  - currency-converter-convert-gbp-to-cad-exchange-rate
  - currency-converter-convert-gbp-to-eur-exchange-rate
  - currency-converter-convert-gbp-to-hkd-exchange-rate
  - currency-converter-convert-gbp-to-inr-exchange-rate
  - currency-converter-convert-gbp-to-pkr-exchange-rate
  - currency-converter-convert-gbp-to-try-exchange-rate
  - currency-converter-convert-gbp-to-usd-exchange-rate
  - currency-converter-convert-inr-to-egp-exchange-rate
  - currency-converter-convert-inr-to-gbp-exchange-rate
  - currency-converter-convert-krw-to-gbp-exchange-rate
  - currency-converter-convert-usd-to-gbp-exchange-rate
  - global-insurance
  - joint-accounts
  - linked-accounts
  - money-transfer-large-amounts
  - rev-points
  - revolut-for-ages-16-17
  - revolut-kids-and-teens-parent-and-guardians
  - revolut-plus
  - stock-trading
  - travel
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section heading, "Your money, protected" in this capture.
  - name: body
    type: string
    required: false
    description: Optional intro sentence under the heading, "Trusted with 67.5 billion USD in customer deposits, we protect you with proactive, purpose-built defences and offer award-winning support." in this capture.
  - name: ctaLabel
    type: string
    required: false
    description: Label on an optional single link above the card row, "Read more" in this capture.
  - name: cards
    type: array<object>
    required: true
    description: Row of feature cards, each with a background image and short heading, 3 in this capture including "Encrypted chats for secure communication" and "Algorithms built to detect suspicious activity".
---

A section heading and intro paragraph followed by a row of feature cards, each pairing a short heading with a background image. It highlights several related benefits at once, such as security features or account perks, with an optional link above the row leading to more detail.
