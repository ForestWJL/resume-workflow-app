import { cn } from "@/lib/utils";
import type { TrackId } from "@/config/tracks";

const COLORS: Record<TrackId, string> = {
  A: "bg-sky-50 text-sky-700 border-sky-100",
  B: "bg-amber-50 text-amber-700 border-amber-100",
  C: "bg-emerald-50 text-emerald-700 border-emerald-100",
  D: "bg-violet-50 text-violet-700 border-violet-100",
};

export function TrackBadge({
  trackId,
  label,
  size = "md",
  className,
}: {
  trackId: TrackId;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "lg"
      ? "px-3 py-1 text-sm"
      : size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        COLORS[trackId],
        sizeClass,
        className
      )}
    >
      <span className="font-semibold">Track {trackId}</span>
      {label ? <span className="text-ink-500">· {label}</span> : null}
    </span>
  );
}
