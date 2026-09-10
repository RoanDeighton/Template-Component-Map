---
title: Category Link Grid
class: link-section
examples:
  - image: ../../pages/nl-zien-en-doen/crop-main-3.png
    capturedFromPage: agenda-listing
usedOn:
  - agenda-listing
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section title shown above the link list (e.g. "Speciaal voor").
  - name: links
    type: array<object>
    required: true
    description: Ordered list of link items (label + URL), 3 to 5 per instance in this sample.
---

A titled list of links that helps visitors jump straight to content grouped by audience or activity, without needing images or long copy.
