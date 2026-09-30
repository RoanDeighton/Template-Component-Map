---
title: "Partou: Site Inventory Overview"
---

<p class="eyebrow">Component inventory</p>

# Partou

<p class="stats-line">54 captured pages: every page reachable from the header, footer, and main blog listing, plus 5 sample childcare-location pages and 13 more blog articles pulled specifically for format variety.</p>

<!-- stat-blocks -->

<p class="callout"><strong>Light pass.</strong> Every captured page is placed and linked here with its own screenshot, and 25 components are identified and linked with a preview image each: the site's structural chrome (header, footer, skip link, cookie bar) plus every recurring content block found in a full pass over all 54 pages, plus a follow-up sweep of the remaining pages for anything still missed (hero banners, image/text rows, card and icon-tile grids, a benefit checklist, a pull quote, CTA banners, the location finder, directory, and profile card, the cost calculator, a recipe card, two video embeds, an app-store download block, a standalone photo block, and the blog templates). None of it has a full written description yet, and the editorial components were found by eye, not by the automated reconciliation, which only looks one level under a page's main content — see the Notes on the components page. Partou also runs 1,319 separate childcare-location pages (one per city and address) and roughly 400 blog articles under `/actueel/*` and scattered top-level URLs; only 5 and 22 are sampled here respectively, picked for format variety (a recipe post, a video post) rather than a proportional slice.</p>

## How this was made

<ol class="how-steps">
  <li>
    <div>
      <p class="step-title">Crawl the site</p>
      <p class="step-body">Discover its pages, group similar ones by URL pattern, and sample a few from each group instead of visiting every page. Each sampled page gets a screenshot.</p>
    </div>
  </li>
  <li>
    <div>
      <p class="step-title">Analyze the structure</p>
      <p class="step-body">Break each captured page down into its underlying structure, cluster the pages that share a layout into templates, and spot the components that get reused across different templates.</p>
    </div>
  </li>
  <li>
    <div>
      <p class="step-title">Document what's there</p>
      <p class="step-body">Turn that structural breakdown into write-ups of what each component actually is, what it holds, and how it varies. For this pass, every page is placed and linked with its screenshot, and all 25 components found across them (chrome plus every recurring content block) are placed and linked with a preview image and a one-line description — none have the deeper CMS-field or variants write-up yet.</p>
    </div>
  </li>
  <li>
    <div>
      <p class="step-title">Publish it</p>
      <p class="step-body">Assemble everything into this browsable site.</p>
    </div>
  </li>
</ol>

## Site identity, at a glance

Pulled from actual computed styles, not estimated from screenshots:

<ul class="identity-list">
  <li><strong>Base typeface:</strong> <code>"Cera Pro", Arial, sans-serif</code>, 18px / weight 400</li>
  <li><strong>Body text color:</strong> near-black (<code>rgb(29, 29, 29)</code>) on a white background</li>
  <li><strong>Header and footer background:</strong> solid white (<code>rgb(255, 255, 255)</code>)</li>
</ul>
