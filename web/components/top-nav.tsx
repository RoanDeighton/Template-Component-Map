import { TopNavLinks } from "@/components/top-nav-links";
import { SiteSearch } from "@/components/site-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSearchIndex } from "@/lib/content";

export function TopNav({ site }: { site: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-6 bg-background px-6">
      <TopNavLinks site={site} />
      <div className="ml-auto flex items-center gap-3">
        <SiteSearch items={getSearchIndex(site)} />
        <ThemeToggle />
      </div>
    </header>
  );
}
