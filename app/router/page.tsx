"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrackBadge } from "@/components/TrackBadge";
import { ScoreMeter } from "@/components/ScoreMeter";
import { StatChip } from "@/components/StatChip";
import { ConfidenceBar } from "@/components/ConfidenceBar";
import { KeywordChips } from "@/components/KeywordChips";
import { scoreJD } from "@/lib/score";
import { buildPrompt } from "@/lib/buildPrompt";
import {
  getMemoryBank,
  getRoutingResults,
  saveRoutingResult,
  deleteRoutingResult,
  setLastActiveRoutingId,
} from "@/lib/storage";
import { TRACKS } from "@/config/tracks";
import { FILE_STACKS } from "@/config/fileStacks";
import { PROMPTS } from "@/config/prompts";
import type { RoutingResult } from "@/lib/types";
import { truncate } from "@/lib/utils";

export default function RouterPage() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<RoutingResult | null>(null);
  // Keep initial value identical on server and client to avoid a hydration
  // mismatch. LocalStorage is only readable on the client, so we populate
  // the history after mount via useEffect.
  const [history, setHistory] = useState<RoutingResult[]>([]);
  const [overrideOpen, setOverrideOpen] = useState(false);

  useEffect(() => {
    setHistory(getRoutingResults());
  }, []);

  const canRun = jd.trim().length >= 40;

  const run = () => {
    const mem = getMemoryBank();

    const r = scoreJD({ jdText: jd, memoryBank: mem });
    console.log("PROMPT MODE:", r.promptMode);
    console.log(
      buildPrompt({
        mode: r.promptMode,
        jdText: r.jdText,
      })
    );
    saveRoutingResult(r);
    setLastActiveRoutingId(r.id);
    setResult(r);
    setHistory(getRoutingResults());
  };

  const overrideTo = (trackId: RoutingResult["selectedTrack"]) => {
    if (!result) return;
    // Re-score as if the user picked this track (we keep original breakdown but switch winner).
    const swapped: RoutingResult = {
      ...result,
      selectedTrack: trackId,
      trackerTag: `[Track ${trackId}] ${truncate(
        result.jdTitleGuess,
        60
      )} — ${result.recommendation} (manual)`,
    };
    saveRoutingResult(swapped);
    setResult(swapped);
    setHistory(getRoutingResults());
    setOverrideOpen(false);
  };

  const remove = (id: string) => {
    deleteRoutingResult(id);
    setHistory(getRoutingResults());
    if (result?.id === id) setResult(null);
  };

  const recColor = useMemo(() => {
    if (!result) return "default";
  
    switch (result.recommendation) {
  
      case "Strong Apply":
        return "success";
  
      case "Apply":
        return "accent";
  
      case "Apply (Transferable)":
        return "accent";
  
      case "Stretch":
        return "warn";
  
      case "Skip":
        return "danger";
  
      default:
        return "default";
    }
  }, [result]);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="flex flex-col gap-3">
        <Badge variant="muted" className="self-start">
          Page 1 · JD Router
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          Paste a job description. Get a clean routing plan.
        </h1>
        <p className="max-w-2xl text-sm text-ink-500 sm:text-base">
          The router classifies the role into Track A / B / C / D, scores
          whether it's worth applying to, and tells you exactly which file
          stack and prompt to use next.
        </p>
      </section>

      {/* Input + Run */}
      <Card>
        <CardHeader>
          <CardTitle>Job description</CardTitle>
          <CardDescription>
            Paste the full JD text. The more you include, the sharper the
            routing will be.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here…"
            className="min-h-[220px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-500">
              {jd.trim().length} characters{" "}
              {canRun ? null : <span>· need ~40+ for a useful score</span>}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setJd("")}
                disabled={!jd}
              >
                Clear
              </Button>
              <Button variant="primary" disabled={!canRun} onClick={run}>
                Route this JD →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result ? (
        <section className="flex flex-col gap-8">
          {/* Top-line summary */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <TrackBadge
                  trackId={result.selectedTrack}
                  label={TRACKS[result.selectedTrack].name}
                  size="lg"
                />
                {result.variantName ? (
                  <Badge variant="muted">{result.variantName}</Badge>
                ) : null}
                <Badge variant={recColor as any}>{result.recommendation}</Badge>
                {result.transferable ? (
                  <Badge variant="warn">Transferable</Badge>
                ) : null}
                {result.borderline ? (
                  <Badge variant="muted">Borderline</Badge>
                ) : null}
                {result.supportShape?.active ? (
                  <Badge variant="warn">
                    Support-shape role
                    {result.supportShape.trackAPenaltyApplied
                      ? " (A ×0.7, B ×1.2)"
                      : result.supportShape.suppressedByFullWeightATitle
                        ? " (A penalty blocked by title)"
                        : result.supportShape.suppressedByRegulatedPlanning
                          ? " (A penalty blocked by regulated-planning signals)"
                          : ""}
                  </Badge>
                ) : null}
                <Badge variant="muted">
                  Confidence: {result.confidence}
                </Badge>
                {result.leadType ? (
                  <Badge variant="muted">
                    {result.leadType === "domain-led"
                      ? "Domain-led"
                      : result.leadType === "function-led"
                        ? "Function-led"
                        : "Balanced"}
                  </Badge>
                ) : null}
                {result.seniorityPenaltyApplied ? (
                  <Badge variant="warn">Seniority penalty applied</Badge>
                ) : null}
              </div>
              {result.promotedFrom ? (
                <p className="mt-2 text-xs text-ink-500">
                  Promoted from{" "}
                  <span className="font-medium text-ink-700">
                    {result.promotedFrom}
                  </span>
                  {result.rescueReason ? (
                    <> — {result.rescueReason} rescue</>
                  ) : null}
                  .
                </p>
              ) : null}
              {result.jdCompanyGuess ? (
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  {result.jdCompanyGuess}
                </p>
              ) : null}
              <CardTitle
                className={
                  result.jdCompanyGuess ? "mt-1 text-xl" : "mt-3 text-xl"
                }
              >
                {result.jdTitleGuess}
              </CardTitle>
              <CardDescription>{result.suggestedNextStep}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <ScoreMeter
                  label="Worth applying"
                  value={result.worthApplyingScore}
                  hint={result.recommendation}
                  size="lg"
                />
                <ScoreMeter
                  label="Functional fit"
                  value={result.functionalFit}
                />
                <ScoreMeter label="Domain fit" value={result.domainFit} />
              </div>
              <Separator />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                    Track distribution
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOverrideOpen((v) => !v)}
                  >
                    {overrideOpen ? "Close override" : "Override track"}
                  </Button>
                </div>
                <ConfidenceBar breakdown={result.allTrackScores} />
                {overrideOpen ? (
                  <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-3">
                    {(
                      [
                        "A_PMC",
                        "A_REGULATED",
                        "AB_HYBRID",
                        "AC_DEMAND",
                        "CB_BUYER",
                        "D_SUPPORT",
                      ] as const
                    ).map((t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant={
                          t === result.selectedTrack ? "default" : "outline"
                        }
                        onClick={() => overrideTo(t)}
                      >
                        Track {t} — {TRACKS[t].name}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Why this track won */}
          {result.reasoningSummary || result.runnerUp || result.topMatchedSignals ? (
            <Card>
              <CardHeader>
                <CardTitle>Why this track won</CardTitle>
                <CardDescription>
                  Plain-English breakdown of which signals drove the classifier —
                  so you can sanity-check before committing to this track.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {result.reasoningSummary ? (
                  <p className="text-sm leading-relaxed text-ink-800">
                    {result.reasoningSummary}
                  </p>
                ) : null}

                {result.topMatchedSignals ? (
                  <div
                    className={
                      result.topMatchedSignals.ambiguousTitle &&
                      result.topMatchedSignals.ambiguousTitle.length > 0
                        ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
                        : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    }
                  >
                    <SignalClass
                      label="Title signals"
                      items={result.topMatchedSignals.title}
                    />
                    {result.topMatchedSignals.ambiguousTitle &&
                    result.topMatchedSignals.ambiguousTitle.length > 0 ? (
                      <SignalClass
                        label="Ambiguous title hits"
                        items={result.topMatchedSignals.ambiguousTitle}
                        caption="Scored at functional weight, not title weight"
                      />
                    ) : null}
                    <SignalClass
                      label="Domain signals"
                      items={result.topMatchedSignals.domain}
                    />
                    <SignalClass
                      label="Functional signals"
                      items={result.topMatchedSignals.functional}
                    />
                    <SignalClass
                      label="Tool signals"
                      items={result.topMatchedSignals.tool}
                    />
                  </div>
                ) : null}

                {result.runnerUp ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 text-xs text-ink-700">
                    <span className="font-medium text-ink-500">
                      Runner-up:
                    </span>
                    <TrackBadge
                      trackId={result.runnerUp.trackId}
                      size="sm"
                    />
                    <span>
                      {TRACKS[result.runnerUp.trackId].name} — gap of{" "}
                      <span className="font-semibold text-ink-900">
                        {result.runnerUp.gap}
                      </span>{" "}
                      pts ({result.runnerUp.rawScore} vs winner)
                    </span>
                  </div>
                ) : null}

                {result.allTrackScores.some(
                  (t) => t.thinEvidencePenaltyApplied
                ) ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] text-amber-800">
                    One or more tracks triggered the thin-evidence guard —
                    their raw score was halved because the title matched but
                    no supporting signals did.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {/* Details grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Positioning + ATS keywords */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Positioning & ATS keywords</CardTitle>
                <CardDescription>
                  What to emphasise and what to verify before applying.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                    Best positioning
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-800">
                    {TRACKS[result.selectedTrack].positioning}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                    Top ATS keywords
                  </p>
                  <div className="mt-2">
                    <KeywordChips
                      items={result.topAtsKeywords}
                      tone="match"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                      Positioning gaps
                    </p>
                    <p className="mb-2 text-[11px] text-ink-400">
                      Present in JD — make sure they show on the top third.
                    </p>
                    <KeywordChips items={result.positioningGaps} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                      Real gaps
                    </p>
                    <p className="mb-2 text-[11px] text-ink-400">
                      Not found in memory — verify or label as Transferable.
                    </p>
                    <KeywordChips items={result.realGaps} tone="gap" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File stack */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended file stack</CardTitle>
                <CardDescription>
                  Upload these to the new chat for the selected track.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  FILE_STACKS[result.selectedTrack].formatTemplate,
                  FILE_STACKS[result.selectedTrack].contentMaster,
                  FILE_STACKS[result.selectedTrack].evidenceBank,
                  FILE_STACKS[result.selectedTrack].supportingReference,
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-0.5 border-t border-ink-100 pt-3 first:border-t-0 first:pt-0"
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      {row.label}
                    </span>
                    <span className="font-mono text-[12.5px] text-ink-800">
                      {row.fileName}
                    </span>
                    {row.note ? (
                      <span className="text-xs text-ink-500">{row.note}</span>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Handoff · 1 → 2 → 3 */}
          <Card>
            <CardHeader>
              <CardTitle>Next step</CardTitle>
              <CardDescription>
                Routing is saved. Walk it through the workflow in three moves.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <HandoffStep
                  n={1}
                  title="Review routing"
                  body={`Confirmed as ${TRACKS[result.selectedTrack].name}${
                    result.variantName ? ` · ${result.variantName}` : ""
                  }. ${result.recommendation}.`}
                  done
                />
                <HandoffStep
                  n={2}
                  title="Open Workflow Assistant"
                  body="Grab the confirmed file stack and run Round 1 → Round 2 → QA → Round 3."
                  cta={
                    <Link
                      href={`/workflow?routingId=${result.id}`}
                      onClick={() => setLastActiveRoutingId(result.id)}
                    >
                      <Button variant="primary" size="sm">
                        Open Workflow →
                      </Button>
                    </Link>
                  }
                />
                <HandoffStep
                  n={3}
                  title="Update Memory after"
                  body="Save verified bullets + flag metrics to verify. Keeps your next routing sharper."
                  cta={
                    <Link href="/memory">
                      <Button variant="outline" size="sm">
                        Open Memory Bank
                      </Button>
                    </Link>
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatChip
                  label="Prompt file"
                  value={
                    <span className="font-mono text-xs">
                      {PROMPTS[result.selectedTrack].sourceFile}
                    </span>
                  }
                  accent="muted"
                />
                <StatChip
                  label="Confidence"
                  value={`${result.confidence} (${Math.round(
                    result.confidenceRatio * 100
                  )}%)`}
                />
                <StatChip
                  label="Recommendation"
                  value={result.recommendation}
                />
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                  Tracker tag
                </span>
                <div className="mt-1 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 font-mono text-xs text-ink-800">
                  {result.trackerTag}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {/* (SignalClass defined below) */}
      {/* History */}
      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent routings</CardTitle>
            <CardDescription>
              Last 50 routing results saved locally.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-ink-100">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <TrackBadge trackId={h.selectedTrack} size="sm" />
                    <span className="truncate text-sm font-medium text-ink-800">
                      {h.jdTitleGuess}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {h.jdCompanyGuess ? (
                      <>
                        <span className="text-ink-700">
                          {h.jdCompanyGuess}
                        </span>
                        {" · "}
                      </>
                    ) : null}
                    {h.recommendation} · worth {h.worthApplyingScore} ·{" "}
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setResult(h);
                      setLastActiveRoutingId(h.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(h.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

/* ───── helper components ───── */

function HandoffStep({
  n,
  title,
  body,
  cta,
  done,
}: {
  n: number;
  title: string;
  body: string;
  cta?: ReactNode;
  done?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 ${
        done ? "border-emerald-200 bg-emerald-50/40" : "border-ink-100 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            done
              ? "bg-emerald-500 text-white"
              : "bg-ink-900 text-white"
          }`}
          aria-hidden
        >
          {done ? "✓" : n}
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-ink-900">
          {title}
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-ink-600">{body}</p>
      {cta ? <div className="mt-auto">{cta}</div> : null}
    </div>
  );
}

function SignalClass({
  label,
  items,
  caption,
}: {
  label: string;
  items: string[];
  caption?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </span>
      {items.length === 0 ? (
        <span className="text-xs text-ink-400">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((it) => (
            <span
              key={it}
              className="rounded-full bg-ink-100 px-2 py-0.5 font-mono text-[11px] text-ink-700"
            >
              {it}
            </span>
          ))}
        </div>
      )}
      {caption ? (
        <span className="text-[10px] leading-snug text-ink-400">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
