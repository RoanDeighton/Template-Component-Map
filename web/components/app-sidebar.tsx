"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export interface SidebarLink {
  slug: string;
  title: string;
  href: string;
  functional?: boolean;
}

function NavGroup({ label, links, pathname }: { label?: string; links: SidebarLink[]; pathname: string }) {
  return (
    <SidebarGroup className="px-4 py-3">
      {label && <SidebarGroupLabel className="mb-1 text-xs font-normal">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              {/* prefetch={false}: this is a fully static export, so there's
                  no server-render latency for prefetch to hide — but with
                  every link in a 10+ item sidebar visible at once, Next's
                  default prefetch-on-viewport fires a burst of RSC-payload
                  requests for every one of them on every page load. */}
              <SidebarMenuButton
                render={<Link href={link.href} prefetch={false} />}
                isActive={pathname.endsWith(link.href)}
                className="w-full min-w-0 text-xs font-semibold data-active:font-semibold"
              >
                {/* The shadcn sidebar primitive's truncate rule only targets a
                    `<span>` last child — a bare text child (as this was)
                    never truncates, so a title long enough to wrap (common
                    on a real site's page/component names, unlike this
                    project's short original test titles) overflows the
                    button's fixed row height into the next item. */}
                <span className="truncate" title={link.title}>
                  {link.title}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({
  site,
  componentLinks,
  pageLinks,
}: {
  site: string;
  componentLinks: SidebarLink[];
  pageLinks: SidebarLink[];
}) {
  // In this statically-exported, basePath-prefixed deploy, usePathname()
  // returns the raw window.location.pathname verbatim — basePath and all
  // (e.g. "/repo-name/site/components/slug/"), not stripped down to the
  // logical route the way a real Next.js server would. Match against it
  // with endsWith/includes rather than exact equality so this still works
  // both there and in plain local dev (no basePath, no trailing slash).
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const section = pathname.includes(`/${site}/pages`) ? "pages" : "components";

  const overview: SidebarLink[] =
    section === "pages"
      ? [{ slug: "overview", title: "Overview", href: `/${site}/pages` }]
      : [{ slug: "overview", title: "Overview", href: `/${site}/components` }];

  const functionalLinks = componentLinks.filter((c) => c.functional);
  const editorialLinks = componentLinks.filter((c) => !c.functional);

  return (
    <Sidebar collapsible="none" className="border-r-0 bg-transparent">
      <SidebarContent className="relative pt-10 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-border after:to-transparent">
        <NavGroup links={overview} pathname={pathname} />
        {section === "components" ? (
          <>
            {functionalLinks.length > 0 && (
              <NavGroup label={`Functional (${functionalLinks.length})`} links={functionalLinks} pathname={pathname} />
            )}
            {editorialLinks.length > 0 && (
              <NavGroup label={`Editorial (${editorialLinks.length})`} links={editorialLinks} pathname={pathname} />
            )}
          </>
        ) : (
          <NavGroup label={`Pages (${pageLinks.length})`} links={pageLinks} pathname={pathname} />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
