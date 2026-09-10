---
title: Category Link Grid
class: link-section
exampleImage: ../../pages/nl-zien-en-doen/crop-main-3.png
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

Instances observed:
- **"Speciaal voor"** ("Especially for"): Families en kinderen, Jongvolwassenen, Onderwijs, Toegankelijkheid, Vrienden (5 links)
- **"Cursussen, workshops en lezingen"** ("Courses, workshops and lectures"): Cursussen, Workshops, Lezingen/symposia/filmvertoningen (3 links)

## Content pattern

Functions as a category/audience router at the bottom of the listing page, grouping links by who they're for (first instance) vs. what type of activity they are (second instance).
