---
title: Tabbed Feature Grid
class: _1nl0pqg0
examples:
  - image: ../../pages/metal/screenshot.png
    capturedFromPage: metal
usedOn:
  - metal
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section headline, "Metal at a glance" in this capture.
  - name: tabs
    type: array<string>
    required: true
    description: Category tabs above the grid, "For everyday", "For travel", and "For investments" in this capture.
  - name: features
    type: array<object>
    required: true
    description: Grid of feature cards under the selected tab, each with a short title and a one or two sentence description, for example "Fee-free ATM withdrawals" and "RevPoints" in this capture.
---

Introduces a page section with a heading and a set of tabs that switch between benefit categories, then lists the plan's features as a grid of short cards under the selected tab.
