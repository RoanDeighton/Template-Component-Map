# Task: write component documentation pages for a site inventory tool

You're documenting real UI components found by crawling and analyzing `<SITE_URL>`. This is one batch of a larger job; other agents are handling other components in parallel. Work only on the components listed in your assigned batch JSON file.

## What this project is

A tool that crawls a website and generates a browsable documentation site describing its reusable UI components and page templates, for design/dev teams who need an accurate map of what's actually built (not documentation from memory or guesswork). Every claim in a component doc must be traceable to the actual captured data: the screenshot, or the heading/text snippet/link count/image count recorded for that component's occurrences.

## Content style rules (STRICT — enforced project-wide via CLAUDE.md)

This is client-facing copy, read by real people evaluating the site's components. Write it clean the first time:

- No em dashes or en dashes anywhere in prose.
- No AI-vocabulary clusters: never use words like "vibrant", "seamless", "robust", "leverage", "testament", "underscores", "elevate", "empower", "delve", "showcase", "boasts". No inflated, promotional, or marketing-toned language, even when the site itself is a marketing site.
- No padded inline-header lists ("Key features: **Bold Word**: description. **Bold Word**: description...").
- No hedging ("might", "could potentially", "seems to").
- Short, plain, technical sentences. Prefer specific measurements and quoted real UI copy over vague claims (e.g. say the button reads "Get started", don't say "a call-to-action button").
- `class` field values, CMS field names/types, and URLs are structured data, not prose, write them exactly as given, don't "humanize" them.

## Exact frontmatter + body schema (copy this structure exactly — no deviation, no extra sections, no headers in the body)

```
---
title: <Human-readable UX name you choose, Title Case, e.g. "Category Link Grid">
class: <the literal class string given in your data, or "No class listed" if none was recorded>
examples:
  - image: ../../pages/<pageSlug>/screenshot.png
    capturedFromPage: <pageSlug>
usedOn:
  - <pageSlug>
  - <pageSlug>
cmsFields:
  - name: <camelCase field name>
    type: <string | link | image | array<string> | array<object> | array<image>>
    required: <true | false>
    description: <what this field holds, quoting the REAL value/text seen in this capture where relevant>
---

<ONE plain paragraph. No heading. States what the component does for a visitor/user of the page — its purpose, not a visual description. 1-3 sentences.>
```

Do not add any section beyond this. No "## Notes", no bullet lists in the body, no second paragraph unless genuinely needed for one extra clarifying sentence.

### Two real, approved examples (mirror this exactly — same length, same tone, same level of specificity)

**Example A (a component with mostly-fixed structural content, appears on every page):**

```
---
title: Cookie Bar
class: cookie-consent-bar
examples:
  - image: ../../pages/nl-zien-en-doen/cookie-bar.png
    capturedFromPage: agenda-listing
usedOn:
  - homepage
  - agenda-listing
  - visitor-info-page
cmsFields:
  - name: heading
    type: string
    required: true
    description: Card heading, "Cookiegebruik" in this capture.
  - name: body
    type: string
    required: true
    description: Short explanation text, including the inline "cookiebeleid" (cookie policy) link.
  - name: policyUrl
    type: link
    required: true
    description: Destination of the cookie policy link embedded in the body text.
  - name: acceptLabel
    type: string
    required: true
    description: Label on the filled accept button, "Accepteren" in this capture.
  - name: rejectLabel
    type: string
    required: true
    description: Label on the plain-text reject link, "Nee, liever niet" in this capture.
---

A banner that communicates how cookies are used on the website and allows users to choose their preferred cookie settings.
```

**Example B (an editorial content component, content varies per page):**

```
---
title: Category Link Grid
class: link-section
examples:
  - image: ../../pages/nl-zien-en-doen/crop-main-3.png
    capturedFromPage: agenda-listing
usedOn:
  - agenda-listing
cmsFields:
  - name: heading
    type: string
    required: true
    description: Section title shown above the link list (e.g. "Speciaal voor").
  - name: links
    type: array<object>
    required: true
    description: Ordered list of link items (label + URL), 3 to 5 per instance in this sample.
---

A titled list of links that helps visitors jump straight to content grouped by audience or activity, without needing images or long copy.
```

## How to determine the title

Class names may be meaningless auto-generated hashes on CSS-in-JS sites (styled-components, Emotion, CSS Modules) — if so, ignore the class for naming purposes and use it only in the `class:` frontmatter field, verbatim, for technical accuracy. If the site uses semantic class names instead, they're a legitimate naming hint but the screenshot and occurrence data still take priority.

To name a component, look at:
1. The `tag` (header, footer, section, etc.)
2. The `heading` and `textSnippet` recorded on each occurrence
3. `linkCount` / `imageCount` (a 0-link 1-image block is probably an image/media feature; a many-link 0-image block is probably a link list or nav)
4. **The actual screenshot** — read the representative screenshot image (path given in your batch data) before finalizing the title and description. Text snippets alone won't tell you if something is a carousel, a card grid, a stat row, or a table, look at the image.

### Special naming rule for structural/chrome components

If a component is clearly the site's persistent header, footer, or nav (tag is `header` or `footer`, or the occurrence data shows the same site-wide nav/footer links on every page), you MUST title it using one of these patterns so it's correctly categorized elsewhere in the tool as "functional" rather than "editorial":

- Header/nav → title containing "Site Header" or "Navigation" (e.g. "Site Header / Navigation")
- Footer → title containing "Footer" (e.g. "Site Footer")
- A cookie consent banner → title containing "Cookie Bar", "Cookie Banner", or "Cookie Notice"

Everything else (promotional blocks, content sections, card grids, pricing tables, etc.) is an editorial component, name it descriptively based on what it visually is.

### A note on generic/frequently-repeated structural patterns

Some components are a generic "heading + short paragraph" content block (or similarly generic shape) that repeats across many pages with completely different subject matter each time. That's fine and expected, real components carry different content per instance. Describe the STRUCTURAL PATTERN and its purpose, not the specific subject matter of any one instance. Don't invent false specificity, and don't pretend all instances share a topic. Pick ONE representative occurrence's real text to quote in a `cmsFields` description as a concrete example, exactly like the Cookie Bar example quotes "Cookiegebruik" as one real example value, not as if that's the only possible value.

## Cropping the example image (do this for every component, before writing the file)

Each occurrence in your batch data includes a `style` object with `top`, `height`, and `width` (the block's real position on its captured page), when available. Use it to crop a tight image of just this component, not the full page screenshot:

```bash
python3 -c "
from PIL import Image
img = Image.open('<REPO_ROOT>/output/<SITE>/pages/<pageSlug>/screenshot.png')
top = max(0, <style.top> - 12)
bottom = min(img.height, <style.top> + <style.height> + 12)
img.crop((0, top, img.width, bottom)).save('<REPO_ROOT>/output/<SITE>/pages/<pageSlug>/crop-<slug>.png')
"
```

If `style` is missing or `height`/`width` is 0 for every occurrence you're using, fall back to the full `screenshot.png` for that one component rather than skipping the example entirely.

## Output

For each component in your batch, determine a URL-safe slug from the title (lowercase, spaces to hyphens, e.g. "Category Link Grid" → `category-link-grid`). Pick a specific, descriptive title, not a generic one likely to collide with another agent's batch (e.g. prefer "Currency Pair Converter Widget" over "Feature Block"), some overlap is fine and gets fixed automatically afterward, but specificity reduces it. Write the file to:

`<REPO_ROOT>/output/<SITE>/content/components/<slug>.md`

`usedOn` should list every distinct pageSlug from the component's occurrences (deduplicated). `examples[0].image` should be the crop you generated (or the full screenshot per the fallback above); `examples[0].capturedFromPage` is whichever page you used.

After writing all files in your batch, report back a short JSON-ish list mapping each component `key` (from your batch data) to the `title`, `slug`, and `class` you chose, so the page/template docs (written afterward) can link to your components correctly. This mapping is the most important part of your report, without it, cross-linking breaks.

## Batch dispatch notes (for whoever is orchestrating this, not the writing agent)

- Split components into batches of roughly 10-15. Fewer, larger batches reduce both the fixed per-agent overhead (each agent re-reads this whole guide) and slug-collision risk (fewer independent naming decisions happening concurrently).
- After all batches finish, run `scripts/content-authoring/validate-content.ts` before considering the pass done, don't discover collisions and broken links one at a time by browsing.
