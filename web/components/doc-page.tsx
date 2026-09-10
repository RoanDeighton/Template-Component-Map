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
        {/* space-y-12 (48px) between the title group and the content group,
            matching both the components overview page's group spacing and
            .prose h2's own 48px top margin — one consistent "gap between
            logical groups" value across the app rather than a smaller one
            here that reads as tighter than the sections within the content
            itself. */}
        <article className="mx-auto max-w-3xl space-y-12">
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
      {/* Always reserve this column's width, even with no headings to show
          in it — omitting the element entirely let the middle column's
          flex-1 space (and its mx-auto center point) widen on pages
          without a TOC, so the content visibly jumped sideways navigating
          between pages that have one and pages that don't. */}
      <aside className="hidden w-56 shrink-0 xl:block">
        {doc.headings.length > 0 && <TableOfContents headings={doc.headings} />}
      </aside>
    </div>
  );
}
