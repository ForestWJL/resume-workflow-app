import type { ScoreBreakdown } from "@/lib/types";
import type { TrackId } from "@/config/tracks";
import { cn } from "@/lib/utils";

const COLOR: Record<TrackId, string> = {
  A_PMC: "bg-sky-500",
  A_REGULATED: "bg-rose-500",
  AB_HYBRID: "bg-teal-500",
  AC_DEMAND: "bg-emerald-500",
  CB_BUYER: "bg-amber-500",
  D_SUPPORT: "bg-violet-500",
  E_TRANSFORMATION: "bg-indigo-500",
};

export function ConfidenceBar({
  breakdown,
}: {
  breakdown: ScoreBreakdown[];
}) {
  const total = breakdown.reduce((s, b) => s + b.rawScore, 0) || 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-ink-100">
        {breakdown.map((b) => {
          const pct = (b.rawScore / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={b.trackId}
              className={cn("h-full", COLOR[b.trackId])}
              style={{ width: `${pct}%` }}
              title={`${b.trackId}: ${pct.toFixed(0)}%`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-3 lg:grid-cols-6">
        {breakdown.map((b) => {
          const pct = Math.round((b.rawScore / total) * 100);
          return (
            <div
              key={b.trackId}
              className="flex items-center gap-2 text-ink-600"
            >
              <span
                className={cn("h-2 w-2 rounded-full", COLOR[b.trackId])}
              />
              <span className="font-medium text-ink-800">{b.trackId}</span>
              <span className="text-ink-400">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
