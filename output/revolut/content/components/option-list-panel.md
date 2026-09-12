---
title: Option List Panel
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/rev-points/crop-tabbed-feature-panel.png
    capturedFromPage: rev-points
usedOn:
  - rev-points
  - stocks-and-shares-isa
cmsFields:
  - name: options
    type: array<object>
    required: true
    description: Ordered list of named options, each with its own heading and short description, "Airline Miles" (with a description of transferring points to partner airlines) in this capture, or a plan tier such as "Plus" at "£3.99 per month" elsewhere on the site.
  - name: image
    type: image
    required: false
    description: Illustrative image for the selected option, shown here for the "Stays" reward category but not present on every instance of this component.
  - name: tabs
    type: array<string>
    required: false
    description: Pill buttons under the image for switching between options, "Airline Miles", "Stays", "Gift Cards", "Experiences", and "Revolut Pay discounts" in this capture.
---

A section that presents several named options, either reward categories or plan tiers, each with its own heading and short description, letting visitors compare or switch between them.
