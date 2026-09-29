---
title: "Partou: Components"
---

# Components (4)

This pass covers the site's structural chrome only — header, footer, skip link, and cookie bar. Partou's page content itself (hero sections, service blocks, article bodies) isn't broken down into individual reusable components yet.

- **Class**: the component's CSS class, ID, or HTML element if the markup doesn't give it a class
- **UX Title**: the descriptive name used throughout this inventory

| Class | UX Title | Pages |
|---|---|---|
| header | [Site Header / Navigation](site-header.md) | 41 |
| footer | [Site Footer](site-footer.md) | 41 |
| a.sr-only | [Skip Link](skip-to-content-link.md) | 41 |
| #Cookiebot | [Cookie Bar](cookie-bar.md) | 41 |

## Notes

Component reconciliation only looks one level under `<main>`, so most of a page's own content collapses into one large generic wrapper rather than distinct, comparable blocks — see the root README's "Known limitations". A full content-authoring pass would break that down by hand into real editorial components (hero, service cards, article body, location-finder widget, and so on).
