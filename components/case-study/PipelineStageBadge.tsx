// Small "Stage X of 7" chrome shown at the top of the live tool pages so a
// visitor lands inside the case study workflow, not in a standalone tool.

import Link from "next/link";

export function PipelineStageBadge({
  stages,
  label,
}: {
  // e.g. "3–5" or "6"
  stages: string;
  // e.g. "Screen → Sort → Prioritise"
  label: string;
}) {
  return (
    <Link
      href="/#workflow"
      className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-[11px] font-medium text-ink-600 transition hover:border-ink-300 hover:text-ink-900"
    >
      <span className="rounded-full bg-emerald-50 px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
        Live
      </span>
      <span>
        Stage {stages} of 7 · {label}
      </span>
      <span aria-hidden className="text-ink-400">
        →
      </span>
    </Link>
  );
}
