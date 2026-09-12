---
title: Legal Page Footer
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/legal-rtl-risk-disclosure/crop-legal-page-footer.png
    capturedFromPage: legal-rtl-risk-disclosure
usedOn:
  - legal-rtl-risk-disclosure
  - legal-clearbank-fscs-information-sheet
  - legal-collinson-lounges
cmsFields:
  - name: copyrightLine
    type: string
    required: true
    description: "\"© Revolut Bank UK Ltd 2026\" plus a short entity-disclosure paragraph in this capture."
  - name: legalLinks
    type: array<object>
    required: true
    description: "Flat list of legal/entity links: Website Terms, Legal Agreements, Complaints, Privacy, UK Modern Slavery Policy, Customer Vulnerability, Data Privacy Statement for Candidates in this capture."
  - name: logo
    type: image
    required: true
    description: Revolut logo shown above the copyright line.
  - name: socialLinks
    type: array<object>
    required: true
    description: Row of social media icon links, 5 in this capture.
---

A stripped-down footer used on legal document pages: just the copyright line and a flat list of entity/legal links, without the account-plan cards and grouped link columns the main site footer carries elsewhere.
