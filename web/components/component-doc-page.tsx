import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { TableOfContents } from "@/components/table-of-contents";
import { DocNavArrows, type AdjacentDoc } from "@/components/doc-nav-arrows";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ComponentDetailDoc } from "@/lib/content";

export function ComponentDocPage({
  doc,
  prev,
  next,
}: {
  doc: ComponentDetailDoc;
  prev?: AdjacentDoc | null;
  next?: AdjacentDoc | null;
}) {
  const showNav = prev !== undefined || next !== undefined;

  // Mirrors render order below: whatever headings live inside the doc's
  // own prose (Measured styles, Variants observed, ...) come first, then
  // the three structural sections that always render in this fixed order.
  const headings = [
    ...doc.headings,
    ...(doc.exampleImage ? [{ id: "example", text: "Example", level: 2 as const }] : []),
    { id: "cms-data-model", text: "CMS-Data model", level: 2 as const },
    ...(doc.usedOn.length > 0 ? [{ id: "used-on-slugs", text: "Used on slugs", level: 2 as const }] : []),
  ];

  return (
    <div className="flex gap-16">
      <div className="min-w-0 flex-1">
        <article className="mx-auto max-w-3xl space-y-12">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{doc.title}</h1>
              {showNav && <DocNavArrows prev={prev ?? null} next={next ?? null} />}
            </div>
            <p className="text-sm">
              <span className="font-semibold text-foreground">Class: </span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{doc.class}</code>
            </p>
          </div>

          <div
            className="prose prose-sm prose-neutral dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />

          {doc.exampleImage && (
            <section className="space-y-4">
              <h2 id="example" className="text-xl font-semibold tracking-tight text-foreground">
                Example
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={doc.exampleImage} alt={`${doc.title} example`} className="w-full rounded-lg border" />
              {doc.capturedFrom && (
                <p className="text-sm text-muted-foreground">
                  Captured live from{" "}
                  {doc.capturedFrom.liveUrl ? (
                    <a
                      href={doc.capturedFrom.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
                    >
                      {doc.capturedFrom.title}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-foreground">{doc.capturedFrom.title}</span>
                  )}
                  {". See the "}
                  <Link href={doc.capturedFrom.href} className="text-foreground underline underline-offset-4">
                    {doc.capturedFrom.title} page
                  </Link>{" "}
                  in this inventory.
                </p>
              )}
            </section>
          )}

          <section className="space-y-4">
            <h2 id="cms-data-model" className="text-xl font-semibold tracking-tight text-foreground">
              CMS-Data model
            </h2>
            {doc.cmsFields.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border/60 [&_[data-slot=table-container]]:overflow-visible [&_tr]:border-border/60">
                <Table className="table-fixed">
                  <colgroup>
                    <col className="w-[26%]" />
                    <col className="w-[16%]" />
                    <col className="w-[12%]" />
                    <col className="w-[46%]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-12 whitespace-nowrap px-4">Field</TableHead>
                      <TableHead className="h-12 whitespace-nowrap px-4">Type</TableHead>
                      <TableHead className="h-12 whitespace-nowrap px-4">Required</TableHead>
                      <TableHead className="h-12 whitespace-nowrap px-4">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doc.cmsFields.map((field) => (
                      <TableRow key={field.name}>
                        <TableCell className="whitespace-normal px-4 py-3">
                          <code className="break-words rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{field.name}</code>
                        </TableCell>
                        <TableCell className="break-words px-4 py-3 text-muted-foreground">{field.type}</TableCell>
                        <TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {field.required ? "yes" : "no"}
                        </TableCell>
                        <TableCell className="whitespace-normal px-4 py-3 text-muted-foreground">
                          {field.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not yet documented.</p>
            )}
          </section>

          {doc.usedOn.length > 0 && (
            <section className="space-y-4">
              <h2 id="used-on-slugs" className="text-xl font-semibold tracking-tight text-foreground">
                Used on slugs
              </h2>
              <ul className="divide-y rounded-lg border">
                {doc.usedOn.map((page) => (
                  <li key={page.slug}>
                    <Link href={page.href} prefetch={false} className="block px-4 py-3 text-sm hover:bg-muted">
                      {page.title} <span className="text-muted-foreground">({page.slug})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>
      <aside className="hidden w-56 shrink-0 xl:block">
        {headings.length > 0 && <TableOfContents headings={headings} />}
      </aside>
    </div>
  );
}
