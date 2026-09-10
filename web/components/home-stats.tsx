import Link from "next/link";

export function HomeStats({
  stats,
}: {
  stats: { label: string; count: number; href: string }[];
}) {
  return (
    <div className="my-8 grid grid-cols-2 gap-4 not-prose">
      {stats.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="flex flex-col gap-1 rounded-xl bg-accent p-6 no-underline transition-colors"
        >
          <span className="text-3xl font-semibold tabular-nums text-foreground">{s.count}</span>
          <span className="text-sm text-muted-foreground">{s.label}</span>
        </Link>
      ))}
    </div>
  );
}
