---
title: Exchange Rate History Chart
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/currency-converter/crop-exchange-rate-history-chart.png
    capturedFromPage: currency-converter
usedOn:
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
  - currency-converter-convert-aed-to-bgn-exchange-rate
  - currency-converter-convert-gbp-to-aed-exchange-rate
  - currency-converter-convert-inr-to-egp-exchange-rate
cmsFields:
  - name: rateHeading
    type: string
    required: true
    description: The current exchange rate stated as text, "1 GBP = 1.16520 EUR" in this capture.
  - name: changeValue
    type: string
    required: true
    description: Absolute and percentage change shown next to the rate, "0.00880, 0.76%" in this capture.
  - name: chartData
    type: array<object>
    required: true
    description: Historical rate series plotted on the line chart, spanning the date range shown on the x-axis.
  - name: rangeOptions
    type: array<string>
    required: true
    description: Selectable time range tabs, "1d, 1w, 1m, 3m, 6m, 1y, 5y, All" in this capture.
---

An interactive line chart showing how a currency pair's exchange rate has moved over time, with tabs to switch between time ranges from one day to five years, and the current rate and change shown above the chart.
