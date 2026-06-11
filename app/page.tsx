// app/page.tsx
// Portfolio Case Study — refinement pass.
//
// Section order (locked):
//   1. Hero
//   2. Executive Summary (Problem · Solution · Outcome · Technology Stack)
//   3. Workflow Architecture (7-stage diagram + 4 operational pillars folded in)
//   4. Why I Built This
//   5. Representative Week
//   6. Business Impact
//   7. Built By (with "Why this project matters" intro)
//   8. CTA
//
// Visual rules: ~10–15% tighter spacing vs the previous redesign, executive
// case-study density, palette stays ink-* + accent-700 only.

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArchitectureDiagram } from "@/components/case-study/ArchitectureDiagram";
import { CASE_STUDY } from "@/config/caseStudy";

export default function CaseStudyHome() {
  const w = CASE_STUDY.weeklyRun;
  const strongApply =
    w.recommendationSplit.find((r) => r.label === "Strong Apply")?.count ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* ───── 1 · Hero (compact, two columns) ───── */}
      <section
        id="hero"
        className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]"
      >
        <div className="flex flex-col gap-2.5">
          <Badge variant="muted" className="self-start">
            Case Study · Operations Workflow
          </Badge>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink-900 sm:text-[30px]">
            {CASE_STUDY.brand}
          </h1>
          <p className="max-w-2xl text-[14px] text-ink-600">
            {CASE_STUDY.subtitle}
          </p>
          <blockquote className="mt-1 max-w-2xl border-l-2 border-accent-700 bg-ink-50/70 px-3 py-1.5 text-[13px] italic leading-relaxed text-ink-700">
            &ldquo;{CASE_STUDY.spine}&rdquo;
          </blockquote>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Link href="/router">
              <Button variant="primary" size="sm">
                See the workflow live →
              </Button>
            </Link>
            <Link href="#workflow">
              <Button variant="ghost" size="sm">
                Read the workflow
              </Button>
            </Link>
          </div>
        </div>

        <Card className="self-start">
          <CardHeader className="pb-1.5 pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                This week · snapshot
              </span>
              <span className="rounded-full border border-ink-100 bg-ink-50 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                Live
              </span>
            </div>
            <CardTitle className="text-[14px]">Operational snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pb-4">
            <KpiCell label="Raw alerts" value={w.rawAlerts} />
            <KpiCell label="Unique opportunities" value={w.uniqueOpportunities} />
            <KpiCell label="Prioritised" value={w.prioritisedThisWeek} />
            <KpiCell label="Strong Apply" value={strongApply} />
          </CardContent>
        </Card>
      </section>

      {/* ───── 2 · Executive Summary (above-the-fold TL;DR) ───── */}
      <section id="summary" className="flex flex-col gap-2.5">
        <SectionEyebrow>Executive Summary</SectionEyebrow>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CASE_STUDY.executiveSummary.map((s, i) => (
            <Card key={s.label}>
              <CardContent className="flex flex-col gap-1.5 pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] font-semibold text-accent-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-500">
                    {s.label}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-700">
                  {s.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ───── 3 · Production Run Example (timeline of a real morning) ───── */}
      <section id="production" className="flex flex-col gap-2.5">
        <SectionEyebrow>
          Production Run Example · {CASE_STUDY.productionRun.date}
        </SectionEyebrow>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink-900">
          One morning, end-to-end.
        </h2>
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-600">
          A real run of the pipeline this morning — six minutes from inbound
          alerts to a refreshed audit trail. Proof the system runs in
          production, not just in the demo.
        </p>

        <ol className="relative flex flex-col gap-2.5">
          {/* Vertical connector behind the time column */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[34px] top-3 hidden h-[calc(100%-1.5rem)] w-px bg-ink-100 sm:block"
          />
          {CASE_STUDY.productionRun.entries.map((e, i) => (
            <li key={e.time} className="grid grid-cols-[68px_1fr] gap-3">
              <div className="flex flex-col items-start gap-1">
                <span className="font-mono text-[13px] font-semibold text-ink-900">
                  {e.time}
                </span>
                <span
                  className="relative z-10 inline-block h-2 w-2 rounded-full border-2 border-accent-700 bg-white"
                  aria-hidden
                />
              </div>
              <Card>
                <CardContent className="flex flex-col gap-0.5 pt-3 pb-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[13.5px] font-semibold text-ink-900">
                      {e.title}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                      {e.stage}
                    </span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-ink-600">
                    {e.detail}
                  </p>
                </CardContent>
              </Card>
              {/* Hide the bullet's vertical-line tail on the final row */}
              {i === CASE_STUDY.productionRun.entries.length - 1 ? null : null}
            </li>
          ))}
        </ol>
      </section>

      {/* ───── 4 · Workflow Architecture (with the 4 operational pillars folded in) ───── */}
      <section id="workflow" className="flex flex-col gap-2.5">
        <SectionEyebrow>Workflow Architecture · Seven Stages</SectionEyebrow>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink-900">
          End-to-end pipeline, AI-assisted, human-in-the-loop.
        </h2>
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-600">
          Stages 1–2 capture and clean the inbound queue. Stages 3–5 are the
          AI-assisted decision engine (classification · scoring · recommendation),
          live in this UI. Stage 6 routes the response playbook. Stage 7 keeps
          the audit trail in Excel.
        </p>

        <ArchitectureDiagram />

        {/* Four operational pillars — same four every operator runs */}
        <div className="mt-1 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", title: "Screen", body: "Five-second check. Real or noise? In or out of queue?" },
            { n: "02", title: "Sort", body: "Route to one of six operational categories — same idea as routing exceptions to the right desk." },
            { n: "03", title: "Prioritise", body: "Strong Apply · Apply · Stretch · Skip — with the reason shown." },
            { n: "04", title: "Route & Track", body: "Right response materials + 4-step playbook + Excel audit trail." },
          ].map((p) => (
            <Card key={p.n}>
              <CardContent className="flex flex-col gap-1 pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] font-semibold text-accent-700">
                    {p.n}
                  </span>
                  <span className="text-[13.5px] font-semibold text-ink-900">
                    {p.title}
                  </span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-600">
                  {p.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ───── 4 · Why I Built This ───── */}
      <section id="why" className="flex flex-col gap-2.5">
        <SectionEyebrow>Why I Built This · Problem</SectionEyebrow>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink-900">
          A familiar operational problem.
        </h2>
        <Card>
          <CardContent className="space-y-2.5 pt-4 text-[13.5px] leading-relaxed text-ink-700">
            <p>
              Every operations role I&apos;ve held — Sanofi, YCH, Cainiao,
              Ryder, CWT — has the same daily shape. A high volume of items
              arrives from many channels: shipment alerts, exception notices,
              supplier replies, replenishment triggers, customer escalations.
              They all need the same handling — screen, sort, prioritise, route
              to the right next step, and log what was done. That is exception
              management. It is the daily reality of supply chain operations.
            </p>
            <p>
              When I looked at my own opportunity pipeline — hundreds of
              incoming items every week across six channels — I recognised the
              pattern. Not a new problem. The same one I had solved many times
              in distribution, replenishment, and demand planning, just with a
              different kind of input on the other end.
            </p>
            <p>
              So I built a workflow that runs the same way. It screens each
              item, sorts it into the right category, gives it a priority,
              points at the right response, and writes every decision into a
              tracker. AI handles the structured language work. The operator
              keeps the judgement calls.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ───── 5 · Representative Week ───── */}
      <section id="week" className="flex flex-col gap-2.5">
        <SectionEyebrow>A Representative Week · Evidence</SectionEyebrow>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink-900">
          From {w.rawAlerts} raw alerts to {w.prioritisedThisWeek} prioritised
          decisions.
        </h2>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <NumberCard
            label="Raw alerts captured"
            value={w.rawAlerts}
            note="Across six channels this week."
          />
          <NumberCard
            label="Unique opportunities"
            value={w.uniqueOpportunities}
            note="After cross-channel deduplication."
          />
          <NumberCard
            label="Prioritised entries"
            value={w.prioritisedThisWeek}
            note="Logged in the Excel audit trail."
          />
        </div>

        <div className="mt-1 grid gap-2.5 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-1.5 pt-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-[13.5px]">Category split</CardTitle>
                <span className="text-[11px] font-mono text-ink-500">
                  n = {w.prioritisedThisWeek}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-4 pt-1">
              <SplitBars rows={w.categorySplit} total={w.prioritisedThisWeek} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1.5 pt-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-[13.5px]">Priority split</CardTitle>
                <span className="text-[11px] font-mono text-ink-500">
                  n = {w.prioritisedThisWeek}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-4 pt-1">
              <SplitBars
                rows={w.recommendationSplit}
                total={w.prioritisedThisWeek}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-1">
          <CardHeader className="pb-1.5 pt-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-[13.5px]">
                Stage 7 · Audit trail
              </CardTitle>
              <span className="font-mono text-[11px] text-ink-500">
                job_triage_log_LIVE.xlsx
              </span>
            </div>
            <p className="text-[12px] text-ink-500">
              Every decision logged with reference, status, reason and outcome.
            </p>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="overflow-hidden rounded-xl border border-ink-100">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[12px]">
                  <thead className="border-b border-ink-100 bg-ink-50/60 text-[10.5px] uppercase tracking-wide text-ink-500">
                    <tr>
                      <th className="px-3 py-1.5">id</th>
                      <th className="px-3 py-1.5">source</th>
                      <th className="px-3 py-1.5">company</th>
                      <th className="px-3 py-1.5">title</th>
                      <th className="px-3 py-1.5">category</th>
                      <th className="px-3 py-1.5">priority</th>
                      <th className="px-3 py-1.5">status</th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-700">
                    {TRACKER_PREVIEW.map((r) => (
                      <tr key={r.id} className="border-t border-ink-100">
                        <td className="px-3 py-1 font-mono text-[11px]">
                          {r.id}
                        </td>
                        <td className="px-3 py-1">{r.source}</td>
                        <td className="px-3 py-1">{r.company}</td>
                        <td className="px-3 py-1">{r.title}</td>
                        <td className="px-3 py-1">{r.category}</td>
                        <td className="px-3 py-1">{r.priority}</td>
                        <td className="px-3 py-1 text-ink-500">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-ink-500">
              Preview shows 5 of {w.prioritisedThisWeek} rows logged this
              week. The full tracker is the system of record for every
              decision.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ───── 6 · Business Impact ───── */}
      <section id="impact" className="flex flex-col gap-2.5">
        <SectionEyebrow>Business Impact · Outcomes</SectionEyebrow>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink-900">
          Operational outcomes from a representative week.
        </h2>

        <div className="grid gap-2.5 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-1.5 pt-4">
              <CardTitle className="text-[13.5px]">
                This week, in operational terms
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-1">
              <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-ink-700">
                {CASE_STUDY.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-accent-700" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1.5 pt-4">
              <CardTitle className="text-[13.5px]">
                What this case study demonstrates
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-1">
              <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-ink-700">
                {CASE_STUDY.demonstrates.map((d) => (
                  <li key={d.title}>
                    <span className="font-semibold text-ink-900">
                      {d.title}.
                    </span>{" "}
                    <span>{d.body}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ───── 7 · Built By (with "Why this project matters" intro) ───── */}
      <section id="built-by" className="flex flex-col gap-2.5">
        <SectionEyebrow>Built By</SectionEyebrow>
        <h2 className="text-[20px] font-semibold tracking-tight text-ink-900">
          Why this project matters.
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-4 pb-4">
            <p className="max-w-3xl text-[13.5px] leading-relaxed text-ink-700">
              {CASE_STUDY.whyItMatters}
            </p>
            <div className="my-1 h-px w-full bg-ink-100" />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-500">
                  Built by
                </span>
                <h3 className="text-[17px] font-semibold tracking-tight text-ink-900">
                  {CASE_STUDY.builtBy.name}
                </h3>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-ink-500">
                Operations thinking · AI tooling
              </span>
            </div>
            <p className="max-w-3xl text-[13px] leading-relaxed text-ink-700">
              {CASE_STUDY.builtBy.line}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {CASE_STUDY.builtBy.brands.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-ink-200 bg-ink-50/60 px-2.5 py-0.5 text-[11.5px] font-medium text-ink-700"
                >
                  {b}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ───── 8 · Closing CTA ───── */}
      <section id="cta" className="flex flex-col items-start gap-2 pb-2">
        <Link href="/router">
          <Button variant="primary" size="sm">
            See the workflow live →
          </Button>
        </Link>
        <p className="text-[11.5px] text-ink-500">
          Runs entirely on your device. No external calls.
        </p>
      </section>
    </div>
  );
}

/* ───── helpers ───── */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="muted" className="self-start">
      {children}
    </Badge>
  );
}

function KpiCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-ink-50/70 px-3 py-2">
      <span className="text-[9.5px] font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </span>
      <span className="text-[20px] font-semibold leading-none text-ink-900">
        {value}
      </span>
    </div>
  );
}

function NumberCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number | string;
  note: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-0.5 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
          {label}
        </span>
        <span className="text-[22px] font-semibold leading-none text-ink-900">
          {value}
        </span>
        <span className="text-[11.5px] text-ink-500">{note}</span>
      </CardContent>
    </Card>
  );
}

