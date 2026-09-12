---
title: Investment Risk Disclosure Page
url: /legal/RTL-risk-disclosure
screenshot: ../../pages/legal-rtl-risk-disclosure/screenshot.png
---

# Investment Risk Disclosure Page

**URL:** `/legal/RTL-risk-disclosure` (page title: "Revolut Trading Ltd - Risk Disclosure | Revolut United Kingdom") · **Occurrences:** 1 page in this run

![Investment Risk Disclosure Page screenshot](../../pages/legal-rtl-risk-disclosure/screenshot.png)

A regulatory disclosure document for Revolut's trading and investment services, published under the stripped-down legal page template used across `/legal/*`.

## Section outline (top to bottom)

1. **[Site Header - Legal Pages](../components/site-header-legal-pages.md)**
2. **[Legal Document Viewer](../components/legal-document-viewer.md)**: "MiFID Documents" eyebrow, title "Revolut Trading Ltd - Risk Disclosure", with a "Download PDF" button and version history.
3. **[FAQ Accordion](../components/faq-accordion.md)**: on this page the same structural fingerprint as the FAQ widget is used for the document's own body text, running from "1. Introduction" through general investment risks and instrument-specific risks covering ETFs, crypto ETNs, ETCs, leveraged and inverse ETFs, and bonds, not a real FAQ. Worth a second look upstream, the clustering matched this document body to the FAQ pattern by structural coincidence.
4. **[Legal Page Footer](../components/legal-page-footer.md)**

## Content pattern

A single long regulatory document with no marketing framing. A category label and title sit above download and history controls, then the disclosure text runs the length of the page in numbered sections and subsections. Both header and footer are stripped to bare essentials, leaving the document as the entire page.
