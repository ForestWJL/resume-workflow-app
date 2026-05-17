import { cn } from "@/lib/utils";

export function KeywordChips({
  items,
  tone = "default",
  className,
  emptyLabel = "—",
}: {
  items: string[];
  tone?: "default" | "gap" | "match";
  className?: string;
  emptyLabel?: string;
}) {
  if (!items.length) {
    return <span className="text-sm text-ink-400">{emptyLabel}</span>;
  }
  const chipClass =
    tone === "gap"
      ? "border-rose-100 bg-rose-50 text-rose-700"
      : tone === "match"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : "border-ink-100 bg-ink-50 text-ink-700";

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((kw) => (
        <span
          key={kw}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
            chipClass
          )}
        >
          {kw}
        </span>
      ))}
    </div>
  );
}
