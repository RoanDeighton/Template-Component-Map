---
title: Legal Document Viewer
class: Box-rui__sc-1475jr3-0
examples:
  - image: ../../pages/legal-rtl-risk-disclosure/crop-legal-document-viewer.png
    capturedFromPage: legal-rtl-risk-disclosure
usedOn:
  - legal-rtl-risk-disclosure
  - legal-clearbank-fscs-information-sheet
  - legal-collinson-lounges
cmsFields:
  - name: title
    type: string
    required: true
    description: Document title, "Revolut Trading Ltd - Risk Disclosure" in this capture.
  - name: downloadUrl
    type: link
    required: true
    description: Destination of the "Download PDF" link next to the title.
  - name: historyUrl
    type: link
    required: false
    description: Destination of the "History" link next to the title.
  - name: body
    type: string
    required: true
    description: The full legal document text rendered below the header, including its numbered sections and subheadings.
---

Displays a single legal or policy document in full, with its title, a PDF download link, and a link to view its revision history above the document text.
