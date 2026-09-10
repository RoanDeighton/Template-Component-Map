import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/table-of-contents";
import { HomeStats } from "@/components/home-stats";
import { getOverviewSplit, listComponents, listPages, listSites } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

export default async function OverviewPage(props: PageProps<"/[site]">) {
  const { site } = await props.params;
  if (!listSites().includes(site)) notFound();

  const { beforeHtml, afterHtml, headings } = getOverviewSplit(site);
  const stats = [
    { label: "Components", count: listComponents(site).length, href: `/${site}/components` },
    { label: "Pages", count: listPages(site).length, href: `/${site}/pages` },
  ];

  return (
    <div className="flex flex-1">
      {/* Invisible spacer matching the sidebar's own width (see
          components/ui/sidebar.tsx's SIDEBAR_WIDTH) — the sidebar doesn't
          render on this route, but the content below still needs to line
          up horizontally with pages that do have one. */}
      <div className="hidden w-64 shrink-0 md:block" aria-hidden="true" />
      <main className="relative flex w-full flex-1 flex-col bg-background">
        <div className="w-full px-12 py-12">
          <div className="flex gap-16">
            <div className="min-w-0 flex-1">
              <article className="mx-auto max-w-3xl">
                <div className="prose prose-neutral dark:prose-invert" dangerouslySetInnerHTML={{ __html: beforeHtml }} />
                <HomeStats stats={stats} />
                <div className="prose prose-neutral dark:prose-invert" dangerouslySetInnerHTML={{ __html: afterHtml }} />
              </article>
            </div>
            {/* Always reserve this column's width — see doc-page.tsx for why. */}
            <aside className="hidden w-56 shrink-0 xl:block">
              {headings.length > 0 && <TableOfContents headings={headings} />}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
