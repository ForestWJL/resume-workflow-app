"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrackBadge } from "@/components/TrackBadge";
import { PromptBlock } from "@/components/PromptBlock";
import { StatChip } from "@/components/StatChip";
import { SaveBackPanel } from "@/components/SaveBackPanel";
import {
  getLastActiveRoutingId,
  getLatestRoutingResult,
  getRoutingResult,
  getRoutingResults,
  getWorkflowSessionForRouting,
  saveWorkflowSession,
  setLastActiveRoutingId,
} from "@/lib/storage";
import { PROMPTS, CHATGPT_REFINE_PROMPT } from "@/config/prompts";
import { FILE_STACKS } from "@/config/fileStacks";
import { TRACKS, TRACK_ORDER, type TrackId } from "@/config/tracks";
import type { RoutingResult, WorkflowSession } from "@/lib/types";
import { nowIso, shortId } from "@/lib/utils";

const STATUSES: WorkflowSession["trackerStatus"][] = [
  "Routed",
  "Round 1 Drafted",
  "Round 2 Refined",
  "Round 3 QA",
  "Submitted",
  "Passed",
  "Rejected",
];

// Map prompt steps → session status so "Mark done" does both things at once.
type StepKey = "round1" | "round2" | "qa" | "round3";
const STEP_TO_STATUS: Record<StepKey, WorkflowSession["trackerStatus"]> = {
  round1: "Round 1 Drafted",
  round2: "Round 2 Refined",
  qa: "Round 2 Refined", // QA is the ChatGPT polish between Round 2 and Round 3
  round3: "Round 3 QA",
};
const STATUS_ORDER: Record<WorkflowSession["trackerStatus"], number> = {
  Routed: 0,
  "Round 1 Drafted": 1,
  "Round 2 Refined": 2,
  "Round 3 QA": 3,
  Submitted: 4,
  Passed: 5,
  Rejected: 5,
};

