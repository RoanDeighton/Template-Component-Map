import { notFound } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { listSites } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

export default async function SiteLayout(props: LayoutProps<"/[site]">) {
  const { site } = await props.params;
  if (!listSites().includes(site)) notFound();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav site={site} />
      {props.children}
    </div>
  );
}
