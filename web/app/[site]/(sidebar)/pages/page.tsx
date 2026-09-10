import Link from "next/link";
import { notFound } from "next/navigation";
import { DocNavArrows } from "@/components/doc-nav-arrows";
import { listPages, listSites } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

export default async function PagesOverviewPage(props: PageProps<"/[site]/pages">) {
  const { site } = await props.params;
  const pages = listPages(site);
  if (!listSites().includes(site)) notFound();

  const first = pages[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{`Pages (${pages.length})`}</h1>
        {first && (
          <DocNavArrows
            prev={null}
            next={{ slug: first.slug, title: first.title, href: `/${site}/pages/${first.slug}` }}
          />
        )}
      </div>
      <ul className="divide-y rounded-lg border">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link href={`/${site}/pages/${p.slug}`} prefetch={false} className="block px-4 py-3 text-sm hover:bg-muted">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
