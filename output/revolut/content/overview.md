---
title: "Revolut: Site Inventory Overview"
---

<p class="eyebrow">Component inventory</p>

# Revolut

<p class="stats-line">79 captured pages, distilled into 50 unique layout templates and 44 reusable components.</p>

<!-- stat-blocks -->

<p class="callout"><strong>Personal tab test run.</strong> Pages were discovered automatically by following the header/nav and footer links from the homepage, then sampling a handful of pages from each large repeating section found along the way (money transfers by country, currency conversion pairs, exchange-rate comparisons, legal documents). The "Business" and "Company" tabs were excluded, this run covers the "Personal" side of the site only.</p>

## How this was made

<ol class="how-steps">
  <li>
    <div>
      <p class="step-title">Discover the pages</p>
      <p class="step-body">Start from the homepage, follow every link in the header, nav, and footer, and check each of those pages for a large repeating section (a country list, a currency list). Sample a few pages from each one found instead of visiting every single one.</p>
    </div>
  </li>
  <li>
    <div>
      <p class="step-title">Capture and analyze</p>
      <p class="step-body">Screenshot and save the HTML of every discovered page, then break each page down into its underlying structure, cluster pages that share a layout into templates, and spot the components reused across different templates.</p>
    </div>
  </li>
  <li>
    <div>
      <p class="step-title">Document what's there</p>
      <p class="step-body">Turn that structural breakdown into the write-ups you're reading in this inventory: what each template and component actually is, what it holds, and how it varies. Done by hand, working from the captured screenshots and page text.</p>
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
  <li><strong>Base typeface:</strong> <code>Inter, sans-serif</code>, 16px / weight 400</li>
  <li><strong>Body text color:</strong> <code>rgb(31,31,31)</code> on light backgrounds, white on dark hero sections</li>
  <li><strong>Component classes:</strong> mostly auto-generated styled-components hashes (e.g. <code>Box-rui__sc-1475jr3-0</code>), not semantic names</li>
</ul>
