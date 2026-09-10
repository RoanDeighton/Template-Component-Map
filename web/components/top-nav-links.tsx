"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TopNavLinks({ site }: { site: string }) {
  // In this statically-exported, basePath-prefixed deploy, usePathname()
  // returns the raw window.location.pathname verbatim — basePath and all —
  // not stripped down to the logical route the way a real Next.js server
  // would. Match with endsWith/includes rather than exact equality so this
  // still works both there and in plain local dev.
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const links = [
    { href: `/${site}`, label: "Home" },
    { href: `/${site}/components`, label: "Components" },
    { href: `/${site}/pages`, label: "Pages" },
  ];

  return (
    <nav className="flex items-center gap-5">
      {links.map((l) => {
        // Home only matches the exact site root; the other two also
        // match their own sub-routes (e.g. /components/[slug]).
        const isActive = l.label === "Home" ? pathname.endsWith(l.href) : pathname.includes(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "text-sm font-semibold no-underline transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
