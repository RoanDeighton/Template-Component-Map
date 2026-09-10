# Content style

Component and page descriptions under `output/<site>/content/**/*.md` are hand-authored prose, not raw crawler output. Before committing new or edited copy there, run it through the `humanizer` skill (or apply its rules by hand): no em or en dashes, no AI-vocabulary clusters ("vibrant", "testament", "underscores its significance"), no padded inline-header lists. Keep the plain, technical voice already established in this project — specific measurements and quoted UI copy over vague claims, short sentences, no hedging.

Frontmatter values (`class`, `cmsFields` names/types/required flags) are structured data, not prose — leave them as-is during a humanizing pass. Only the markdown body (and free-text `description` values, if asked) is in scope.
