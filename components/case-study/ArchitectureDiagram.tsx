// Seven-stage architecture diagram for the case study page.
// Visual style follows the rest of the app: Apple-flavoured cards, subtle
// borders, no gradients. Stage chips read "Live" or "Tooling" so a hiring
// manager can see which stages are interactive in this UI and which sit in
// the supporting notebook / Excel tooling.

import { CASE_STUDY } from "@/config/caseStudy";

function TagChip({ tag }: { tag: "Live" | "Tooling" }) {
  const isLive = tag === "Live";
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isLive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-ink-200 bg-ink-50 text-ink-600",
      ].join(" ")}
    >
      {tag}
    </span>
  );
}

function LayerDivider({ label }: { label: string }) {
  return (
    <div className="my-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-ink-200" />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-ink-200" />
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="flex flex-col gap-3">
      {CASE_STUDY.stages.map((s, idx) => {
        // Insert named layer dividers before Stage 3 and before Stage 6.
        const divider =
          s.n === 3
            ? "Screening & Prioritisation · Live"
            : s.n === 6
              ? "Response & Tracking · Live"
              : null;
        return (
          <div key={s.n}>
            {divider ? <LayerDivider label={divider} /> : null}
            <div className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white"
                aria-hidden
              >
                {s.n}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink-900">
                    Stage {s.n} · {s.title}
                  </h3>
                  <TagChip tag={s.tag as "Live" | "Tooling"} />
                </div>
                <p className="text-[13px] leading-relaxed text-ink-600">
                  {s.body}
                </p>
                {"evidence" in s && s.evidence ? (
                  <p className="text-[11.5px] font-medium text-ink-500">
                    {s.evidence}
                  </p>
                ) : null}
              </div>
            </div>
            {idx < CASE_STUDY.stages.length - 1 ? (
              <div className="my-1 flex justify-center">
                <span className="text-ink-300" aria-hidden>
                  ▼
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
