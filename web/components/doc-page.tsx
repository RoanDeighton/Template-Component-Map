import { TableOfContents } from "@/components/table-of-contents";
import { DocNavArrows, type AdjacentDoc } from "@/components/doc-nav-arrows";
import type { ContentDoc } from "@/lib/content";

export function DocPage({
  doc,
  prev,
  next,
}: {
  doc: ContentDoc;
  prev?: AdjacentDoc | null;
  next?: AdjacentDoc | null;
}) {
  const showNav = prev !== undefined || next !== undefined;

  return (
    <div className="flex gap-16">
      <div className="min-w-0 flex-1">
        <article className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{doc.title}</h1>
            {showNav && <DocNavArrows prev={prev ?? null} next={next ?? null} />}
          </div>
          <div
            className="prose prose-neutral dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
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
