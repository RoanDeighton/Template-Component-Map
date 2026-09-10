"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { ComponentTableRow } from "@/lib/content";

type SortKey = "class" | "title" | "pages";
type SortDir = "asc" | "desc";

function SortButton({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  const Icon = dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("-ml-3 h-8 font-semibold data-[active=true]:text-foreground", className)}
      data-active={active}
    >
      {label}
      {active && <Icon className="ml-2 size-3.5" />}
    </Button>
  );
}

export function ComponentsTable({ rows }: { rows: ComponentTableRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      if (sortKey === "pages") return a.pages - b.pages;
      return a[sortKey].localeCompare(b[sortKey]);
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border/60 [&_[data-slot=table-container]]:overflow-visible [&_tr]:border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-12 px-4">
              <SortButton
                label="UX Title"
                active={sortKey === "title"}
                dir={sortDir}
                onClick={() => toggleSort("title")}
              />
            </TableHead>
            <TableHead className="h-12 px-4">
              <SortButton
                label="Class"
                active={sortKey === "class"}
                dir={sortDir}
                onClick={() => toggleSort("class")}
              />
            </TableHead>
            <TableHead className="h-12 px-4 text-right">
              <SortButton
                label="Pages"
                active={sortKey === "pages"}
                dir={sortDir}
                onClick={() => toggleSort("pages")}
                className="-mr-3 ml-0"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow key={row.href} className="relative">
              <TableCell className="whitespace-normal px-4 py-3 text-muted-foreground">
                {row.previewImage ? (
                  <HoverCard>
                    <HoverCardTrigger render={<Link href={row.href} />} className="absolute inset-0" />
                    <HoverCardContent className="w-72 p-0" side="right" align="start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.previewImage}
                        alt={row.title}
                        className="aspect-video w-full rounded-t-lg border-b object-cover"
                      />
                      <p className="p-2.5 text-sm font-medium text-foreground">{row.title}</p>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <Link href={row.href} className="absolute inset-0" />
                )}
                {row.title}
              </TableCell>
              <TableCell className="whitespace-normal px-4 py-3">{row.class}</TableCell>
              <TableCell className="px-4 py-3 text-right tabular-nums">{row.pages}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
