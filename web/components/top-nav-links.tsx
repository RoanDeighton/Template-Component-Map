"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TopNavLinks({ site }: { site: string }) {
  const pathname = usePathname();
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
        const isActive = l.label === "Home" ? pathname === l.href : pathname.startsWith(l.href);
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
