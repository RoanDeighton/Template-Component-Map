import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/table-of-contents";
import { ComponentsTable } from "@/components/components-table";
import { DocNavArrows } from "@/components/doc-nav-arrows";
import { getComponentsTable, listSites, orderedComponents } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

export default async function ComponentsOverviewPage(props: PageProps<"/[site]/components">) {
  const { site } = await props.params;
  const doc = getComponentsTable(site);
  if (!doc) notFound();

  // The same list (and order) getAdjacentDocs() uses for every component
  // doc's own prev/next, so Overview → first → ... → last → (disabled)
  // forms one consistent chain rather than two independently-ordered ones
  // — functional group first, then editorial, matching the sidebar.
  const first = orderedComponents(site)[0];

  const functionalRows = doc.rows.filter((r) => r.functional);
  const editorialRows = doc.rows.filter((r) => !r.functional);
  const headings = [
    ...(functionalRows.length > 0 ? [{ id: "functional-components", text: "Functional", level: 2 as const }] : []),
    ...(editorialRows.length > 0 ? [{ id: "editorial-components", text: "Editorial", level: 2 as const }] : []),
    ...doc.headings,
  ];

  return (
    <div className="flex gap-16">
      <div className="min-w-0 flex-1">
        {/* Each direct child of this article is one logical group (title +
            intro copy, Functional, Editorial, Notes) — the larger space-y-12
            between them reads as a section break; each group's own tighter
            internal spacing (space-y-4/6) keeps its own heading/body/list
            read as one unit. */}
        <article className="mx-auto max-w-3xl space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{doc.title}</h1>
              {first && (
                <DocNavArrows
                  prev={null}
                  next={{ slug: first.slug, title: first.title, href: `/${site}/components/${first.slug}` }}
                />
              )}
            </div>
            <div className="prose prose-sm prose-neutral dark:prose-invert" dangerouslySetInnerHTML={{ __html: doc.beforeHtml }} />
          </div>
          {/* Functional: the site's structural chrome (header, footer, nav,
              cookie bar, search, ...) — the same handful of things reused
              around every page. Editorial: everything else, the blocks
              used to actually build a page's content. Only shown when at
              least one component matches — see isFunctionalComponent() in
              lib/content.ts for the (hardcoded) category patterns. */}
          {functionalRows.length > 0 && (
            <section className="space-y-4">
              <h2 id="functional-components" className="text-xl font-semibold tracking-tight text-foreground">
                Functional
              </h2>
              <p className="text-sm text-muted-foreground">
                Structural chrome reused around every page: header, footer, navigation, and the like.
              </p>
              <ComponentsTable rows={functionalRows} />
            </section>
          )}
          {editorialRows.length > 0 && (
            <section className="space-y-4">
              <h2 id="editorial-components" className="text-xl font-semibold tracking-tight text-foreground">
                Editorial
              </h2>
              <p className="text-sm text-muted-foreground">The building blocks used to compose a page&apos;s own content.</p>
              <ComponentsTable rows={editorialRows} />
            </section>
          )}
          <div className="prose prose-sm prose-neutral dark:prose-invert" dangerouslySetInnerHTML={{ __html: doc.afterHtml }} />
        </article>
      </div>
      {/* Always reserve this column's width — see doc-page.tsx for why. */}
      <aside className="hidden w-56 shrink-0 xl:block">
        {headings.length > 0 && <TableOfContents headings={headings} />}
      </aside>
    </div>
  );
}