function SplitBars({
  rows,
  total,
}: {
  rows: ReadonlyArray<{ label: string; count: number }>;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => {
        const pct = Math.round((r.count / total) * 100);
        return (
          <div key={r.label} className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-ink-700">{r.label}</span>
              <span className="font-mono text-ink-500">
                {r.count} · {pct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-accent-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TRACKER_PREVIEW = [
  {
    id: "001",
    source: "LinkedIn",
    company: "Bio-Rad Laboratories",
    title: "Supply Planner III",
    category: "Pharma / Medtech Supply Planning",
    priority: "Strong Apply",
    status: "Inbox",
  },
  {
    id: "002",
    source: "LinkedIn",
    company: "Abbott",
    title: "Senior Supply Chain Specialist",
    category: "Pharma / Medtech Supply Planning",
    priority: "Strong Apply",
    status: "Inbox",
  },
  {
    id: "003",
    source: "LinkedIn",
    company: "Vantive",
    title: "Demand & Supply Planner",
    category: "Pharma / Medtech Supply Planning",
    priority: "Strong Apply",
    status: "Inbox",
  },
  {
    id: "004",
    source: "SEEK",
    company: "(see tracker)",
    title: "Procurement / Buyer role",
    category: "Procurement / Buyer",
    priority: "Apply",
    status: "Inbox",
  },
  {
    id: "005",
    source: "SEEK",
    company: "(see tracker)",
    title: "Demand Planner",
    category: "FMCG / Retail / Demand",
    priority: "Apply",
    status: "Inbox",
  },
];
