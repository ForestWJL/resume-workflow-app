import { cn } from "@/lib/utils";

export function ScoreMeter({
  value,
  label,
  hint,
  size = "md",
  className,
}: {
  value: number; // 0..100
  label: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    pct >= 75
      ? "bg-emerald-500"
      : pct >= 55
      ? "bg-accent-600"
      : pct >= 35
      ? "bg-amber-500"
      : "bg-rose-500";

  const valueSize =
    size === "lg" ? "text-5xl" : size === "sm" ? "text-2xl" : "text-3xl";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </span>
        {hint ? (
          <span className="text-xs text-ink-400">{hint}</span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("font-semibold tracking-tight text-ink-900", valueSize)}>
          {Math.round(pct)}
        </span>
        <span className="text-sm text-ink-400">/ 100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
