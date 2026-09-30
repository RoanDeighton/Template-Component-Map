import Link from "next/link";
import { notFound } from "next/navigation";
import { DocNavArrows } from "@/components/doc-nav-arrows";
import { TableOfContents } from "@/components/table-of-contents";
import { groupedPages, listSites, orderedPages } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

// Matches the id scheme components/page.tsx uses for its Functional/
// Editorial headings, generalized to an arbitrary section label instead of
// those two fixed names.
function sectionId(label: string): string {
  return `section-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

export default async function PagesOverviewPage(props: PageProps<"/[site]/pages">) {
  const { site } = await props.params;
  const groups = groupedPages(site);
  const pages = orderedPages(site);
  if (!listSites().includes(site)) notFound();

  const first = pages[0];
  // A single unlabeled group is the "no sections set" case — same flat
  // list this page has always rendered, no headings.
  const isFlat = groups.length <= 1 && groups[0]?.label === "";
  const headings = isFlat ? [] : groups.map((g) => ({ id: sectionId(g.label), text: g.label, level: 2 as const }));

  return (
    <div className="flex gap-16">
      <div className="min-w-0 flex-1">
        <article className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">{`Pages (${pages.length})`}</h1>
            {first && (
              <DocNavArrows
                prev={null}
                next={{ slug: first.slug, title: first.title, href: `/${site}/pages/${first.slug}` }}
              />
            )}
          </div>
          {isFlat ? (
            <ul className="divide-y rounded-lg border">
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${site}/pages/${p.slug}`} prefetch={false} className="block px-4 py-3 text-sm hover:bg-muted">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-8">
              {groups.map((g) => (
                <section key={g.label} className="space-y-3">
                  <h2 id={sectionId(g.label)} className="text-lg font-semibold tracking-tight text-foreground">
                    {`${g.label} (${g.pages.length})`}
                  </h2>
                  <ul className="divide-y rounded-lg border">
                    {g.pages.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/${site}/pages/${p.slug}`} prefetch={false} className="block px-4 py-3 text-sm hover:bg-muted">
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </article>
      </div>
      {/* Reserves the column's width even when empty, keeping this page's
          center point consistent with every other route — see
          doc-page.tsx for the fuller explanation. */}
      <aside className="hidden w-56 shrink-0 xl:block">{headings.length > 0 && <TableOfContents headings={headings} />}</aside>
    </div>
  );
}
