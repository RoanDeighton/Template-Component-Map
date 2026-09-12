---
title: Heading-Led Content Block
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/system-status/crop-status-page-header.png
    capturedFromPage: system-status
usedOn:
  - system-status
  - about-fraud-and-scam
cmsFields:
  - name: heading
    type: string
    required: true
    description: Main heading for the block, "All systems are operational" in this capture.
  - name: subheading
    type: string
    required: false
    description: Short line under the heading, "United Kingdom · 11 Sept 2026, 11:56 CEST" in this capture.
  - name: body
    type: array<object>
    required: true
    description: The bulk of the block's content below the heading, rendered here as a long list of service status rows (each with an icon, a name such as "Card payments", and a status indicator), and as paragraphs of text elsewhere on the site.
---

A section that leads with a heading and short subheading, then holds a large body of supporting content underneath, a status list on the system status page and article text on other pages.
