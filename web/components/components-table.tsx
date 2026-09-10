"use client";

import { useMemo, useRef, useState } from "react";
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
  // Only one row can be hovered at a time, so one shared bit of state is
  // enough. The preview opens after a short dwell (HOVER_DELAY) once the
  // cursor stops moving, closes immediately on any further movement, and
  // (re)anchors to wherever the cursor was when it settled — driven
  // entirely by hand rather than the HoverCard's own built-in hover-intent,
  // which only knows "opened" vs "closed", not "closes again on movement."
  const HOVER_DELAY = 350;
  const [openHref, setOpenHref] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const dwellTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorAnchor = cursor
    ? { getBoundingClientRect: () => new DOMRect(cursor.x, cursor.y, 0, 0) }
    : undefined;

  function handleRowMouseMove(href: string, e: React.MouseEvent) {
    const { clientX: x, clientY: y } = e;
    if (dwellTimeout.current) clearTimeout(dwellTimeout.current);
    setOpenHref((current) => (current === href ? null : current));
    dwellTimeout.current = setTimeout(() => {
      setCursor({ x, y });
      setOpenHref(href);
    }, HOVER_DELAY);
  }

  function handleRowMouseLeave() {
    if (dwellTimeout.current) clearTimeout(dwellTimeout.current);
    setOpenHref(null);
  }

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
      <Table className="table-fixed">
        <colgroup>
          <col className="w-[45%]" />
          <col className="w-[40%]" />
          <col className="w-[15%]" />
        </colgroup>
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
                  <HoverCard
                    open={openHref === row.href}
                    onOpenChange={(next) => {
                      if (!next) setOpenHref((current) => (current === row.href ? null : current));
                    }}
                  >
                    <HoverCardTrigger
                      render={<Link href={row.href} prefetch={false} />}
                      className="absolute inset-0"
                      onMouseMove={(e: React.MouseEvent) => handleRowMouseMove(row.href, e)}
                      onMouseLeave={handleRowMouseLeave}
                    />
                    <HoverCardContent
                      className="w-72 overflow-hidden bg-[#f1f1f1] p-0 shadow-none ring-0"
                      side="right"
                      align="start"
                      sideOffset={8}
                      anchor={cursorAnchor}
                    >
                      <div className="flex aspect-video items-center justify-center p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={row.previewImage} alt={row.title} className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="bg-[#e7e7e7] p-2.5 text-sm font-medium text-foreground">{row.title}</p>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <Link href={row.href} prefetch={false} className="absolute inset-0" />
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
