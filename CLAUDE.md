# Content style

This rule is about copy, never about code. Code (logic, JSX/markup structure, variable and function names, comments, config, this file, `AGENTS.md`) is written normally, however is clearest and most conventional. It is never run through the humanizer.

What's in scope is text a site visitor actually reads, hand-authored client-facing copy, in two places:

1. **Site content**: `output/<site>/content/**/*.md`, the component/page descriptions and overview write-ups for every crawled site, current and future.
2. **App UI copy**: hardcoded strings in `web/app/**` and `web/components/**` that render as visible text, headings, captions, empty states, labels.

Before committing new or edited copy in either place, run it through the `humanizer` skill (or apply its rules by hand): no em or en dashes, no AI-vocabulary clusters ("vibrant", "testament", "underscores its significance"), no padded inline-header lists, no hedging. Keep the plain, technical voice already established in this project: specific measurements and quoted UI copy over vague claims, short sentences.

Structured data inside content stays as-is: frontmatter values (`class`, `cmsFields` names/types/required flags) and URLs are exempt even when they sit inline with prose. Free-text `description` values are in scope since they render as visible table copy.

When writing new UI copy or content from scratch, write it clean the first time rather than authoring it AI-flavored and cleaning up after. Use the humanizer pass to catch what slips through, not as the primary process.
