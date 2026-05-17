import { cn } from "@/lib/utils";

export function StatChip({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "default" | "accent" | "muted";
  className?: string;
}) {
  const variant =
    accent === "accent"
      ? "bg-accent-50 border-accent-100 text-accent-700"
      : accent === "muted"
      ? "bg-ink-50 border-ink-100 text-ink-700"
      : "bg-white border-ink-100 text-ink-800";

  return (
    <div
      className={cn(
        "flex min-w-[112px] flex-col gap-1 rounded-xl border px-4 py-3",
        variant,
        className
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </span>
      <span className="text-base font-semibold tracking-tight">{value}</span>
    </div>
  );
}
