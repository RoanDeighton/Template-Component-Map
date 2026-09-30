"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

export interface PageLinkGroup {
  label: string;
  links: SidebarLink[];
}

export function AppSidebar({
  site,
  componentLinks,
  pageGroups,
}: {
  site: string;
  componentLinks: SidebarLink[];
  pageGroups: PageLinkGroup[];
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBottomFade, setShowBottomFade] = useState(false);

  // Shows a fade at the bottom edge only while there's more list below the
  // fold — recomputed on scroll and on content/section changes, not just
  // once, since switching between Components and Pages changes the list
  // length under the same scroll container.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateFade = () => {
      setShowBottomFade(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
    };

    updateFade();
    el.addEventListener("scroll", updateFade);
    const observer = new ResizeObserver(updateFade);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFade);
      observer.disconnect();
    };
  }, [section]);

  return (
    <Sidebar
      collapsible="none"
      className="relative border-r-0 bg-transparent after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-border after:to-transparent"
    >
      <SidebarContent ref={scrollRef} className="pt-10">
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
        ) : pageGroups.length === 1 && pageGroups[0].label === "" ? (
          <NavGroup label={`Pages (${pageGroups[0].links.length})`} links={pageGroups[0].links} pathname={pathname} />
        ) : (
          pageGroups.map((g) => <NavGroup key={g.label} label={`${g.label} (${g.links.length})`} links={g.links} pathname={pathname} />)
        )}
      </SidebarContent>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-sidebar to-transparent transition-opacity duration-200 ${
          showBottomFade ? "opacity-100" : "opacity-0"
        }`}
      />
    </Sidebar>
  );
}
