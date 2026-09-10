# Content style

Any text a site visitor actually reads, hand-authored, client-facing copy, gets run through the `humanizer` skill (or its rules applied by hand) before it's committed. This covers two places:

1. **Site content**: `output/<site>/content/**/*.md`, the component/page descriptions and overview write-ups for every crawled site, current and future.
2. **App UI copy**: hardcoded strings in `web/app/**` and `web/components/**`, headings, captions, empty states, labels, anything that lands as visible text on the page. This does *not* cover code comments, internal dev docs (`AGENTS.md`, this file), or variable/function names.

The rules: no em or en dashes, no AI-vocabulary clusters ("vibrant", "testament", "underscores its significance"), no padded inline-header lists, no hedging. Keep the plain, technical voice already established in this project: specific measurements and quoted UI copy over vague claims, short sentences.

Structured data is exempt even when it's inline with prose: frontmatter values (`class`, `cmsFields` names/types/required flags), component/variable names, and URLs are left as-is. Only the prose around them is in scope, including free-text `description` values since those render as visible table copy.

When writing new UI copy or content from scratch, write it clean the first time rather than authoring it AI-flavored and cleaning up after. Use the humanizer pass to catch what slips through, not as the primary process.
