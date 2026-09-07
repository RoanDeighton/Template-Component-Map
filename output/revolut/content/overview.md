---
title: Revolut — Site Inventory Overview
---

# Revolut (revolut.com, nl-NL) — Site Inventory

**Reusability test run.** 20 pages sampled from a real crawl (478 URLs discovered via link-following — revolut.com blocks the sitemap fetch for non-browser requests, so discovery relied entirely on Playwright's real-browser link crawl). Used to validate the crawler/analyzer pipeline against a second, very different site: a React/Next.js app with a CSS-in-JS design system, aggressive bot protection, and heavy scroll-triggered animation — a strong contrast to Rijksmuseum's server-rendered, semantic-class markup.

- **Pages discovered:** 478 (via link-crawl; sitemap fetch blocked for non-browser requests)
- **Pages captured:** 20 (page-cap test run, round-robin sampled across 51 distinct URL patterns)
- **Unique templates found:** 13
- **Canonical components identified:** 48

## Two pipeline bugs found and fixed during this run

1. **Screenshot capture** — `fullPage: true` screenshots broke `position: sticky` and scroll-triggered reveal animations (several sections rendered as large blank gaps). Fixed by scrolling in real viewport-height increments and stitching the results, instead of using Chromium's full-page composite mode. See `src/lib/stitchedScreenshot.ts`.
2. **Component/template identification** — the original approach (first CSS class as identity) silently collapsed all 20 pages into one meaningless template, because Revolut's CSS-in-JS design system gives nearly every layout wrapper the same generic base class. Replaced with a content-shape fingerprint (tag, image/link presence, heading count, element count, form/media presence) that doesn't depend on class names at all. See `contentFingerprint` in `src/analyze.ts`.

Both fixes are general, not Revolut-specific — they're already applied to the Rijksmuseum inventory too.

## Templates

| Template | Pages | Representative URL |
|---|---|---|
| [Currency Converter](pages/currency-converter.md) | 6 | `/currency-converter/convert-aed-to-eur-exchange-rate` |
| [Money Transfer Country Page](pages/money-transfer-country.md) | 1 | `/money-transfer/send-money-to-albania` |
| [Account Landing Page](pages/account-landing.md) | 1 | `/a-radically-better-account` |
| [Business Landing Page](pages/business-landing.md) | 2 | `/business/accept-payments` |
| [Legal Terms Page](pages/legal-terms.md) | 2 | `/legal/airport-fast-track-pass` |
| [App Download (QR)](pages/app-download-qr.md) | 1 | `/get-revolut-under-18` |
| [Homepage (default/international)](pages/homepage-default.md) | 1 | `/` |
| [Homepage (NL)](pages/homepage-nl.md) | 1 | `/nl-NL` |
| [eSIM Plan Page](pages/esim-plan.md) | 1 | `/esim/africa-esim` |
| [Cards Hub](pages/cards-hub.md) | 1 | `/cards` |
| [Card Product: Virtual Card](pages/cards-product-virtual-card.md) | 1 | `/cards/virtual-card` |
| [Card Product: Bank Cards](pages/cards-product-bank-cards.md) | 1 | `/cards/bank-cards` |
| [Card Product: Mastercard Debit Card](pages/cards-product-mastercard-debit-card.md) | 1 | `/cards/mastercard-debit-card` |

The default and NL homepages are near-identical in structure (same section sequence, English vs. Dutch content) but landed as separate templates — a case where the clustering threshold could reasonably merge them; left separate here since each was only captured once and the distinction is informative on its own.

## Components

48 total: 30 reused (appear on 2+ pages) and 18 that only appeared once in this sample. Listed together below since we're documenting all of them, but the occurrence count is worth reading — a component that shows up once in a 20-page sample may well be reused elsewhere on the full site.

### Reused (2+ occurrences)

| Component | Occurrences | Used on |
|---|---|---|
| [Short Text/CTA Block](components/short-text-cta-block.md) | 18 | Currency Converter, Money Transfer Country Page, eSIM Plan Page |
| [Site Header](components/site-header.md) | 17 | Currency Converter, Money Transfer Country Page, Account Landing Page, Business Landing Page, Homepage (default), Homepage (NL), eSIM Plan Page, Cards Hub, Virtual Card, Bank Cards, Mastercard Debit Card |
| [Site Footer](components/site-footer.md) | 17 | Currency Converter, Money Transfer Country Page, Account Landing Page, Business Landing Page, Homepage (default), Homepage (NL), eSIM Plan Page, Cards Hub, Virtual Card, Bank Cards, Mastercard Debit Card |
| [Icon Grid Section](components/icon-grid-intro.md) | 15 | Currency Converter, Money Transfer Country Page, Account Landing Page |
| [Text + Image Detail Block](components/text-image-detail-block.md) | 10 | Currency Converter, Account Landing Page, Virtual Card |
| [Photo + Trust Badge Promo](components/photo-trust-promo-block.md) | 8 | Currency Converter, Money Transfer Country Page, eSIM Plan Page |
| [Converter Widget](components/converter-widget.md) | 7 | Currency Converter, Money Transfer Country Page |
| [Photo + Copy CTA Block](components/photo-copy-cta-block.md) | 7 | Currency Converter, Account Landing Page |
| [Plain Heading Block](components/plain-heading-block.md) | 7 | Money Transfer Country Page, eSIM Plan Page, Virtual Card |
| [Conversion Rate Grid](components/conversion-rate-grid.md) | 6 | Currency Converter |
| [FAQ Accordion](components/faq-accordion.md) | 4 | Money Transfer Country Page, eSIM Plan Page, Virtual Card |
| [Text + Media Intro Block](components/text-media-intro-block.md) | 4 | Homepage (default), Homepage (NL), eSIM Plan Page, Virtual Card |
| [Small Centered CTA](components/small-centered-cta.md) | 3 | Money Transfer Country Page, Homepage (default), Homepage (NL) |
| [Legal Page Header](components/legal-page-header.md) | 3 | Legal Terms Page, App Download (QR) |
| [Image Carousel Promo](components/image-carousel-promo.md) | 3 | Homepage (NL), Cards Hub, Virtual Card |
| [Card Selector Promo](components/card-selector-promo.md) | 3 | Cards Hub, Bank Cards, Mastercard Debit Card |
| [Product Intro Block](components/product-intro-block.md) | 3 | Cards Hub, Bank Cards |
| [App Download Steps List](components/app-download-steps-list.md) | 2 | Money Transfer Country Page, Virtual Card |
| [Inline Text CTA](components/inline-text-cta.md) | 2 | Account Landing Page, Homepage (default) |
| [Plain Section Divider](components/plain-section-divider.md) | 2 | Account Landing Page, Homepage (default) |
| [Business Hero Block](components/business-hero-block.md) | 2 | Business Landing Page |
| [Legal Content Block](components/legal-content-block.md) | 2 | Legal Terms Page |
| [Legal Page Footer](components/legal-page-footer.md) | 2 | Legal Terms Page |
| [Hero Section (image-led)](components/hero-section-image-led.md) | 2 | Homepage (default), Homepage (NL) |
| [Stat/Trust Callout](components/stat-trust-callout.md) | 2 | Homepage (default), Homepage (NL) |
| [Media Feature Callout](components/media-feature-callout.md) | 2 | Homepage (default), eSIM Plan Page |
| [Untitled Link Section](components/untitled-link-section.md) | 2 | Homepage (NL), eSIM Plan Page |
| [Card Grid Promo](components/card-grid-promo.md) | 2 | eSIM Plan Page |
| [Feature Highlight Callout](components/feature-highlight-callout.md) | 2 | eSIM Plan Page |
| [Large Media Feature Block](components/large-media-feature-block.md) | 2 | Bank Cards, Mastercard Debit Card |

### Singleton (1 occurrence in this sample)

| Component | Used on |
|---|---|
| [Send-Home Promo Block](components/send-home-promo-block.md) | Money Transfer Country Page |
| [Empty List Placeholder](components/empty-list-placeholder.md) | Account Landing Page |
| [Savings Rate Callout](components/savings-rate-callout.md) | Account Landing Page |
| [Two-Step Switch CTA](components/two-step-switch-cta.md) | Account Landing Page |
| [Salary Sorting Promo](components/salary-sorting-promo.md) | Account Landing Page |
| [QR Download Block](components/qr-download-block.md) | App Download (QR) |
| [Single Image Banner](components/single-image-banner.md) | Homepage (default) |
| [Spend Feature Callout](components/spend-feature-callout.md) | Homepage (default) |
| [Market Investing Callout](components/market-investing-callout.md) | Homepage (NL) |
| [eSIM How-To Block](components/esim-howto-block.md) | eSIM Plan Page |
| [Region Selector Block](components/region-selector-block.md) | eSIM Plan Page |
| [Decorative Divider](components/decorative-divider.md) | eSIM Plan Page |
| [Cards Hub Intro](components/cards-hub-intro.md) | Cards Hub |
| [Virtual Card Use-Case List](components/virtual-card-use-case-list.md) | Virtual Card |
| [Bank Card Delivery Block](components/bank-card-delivery-block.md) | Bank Cards |
| [Bank Card Definition](components/bank-card-definition.md) | Bank Cards |
| [Mastercard Intro Block](components/mastercard-intro-block.md) | Mastercard Debit Card |
| [Virtual Mastercard Promo](components/virtual-mastercard-promo.md) | Mastercard Debit Card |

## Site identity, at a glance

- Design system: a CSS-in-JS component library internally called "rui" (Revolut UI) — every layout wrapper is a `Box` primitive (`Box-rui__sc-...`), styling applied via auto-generated hash classes.
- Dominant visual language: black/white with a lot of full-bleed product photography, rounded pricing/feature cards, and Trustpilot/App Store rating badges reused across nearly every marketing page.
- Bot protection: plain HTTP requests (including this crawler's own sitemap fetch) are blocked; only real browser navigation succeeds.
