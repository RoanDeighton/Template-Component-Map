---
title: Site Footer
class: No class listed
exampleImage: ../../pages/nl/crop-footer.png
capturedFromPage: homepage
usedOn:
  - homepage
  - agenda-listing
  - visitor-info-page
cmsFields:
  - name: visitingHours
    type: string
    required: true
    description: "\"Bezoekersinformatie\" line: hours and address (e.g. \"Elke dag van 9-17 uur, Museumstraat 1, Amsterdam\")."
  - name: primaryLinks
    type: array<object>
    required: true
    description: "Primary link list: Over ons, Pers, Werken bij, Contact in this capture."
  - name: ctaButtons
    type: array<object>
    required: true
    description: "Buttons: \"Doneer ook\" and \"Nieuwsbrief\" in this capture."
  - name: anbiBadge
    type: image
    required: false
    description: ANBI charity registration badge image.
  - name: socialLinks
    type: array<object>
    required: true
    description: Social media icon links, 5 in this capture.
  - name: sponsorLogos
    type: array<image>
    required: true
    description: Row of sponsor/partner logo images.
  - name: legalLinks
    type: array<object>
    required: true
    description: Final row of secondary/legal links.
---

Solid black footer, the only section on any of these pages with a fully opaque non-transparent background. Contains, top to bottom: visiting hours and address ("Bezoekersinformatie": Elke dag van 9-17 uur, Museumstraat 1, Amsterdam), a set of primary links (Over ons, Pers, Werken bij, Contact), two buttons ("Doneer ook" / "Nieuwsbrief"), an ANBI charity registration badge, social media icons (5), a row of sponsor/partner logos, and a final row of secondary/legal links.

Identical on all 3 captured pages: 21 links, 10 images, 447px tall in every case, confirming this is a single shared, non-page-specific component.
