import { notFound } from "next/navigation";
import { DocPage } from "@/components/doc-page";
import { getAdjacentDocs, getComponentDoc, listComponents, listSites } from "@/lib/content";

export function generateStaticParams() {
  return listSites().flatMap((site) => listComponents(site).map((c) => ({ site, slug: c.slug })));
}

export default async function ComponentDocPage(props: PageProps<"/[site]/components/[slug]">) {
  const { site, slug } = await props.params;
  const doc = getComponentDoc(site, slug);
  if (!doc) notFound();

  const { prev, next } = getAdjacentDocs(site, "components", slug);

  return <DocPage doc={doc} prev={prev} next={next} />;
}
