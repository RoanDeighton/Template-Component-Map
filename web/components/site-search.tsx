"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchItem } from "@/lib/content";

export function SiteSearch({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const groups: SearchItem["group"][] = ["Home", "Components", "Pages"];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-56 items-center gap-2 rounded-md border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search this inventory..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groups.map((group) => {
              const groupItems = items.filter((i) => i.group === group);
              if (groupItems.length === 0) return null;
              return (
                <CommandGroup key={group} heading={group}>
                  {groupItems.map((item) => (
                    <CommandItem key={item.href} value={item.title} onSelect={() => go(item.href)}>
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
