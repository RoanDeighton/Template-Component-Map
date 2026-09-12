---
title: Image & Caption Block
class: Box-rui__sc-1475jr3-0 _1nl0pqg0
examples:
  - image: ../../pages/home/crop-image-caption-block.png
    capturedFromPage: home
usedOn:
  - about-fraud-and-scam
  - code-of-conduct
  - commodities-trading
  - compare
  - compare-best-chf-exchange-rates
  - compare-best-pln-exchange-rates
  - compare-moneygram-gbp-to-usd
  - contact-us
  - customer-vulnerability
  - discover-our-company
  - home
  - how-we-keep-your-money-safe
  - money-transfer
  - money-transfer-large-amounts
  - money-transfer-send-money-to-dubai
  - money-transfer-send-money-to-ghana
  - money-transfer-send-money-to-greece
  - money-transfer-send-money-to-india
  - money-transfer-send-money-to-kazakhstan
  - money-transfer-send-money-to-nigeria
  - money-transfer-send-money-to-north-macedonia
  - money-transfer-send-money-to-peru
  - money-transfer-send-money-to-poland
  - money-transfer-send-money-to-saudi-arabia
  - money-transfer-send-money-to-the-uk-from-india
  - revolut-premium
  - savings
  - shops
  - sustainability
  - travel
cmsFields:
  - name: caption
    type: string
    required: false
    description: Optional line of text alongside the image, "Join 80+ million customers worldwide and 13 million in the UK" in this capture.
  - name: images
    type: array<image>
    required: true
    description: One or more supporting images, a row of four trust badges (app store icon, Trustpilot, a Euromoney award, a Forbes and Revolut badge) in this capture, a single portrait photo in others, such as board member bios on the company page.
  - name: subCaptions
    type: array<string>
    required: false
    description: Short line under each image, "4.7 out of 5 on Trustpilot" and "World's Best Digital Bank" in this capture.
---

Pairs one or more images with a short caption, with no call to action link. The same structure serves different purposes depending on the page, a row of trust badges and review scores on the homepage, or individual photo and bio cards for board members on the company page.
