import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdjacentDoc {
  slug: string;
  title: string;
  href: string;
}

function ArrowButton({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  const className = cn(
    "flex size-8 items-center justify-center rounded-lg bg-accent text-foreground transition-colors",
    href ? "hover:bg-[var(--border)]" : "pointer-events-none opacity-40",
  );
  if (!href) {
    return (
      <span className={className} aria-label={label} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

export function DocNavArrows({ prev, next }: { prev: AdjacentDoc | null; next: AdjacentDoc | null }) {
  if (!prev && !next) return null;

  return (
    <div className="inline-flex gap-2">
      <ArrowButton href={prev?.href} label={prev ? `Previous: ${prev.title}` : "No previous page"}>
        <ArrowLeft className="size-4" />
      </ArrowButton>
      <ArrowButton href={next?.href} label={next ? `Next: ${next.title}` : "No next page"}>
        <ArrowRight className="size-4" />
      </ArrowButton>
    </div>
  );
}
