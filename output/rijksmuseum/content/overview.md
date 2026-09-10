---
title: Rijksmuseum — Site Inventory Overview
---

<script setup>
// The figma-native-v2 design system defines no dark-mode tokens, so this
// page forces the whole site shell (nav included) to light while it's
// open — not just this content card — otherwise you get a white card
// stranded in a dark shell, which reads as broken rather than deliberate.
import { useData } from "vitepress";
import { onMounted, onUnmounted, watch } from "vue";

const { isDark } = useData();
let previous = false;

onMounted(() => {
  previous = isDark.value;
  isDark.value = false;
});

const stopWatch = watch(isDark, (v) => {
  if (v) isDark.value = false;
});

onUnmounted(() => {
  stopWatch();
  isDark.value = previous;
});
</script>

<div class="figma-home">

<p class="eyebrow">Component inventory</p>

# Rijksmuseum

<p class="stats-line">3 captured pages, distilled into 3 unique layout templates and 10 reusable components.</p>

<div class="stat-blocks">
  <a class="stat-block" href="components/category-link-grid.html">
    <span class="stat-block-count">10</span>
    <span class="stat-block-label">Components</span>
  </a>
  <a class="stat-block" href="pages/agenda-listing.html">
    <span class="stat-block-count">3</span>
    <span class="stat-block-label">Pages</span>
  </a>
</div>

<p class="callout"><strong>Test run.</strong> This is a small, hand-picked 3-page run (homepage, "Bezoek & tickets", "Agenda") used to validate the pipeline before running it across the full site — the numbers above reflect only these 3 pages, not the whole site. Since every page in this test happens to be structurally distinct, each one produced its own template; a larger run would show actual template reuse (e.g. individual exhibition pages, collection object pages).</p>

## How this was made

<ol class="how-steps">
  <li>
    <div>
      <p class="step-title">Crawl the site</p>
      <p class="step-body">Discover its pages, group ones that look alike by URL pattern, and sample a few from each group instead of visiting every single one — capturing a screenshot of each page kept.</p>
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
      <p class="step-body">Turn that structural breakdown into the write-ups you're reading in this inventory — what each template and component actually is, what it holds, and how it varies. This part is done by hand, working from the captured screenshots.</p>
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
  <li><strong>Base typeface:</strong> <code>RijksText, Arial, sans-serif</code>, 17.4px / weight 400</li>
  <li><strong>Body text color:</strong> white (<code>rgb(255,255,255)</code>) on dark/image backgrounds throughout the pages sampled</li>
  <li><strong>Footer background:</strong> solid black (<code>rgb(0,0,0)</code>)</li>
</ul>

</div>
