---
title: Full-Width Promo Block
class: block-full-width-overflow
exampleImage: ../../pages/nl/crop-main-0.png
capturedFromPage: homepage
usedOn:
  - homepage
cmsFields:
  - name: backgroundImage
    type: image
    required: true
    description: Full-bleed background photo the block is built around.
  - name: eyebrow
    type: string
    required: false
    description: Short label above the headline (absent on the hero variant, which shows the site wordmark instead).
  - name: heading
    type: string
    required: true
    description: Overlaid headline in the bottom-left corner.
  - name: ctaUrl
    type: link
    required: true
    description: Destination the entire block links through to, an exhibition, story, or feature page.
---

A full-bleed background image with a short eyebrow label and headline overlaid in the bottom-left corner, the entire block acting as one link through to an exhibition, story, or feature. No body copy: this component is a visual entry point, not a content container.

Three instances on the homepage, including a hero variant. Examples seen: the homepage hero ("RIJKSMUSEUM" wordmark over *The Night Watch*), a "Families en kinderen" promo, and a "Fiep Westendorp" exhibition promo.

## Variants observed

- **Hero variant** (`page-header-home`): same visual shape, but placed directly under the header/sponsor strip and carries the site wordmark instead of a normal headline. Structurally it's the same block type with a modifier class, not a different component.
