---
title: Product Signup Hero
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/revolut-pro/crop-product-signup-hero.png
    capturedFromPage: revolut-pro
usedOn:
  - revolut-pro
cmsFields:
  - name: eyebrow
    type: string
    required: false
    description: Small label above the headline, "Revolut Pro" in this capture.
  - name: heading
    type: string
    required: true
    description: Main headline, "This is freelance freedom" in this capture.
  - name: body
    type: string
    required: true
    description: Supporting paragraph under the headline, mentioning cashback and setting up the product in three steps.
  - name: legalLinks
    type: array<link>
    required: false
    description: Inline legal links in the disclaimer line below the body copy, "T&Cs", "Payment Processing Terms", and "fees" in this capture.
  - name: phoneInput
    type: object
    required: true
    description: Country code selector and mobile number field used to start signup.
  - name: ctaLabel
    type: string
    required: true
    description: Label on the submit button, "Get started" in this capture.
  - name: productImage
    type: image
    required: true
    description: Product render shown beside the copy, a payment card and card terminal in this capture.
---

Introduces a business product with a headline and short pitch, then collects a visitor's mobile number to start signup, all above the fold on the page.