export default function WorkflowPage() {
  const [routing, setRouting] = useState<RoutingResult | undefined>();
  const [history, setHistory] = useState<RoutingResult[]>([]);
  const [confirmedTrack, setConfirmedTrack] = useState<TrackId | null>(null);
  const [session, setSession] = useState<WorkflowSession | null>(null);
  const [notes, setNotes] = useState("");
  const [jdOpen, setJdOpen] = useState(false);
  const [round1Copied, setRound1Copied] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  useEffect(() => {
    setHistory(getRoutingResults());

    // Resolve the routing to load using a three-tier priority:
    //   (1) ?routingId=… in the URL — an explicit handoff from the router,
    //   (2) the last-active routing id in LocalStorage,
    //   (3) the most recently saved routing (insertion-order fallback).
    // This fixes the handoff bug where a newer routing sitting in storage
    // would shadow the one the user just clicked "Open Workflow" for.
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const queryId = params.get("routingId") ?? undefined;

    let target: RoutingResult | undefined;
    if (queryId) target = getRoutingResult(queryId);
    if (!target) {
      const lastId = getLastActiveRoutingId();
      if (lastId) target = getRoutingResult(lastId);
    }
    if (!target) target = getLatestRoutingResult();

    if (target) {
      setRouting(target);
      setConfirmedTrack(target.selectedTrack);
      setLastActiveRoutingId(target.id);
      const existing = getWorkflowSessionForRouting(target.id);
      if (existing) {
        setSession(existing);
        setNotes(existing.notes);
      }
      // If we resolved via a stale/missing query id, rewrite the URL so a
      // reload stays on the actually-loaded routing.
      if (typeof window !== "undefined" && queryId !== target.id) {
        const next = `/workflow?routingId=${encodeURIComponent(target.id)}`;
        window.history.replaceState(null, "", next);
      }
    }
  }, []);

  const chooseRouting = (r: RoutingResult) => {
    setRouting(r);
    setConfirmedTrack(r.selectedTrack);
    setLastActiveRoutingId(r.id);
    const existing = getWorkflowSessionForRouting(r.id);
    setSession(existing ?? null);
    setNotes(existing?.notes ?? "");
    // Keep the URL in sync so reloads / shares land on the same routing.
    if (typeof window !== "undefined") {
      const next = `/workflow?routingId=${encodeURIComponent(r.id)}`;
      window.history.replaceState(null, "", next);
    }
  };

  const activeTrack: TrackId | null = confirmedTrack;
  const prompt = activeTrack ? PROMPTS[activeTrack] : null;
  const fileStack = activeTrack ? FILE_STACKS[activeTrack] : null;
  const trackCfg = activeTrack ? TRACKS[activeTrack] : null;

  // Pull variant display name (if the routing recorded one for this track).
  const variantName = useMemo(() => {
    if (!routing || !activeTrack) return null;
    if (routing.selectedTrack !== activeTrack) return null;
    return routing.variantName ?? null;
  }, [routing, activeTrack]);

  const upsertSession = (
    nextStatus: WorkflowSession["trackerStatus"],
    nextNotes?: string
  ) => {
    if (!routing || !activeTrack) return;
    const s: WorkflowSession = session
      ? {
          ...session,
          trackerStatus: nextStatus,
          confirmedTrack: activeTrack,
          notes: nextNotes ?? notes,
        }
      : {
          id: shortId(),
          createdAt: nowIso(),
          routingId: routing.id,
          confirmedTrack: activeTrack,
          trackerStatus: nextStatus,
          notes: nextNotes ?? notes,
        };
    saveWorkflowSession(s);
    setSession(s);
  };

  const markStepDone = (step: StepKey) => {
    // Never downgrade: if session already past this step, keep higher status.
    const target = STEP_TO_STATUS[step];
    const current = session?.trackerStatus ?? "Routed";
    const next =
      STATUS_ORDER[current] >= STATUS_ORDER[target] ? current : target;
    upsertSession(next);
  };

  const stepDone = (step: StepKey): boolean => {
    const current = session?.trackerStatus ?? "Routed";
    return STATUS_ORDER[current] >= STATUS_ORDER[STEP_TO_STATUS[step]];
  };

  const updateStatus = (status: WorkflowSession["trackerStatus"]) => {
    upsertSession(status);
  };

  const saveNotes = () => {
    upsertSession(session?.trackerStatus ?? "Routed", notes);
  };

  // Copy handlers
  const copyText = async (t: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(t);
      onDone();
    } catch {
      /* ignore */
    }
  };

  const onCopyRound1 = () => {
    if (!prompt) return;
    copyText(prompt.round1, () => {
      setRound1Copied(true);
      markStepDone("round1");
      setTimeout(() => setRound1Copied(false), 1500);
    });
  };

  const onCopyAll = () => {
    if (!prompt) return;
    const bundle = [
      `========== STEP 1 · CLAUDE · ROUND 1 (${prompt.displayName}) ==========`,
      prompt.round1,
      "",
      `========== STEP 2 · CLAUDE · ROUND 2 (conservative refinement) ==========`,
      prompt.round2,
      "",
      `========== STEP 3 · CHATGPT · QA / REFINE ==========`,
      CHATGPT_REFINE_PROMPT,
      "",
      `========== STEP 4 · CLAUDE · ROUND 3 QA (track-specific) ==========`,
      prompt.round3,
      "",
    ].join("\n");
    copyText(bundle, () => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 1800);
    });
  };

  if (!routing) {
    return (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <Badge variant="muted" className="self-start">
            Page 2 · Resume Workflow Assistant
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
            No routing result yet
          </h1>
          <p className="max-w-2xl text-sm text-ink-500">
            Route a job description first, then come back here to get the
            prompt package and run Round 1 / 2 / 3.
          </p>
        </section>
        <Link href="/router">
          <Button variant="primary">Go to JD Router →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ───── Hero ───── */}
      <section className="flex flex-col gap-4">
        <Badge variant="muted" className="self-start">
          Page 2 · Resume Workflow Assistant
        </Badge>
        <div className="flex flex-wrap items-center gap-2">
          <TrackBadge
            trackId={activeTrack ?? routing.selectedTrack}
            label={TRACKS[activeTrack ?? routing.selectedTrack].name}
            size="lg"
          />
          {variantName ? (
            <Badge variant="muted">Variant · {variantName}</Badge>
          ) : null}
          <Badge variant="accent">{routing.recommendation}</Badge>
          <Badge variant="muted">
            Worth applying · {routing.worthApplyingScore}
          </Badge>
          {session ? (
            <Badge variant="success">Status · {session.trackerStatus}</Badge>
          ) : (
            <Badge variant="muted">Status · Routed</Badge>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {routing.jdTitleGuess}
        </h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Your handoff workspace. Confirm the track, grab the file stack, then
          run the prompt playbook in order. Everything you paste into Claude or
          ChatGPT lives here.
        </p>

        {/* Hero CTA row — one visually primary next action. Secondary
            actions stay as ghost buttons so the eye lands on Round 1 first. */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={onCopyRound1}>
            {round1Copied ? "✓ Round 1 copied" : "Copy Round 1 prompt"}
          </Button>
          <Link href="/router">
            <Button variant="ghost">← Back to Router</Button>
          </Link>
        </div>

        {/* Switch routing — stays discoverable but low-key */}
        {history.length > 1 ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span className="text-[10px] font-medium uppercase tracking-wide">
              Switch routing
            </span>
            {history.slice(0, 6).map((h) => (
              <button
                key={h.id}
                onClick={() => chooseRouting(h)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  h.id === routing.id
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                Track {h.selectedTrack} · {h.jdTitleGuess.slice(0, 32)}
                {h.jdTitleGuess.length > 32 ? "…" : ""}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {/* ───── Row 1 · Confirmed track + file stack ───── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Confirmed track</CardTitle>
            <CardDescription>
              Override if your read differs from the router.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {TRACK_ORDER.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={t === activeTrack ? "default" : "outline"}
                  onClick={() => setConfirmedTrack(t)}
                >
                  Track {t}
                </Button>
              ))}
            </div>
            {trackCfg ? (
              <p className="text-xs leading-relaxed text-ink-500">
                {trackCfg.summary}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Confirmed file stack</CardTitle>
                <CardDescription>
                  Upload these in order into your new Claude / ChatGPT chat.
                </CardDescription>
              </div>
              <Badge variant="muted">Upload order 1 → 4</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {fileStack
              ? [
                  fileStack.formatTemplate,
                  fileStack.contentMaster,
                  fileStack.evidenceBank,
                  fileStack.supportingReference,
                ].map((row, idx) => (
                  <div
                    key={row.label}
                    className="flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/40 px-3 py-3"
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white"
                      aria-hidden
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                          {row.label}
                        </span>
                        {row.optional ? (
                          <span className="rounded-full border border-ink-200 bg-white px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide text-ink-500">
                            Optional
                          </span>
                        ) : null}
                      </div>
                      <span className="truncate font-mono text-[12.5px] text-ink-800">
                        {row.fileName}
                      </span>
                      {row.note ? (
                        <span className="text-xs text-ink-500">{row.note}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              : null}
            {fileStack?.trackNote ? (
              <p className="sm:col-span-2 rounded-xl border border-ink-100 bg-white px-3 py-2 text-[12px] leading-relaxed text-ink-600">
                <span className="font-semibold text-ink-700">Note · </span>
                {fileStack.trackNote}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* ───── Row 2 · Prompt playbook ───── */}
      {prompt ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                Prompt playbook
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Run these in order. Each step maps to a session status and
                saves automatically when you mark it done.
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-400">
                Source · <span className="font-mono normal-case">{prompt.sourceFile}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCopyAll}>
                {allCopied ? "✓ Copied" : "Copy all prompts"}
              </Button>
            </div>
          </div>

          <PromptBlock
            stepNumber={1}
            tone="round1"
            title="Claude · Round 1 — McKinsey-style tailor"
            description="Paste after uploading the file stack + target JD."
            text={prompt.round1}
            meta={`Track ${activeTrack} · ${prompt.displayName}`}
            done={stepDone("round1")}
            onMarkDone={() => markStepDone("round1")}
            markDoneLabel="Mark Round 1 drafted"
          />
          <PromptBlock
            stepNumber={2}
            tone="round2"
            title="Claude · Round 2 — conservative refinement"
            description="Use after Round 1 draft. No re-analysis of the JD."
            text={prompt.round2}
            meta={`Track ${activeTrack} · Round 2`}
            done={stepDone("round2")}
            onMarkDone={() => markStepDone("round2")}
            markDoneLabel="Mark Round 2 refined"
          />
          <PromptBlock
            stepNumber={3}
            tone="qa"
            title="ChatGPT · QA / refine pass"
            description="Recruiter readability + ATS + grammar. Shared across tracks."
            text={CHATGPT_REFINE_PROMPT}
            meta="Shared across tracks"
            done={stepDone("qa")}
            onMarkDone={() => markStepDone("qa")}
            markDoneLabel="Mark QA done"
          />
          <PromptBlock
            stepNumber={4}
            tone="round3"
            title="Claude · Round 3 QA — track-specific"
            description="Final ATS reviewer + recruiter QA pass."
            text={prompt.round3}
            meta={`Track ${activeTrack} · Round 3`}
            done={stepDone("round3")}
            onMarkDone={() => markStepDone("round3")}
            markDoneLabel="Mark Round 3 done"
          />
        </section>
      ) : null}

      {/* ───── Row 3 · Session status + Save-back ───── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Session status</CardTitle>
            <CardDescription>
              Marked automatically as you complete prompt steps — override any
              time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    session?.trackerStatus === s
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Learnings, recruiter name, next action, red flags…"
                className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm shadow-sm focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/20 focus:outline-none"
                rows={4}
              />
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm" onClick={saveNotes}>
                  Save notes
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 font-mono text-xs text-ink-800">
              {routing.trackerTag}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <SaveBackPanel defaultTrack={activeTrack ?? routing.selectedTrack} />
        </div>
      </div>

      {/* ───── Row 4 · Source JD (collapsible) ───── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Source JD</CardTitle>
              <CardDescription>
                Read-only — kept with this session.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setJdOpen((o) => !o)}
            >
              {jdOpen ? "Hide" : "Show"} JD
            </Button>
          </div>
        </CardHeader>
        {jdOpen ? (
          <CardContent>
            <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap rounded-xl bg-ink-50/60 px-4 py-3 text-[12.5px] leading-relaxed text-ink-700">
              {routing.jdText}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-500">
              <StatChip
                label="Matched keywords"
                value={routing.matchedKeywords.length}
                accent="muted"
              />
              <StatChip label="Real gaps" value={routing.realGaps.length} />
              <StatChip
                label="Positioning gaps"
                value={routing.positioningGaps.length}
                accent="muted"
              />
            </div>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
