---
title: Business Hero Block
---

# Business Hero Block

**Used on:** Business Landing Page (2 occurrences — `business/accept-payments` and `business`)

![Business hero block](../component-crops/business-hero-block.png)

This is the single wrapper `<div>` that contains the *entire* [Business Landing Page](../pages/business-landing.md) body ("Betalingen gebouwd voor groei," "Dit is zakelijk bankieren") — the whole hero, feature sections, and everything else on that page collapses into one outline entry, since `<main>` only has this one direct child. Not a true single "hero" component so much as a structural artifact of how that page is built — see the note on `analyze.ts`'s outline-depth limitation in the [Business Landing Page](../pages/business-landing.md) doc.
