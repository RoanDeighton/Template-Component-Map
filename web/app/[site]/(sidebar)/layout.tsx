import { notFound } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { listComponents, listPages, listSites } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

export default async function SidebarLayout(props: LayoutProps<"/[site]">) {
  const { site } = await props.params;
  if (!listSites().includes(site)) notFound();

  const componentLinks = listComponents(site).map((c) => ({
    slug: c.slug,
    title: c.title,
    href: `/${site}/components/${c.slug}`,
  }));
  const pageLinks = listPages(site).map((p) => ({
    slug: p.slug,
    title: p.title,
    href: `/${site}/pages/${p.slug}`,
  }));

  return (
    <SidebarProvider className="min-h-0 flex-1">
      <AppSidebar site={site} componentLinks={componentLinks} pageLinks={pageLinks} />
      <SidebarInset>
        <div className="w-full px-12 py-12">{props.children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
