import Link from "next/link";
import { getSiteMeta, listSites } from "@/lib/content";

export default function HomePage() {
  const sites = listSites();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Site Inventories</h1>
      <ul className="divide-y rounded-lg border">
        {sites.map((slug) => {
          const meta = getSiteMeta(slug);
          return (
            <li key={slug}>
              <Link href={`/${slug}`} prefetch={false} className="block px-4 py-3 text-sm hover:bg-muted">
                {meta.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
