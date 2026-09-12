---
title: Plan Comparison Table
class: _1nl0pqg0
examples:
  - image: ../../pages/our-pricing-plans/screenshot.png
    capturedFromPage: our-pricing-plans
usedOn:
  - our-pricing-plans
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section headline, "Get to know our plans" in this capture.
  - name: appDownloadLink
    type: link
    required: false
    description: "\"Download the app\" button placed under the heading."
  - name: planCards
    type: array<object>
    required: true
    description: One card per plan with a card image, plan name, and a one line benefit summary. Four cards in this capture, "Plus", "Premium", "Metal", and "Ultra".
  - name: comparisonTable
    type: array<object>
    required: true
    description: Row by row feature comparison across every plan tier, grouped into sections such as "Everyday benefits", "Travel benefits", "Investments", and "Savings", with a "Get" link under each plan's price.
---

Lets a visitor compare Revolut's paid plans, first as a row of plan summary cards, then as a detailed table listing every benefit and limit side by side across Standard, Plus, Premium, Metal, and Ultra.
