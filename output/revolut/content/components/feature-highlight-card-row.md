---
title: Feature Highlight Card Row
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/savings/crop-feature-highlight-panel.png
    capturedFromPage: savings
usedOn:
  - savings
  - ultra-plan
  - revolut-pay
  - shops
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section heading, "For when money matters most" in this capture.
  - name: body
    type: string
    required: true
    description: Supporting paragraph under the heading with more detail on the benefit.
  - name: cards
    type: array<image>
    required: true
    description: Row of 3 photo cards, each with a short label overlaid on the image, "Moving", "Adventure", and "Wedding" in this capture.
---

A section that introduces a benefit with a heading and short paragraph, then shows a row of labelled photo cards illustrating specific situations the feature applies to.
