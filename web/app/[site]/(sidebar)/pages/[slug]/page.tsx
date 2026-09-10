import { notFound } from "next/navigation";
import { DocPage } from "@/components/doc-page";
import { getAdjacentDocs, getPageDoc, listPages, listSites } from "@/lib/content";

export function generateStaticParams() {
  return listSites().flatMap((site) => listPages(site).map((p) => ({ site, slug: p.slug })));
}

export default async function PageDocPage(props: PageProps<"/[site]/pages/[slug]">) {
  const { site, slug } = await props.params;
  const doc = getPageDoc(site, slug);
  if (!doc) notFound();

  const { prev, next } = getAdjacentDocs(site, "pages", slug);

  return <DocPage doc={doc} prev={prev} next={next} />;
}
