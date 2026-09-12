---
title: App Preview Feature Panel
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/linked-accounts/crop-feature-media-split.png
    capturedFromPage: linked-accounts
usedOn:
  - linked-accounts
  - ultra-plan
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section heading, "A 360° view of your money" in this capture.
  - name: body
    type: string
    required: true
    description: Supporting paragraph under the heading.
  - name: ctaLabel
    type: string
    required: false
    description: Label on the call-to-action button, "Get started" in this capture.
  - name: ctaUrl
    type: link
    required: false
    description: Destination of the call-to-action button.
  - name: previewImage
    type: image
    required: true
    description: App screen mockup shown below the copy, here showing a linked Barclays account balance of "£5,542.75".
  - name: tags
    type: array<string>
    required: false
    description: Pill labels shown under the app mockup, "Balance overview" and "Manage payments" in this capture.
---

A feature section that pairs a heading, short paragraph, and call-to-action button with a mockup of the relevant app screen, giving visitors a preview of what the feature looks like in use.
