import { notFound } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { groupedPages, isFunctionalComponent, listSites, orderedComponents } from "@/lib/content";

export function generateStaticParams() {
  return listSites().map((site) => ({ site }));
}

export default async function SidebarLayout(props: LayoutProps<"/[site]">) {
  const { site } = await props.params;
  if (!listSites().includes(site)) notFound();

  const componentLinks = orderedComponents(site).map((c) => ({
    slug: c.slug,
    title: c.title,
    href: `/${site}/components/${c.slug}`,
    functional: isFunctionalComponent(c.title),
  }));
  const pageGroups = groupedPages(site).map((g) => ({
    label: g.label,
    links: g.pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      href: `/${site}/pages/${p.slug}`,
    })),
  }));

  return (
    <SidebarProvider className="min-h-0 flex-1 overflow-hidden">
      <AppSidebar site={site} componentLinks={componentLinks} pageGroups={pageGroups} />
      <SidebarInset className="min-h-0 overflow-y-auto">
        <div className="w-full px-12 py-12">{props.children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
