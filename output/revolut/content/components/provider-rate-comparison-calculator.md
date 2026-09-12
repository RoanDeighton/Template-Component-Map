---
title: Provider Rate Comparison Calculator
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/international-transfers/crop-provider-rate-comparison-calculator.png
    capturedFromPage: international-transfers
usedOn:
  - international-transfers
  - money-transfer
  - money-transfer-send-money-to-india
  - money-transfer-send-money-to-poland
  - money-transfer-send-money-to-dubai
  - money-transfer-send-money-to-saudi-arabia
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
    description: Widget heading, "Clear fees and competitive rates." in this capture.
  - name: subheading
    type: string
    required: false
    description: Short line under the heading encouraging visitors to compare rates.
  - name: sendCurrency
    type: string
    required: true
    description: Default currency to send from, "GBP" in this capture.
  - name: receiveCurrency
    type: string
    required: true
    description: Default currency the recipient gets, "PLN" in this capture.
  - name: providers
    type: array<object>
    required: true
    description: Ranked list of providers with logo, plan name, total cost, and difference from the top result; 10 rows in this capture (Revolut Ultra, Revolut Standard, Remitly, Wise, MoneyGram, NatWest, Xoom, Lloyds, HSBC, nationwide).
  - name: disclaimer
    type: string
    required: true
    description: Small print below the table explaining how the comparison data is sourced and a link to read more.
---

An interactive widget that lets a visitor enter a send amount and currency pair, then compares Revolut's transfer cost against other providers such as Wise, Remitly, and MoneyGram, ranked from cheapest to most expensive.
