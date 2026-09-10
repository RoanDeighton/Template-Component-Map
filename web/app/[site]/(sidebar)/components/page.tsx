import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/table-of-contents";
import { ComponentsTable } from "@/components/components-table";
import { DocNavArrows } from "@/components/doc-nav-arrows";
import { getComponentsTable, listComponents, listSites } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

export default async function ComponentsOverviewPage(props: PageProps<"/[site]/components">) {
  const { site } = await props.params;
  const doc = getComponentsTable(site);
  if (!doc) notFound();

  // The same list (and order) getAdjacentDocs() uses for every component
  // doc's own prev/next, so Overview → first → ... → last → (disabled)
  // forms one consistent chain rather than two independently-ordered ones.
  const first = listComponents(site)[0];

  return (
    <div className="flex gap-16">
      <div className="min-w-0 flex-1">
        <article className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{doc.title}</h1>
            {first && (
              <DocNavArrows
                prev={null}
                next={{ slug: first.slug, title: first.title, href: `/${site}/components/${first.slug}` }}
              />
            )}
          </div>
          <div className="prose prose-neutral dark:prose-invert" dangerouslySetInnerHTML={{ __html: doc.beforeHtml }} />
          <ComponentsTable rows={doc.rows} />
          <div className="prose prose-neutral dark:prose-invert" dangerouslySetInnerHTML={{ __html: doc.afterHtml }} />
        </article>
      </div>
      {doc.headings.length > 0 && (
        <aside className="hidden w-56 shrink-0 xl:block">
          <TableOfContents headings={doc.headings} />
        </aside>
      )}
    </div>
  );
}
