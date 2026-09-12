---
title: App Store Rating Panel
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/money-transfer/crop-app-store-rating-panel.png
    capturedFromPage: money-transfer
usedOn:
  - money-transfer
  - money-transfer-send-money-to-nigeria
  - money-transfer-send-money-to-india
  - money-transfer-send-money-to-poland
  - money-transfer-send-money-to-ghana
  - money-transfer-send-money-to-dubai
  - money-transfer-send-money-to-the-uk-from-india
  - money-transfer-send-money-to-saudi-arabia
  - money-transfer-send-money-to-north-macedonia
  - money-transfer-send-money-to-kazakhstan
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
  - currency-converter-convert-gbp-to-cad-exchange-rate
  - compare
  - money-transfer-large-amounts
  - money-transfer-send-money-to-greece
  - money-transfer-send-money-to-peru
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
    description: Heading text, which changes to match the page topic, e.g. "Get your free Revolut app for international money transfers" in this capture.
  - name: body
    type: string
    required: true
    description: Supporting paragraph below the heading, e.g. "Looking for a fast and simple way to send money overseas? Join 80+ million customers who use Revolut for their international transfers..." in this capture.
  - name: ratingDate
    type: string
    required: true
    description: Date the ratings were last refreshed, "Rating as of 11 Sept 2026" in this capture.
  - name: appStoreRating
    type: string
    required: true
    description: App Store score and review count, "4.9 / 5, 1.1M Reviews" in this capture.
  - name: googlePlayRating
    type: string
    required: true
    description: Google Play score and review count, "4.7 / 5, 4.1M Reviews" in this capture.
  - name: ctaLabel
    type: string
    required: true
    description: Button label, "Download Revolut app" in this capture.
  - name: ctaUrl
    type: link
    required: true
    description: Destination of the download button.
---

A panel that shows Revolut's current App Store and Google Play ratings side by side, each with a star rating, review count, and store badge, under a heading and paragraph that change per page topic. A single button below links to download the app.
