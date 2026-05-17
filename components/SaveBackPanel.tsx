"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getMemoryBank, saveMemoryBank } from "@/lib/storage";
import { TRACK_ORDER, type TrackId } from "@/config/tracks";
import type {
  MemoryBank,
  MemoryExperienceFact,
  MemoryProjectFact,
} from "@/lib/types";

// Target sections the panel can save into.
type TargetKey =
  | "experienceFact"
  | "projectFact"
  | "summaryWording"
  | "bulletWording"
  | "metricToVerify"
  | "doNotSaveYet";

const TARGETS: Array<{ key: TargetKey; label: string; hint: string }> = [
  {
    key: "experienceFact",
    label: "Experience fact",
    hint: "Anchor-able fact tied to a specific company.",
  },
  {
    key: "projectFact",
    label: "Project fact",
    hint: "Portfolio / prototype project with honest status.",
  },
  {
    key: "summaryWording",
    label: "Summary wording",
    hint: "Reusable Professional Summary sentence.",
  },
  {
    key: "bulletWording",
    label: "Bullet wording",
    hint: "Battle-tested resume bullet.",
  },
  {
    key: "metricToVerify",
    label: "Metric to verify",
    hint: "Number you haven't confirmed — flag for later.",
  },
  {
    key: "doNotSaveYet",
    label: "Do not save yet",
    hint: "Claim that isn't proven — keep off the resume for now.",
  },
];

export function SaveBackPanel({
  defaultTrack,
}: {
  defaultTrack?: TrackId;
}) {
  const [target, setTarget] = useState<TargetKey>("bulletWording");
  const [saved, setSaved] = useState(false);
  const [tags, setTags] = useState<TrackId[]>(
    defaultTrack ? [defaultTrack] : []
  );
  // Default to unverified. Forces an explicit opt-in so captured-mid-session
  // claims don't sneak into the resume without a conscious check.
  const [verified, setVerified] = useState(false);

  // Per-target form fields
  const [company, setCompany] = useState("");
  const [fact, setFact] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [projectTools, setProjectTools] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [text, setText] = useState("");

  const activeTarget = useMemo(
    () => TARGETS.find((t) => t.key === target)!,
    [target]
  );

  const reset = () => {
    setCompany("");
    setFact("");
    setProjectName("");
    setProjectStatus("");
    setProjectTools("");
    setProjectSummary("");
    setText("");
  };

  const canSave = (() => {
    if (target === "experienceFact") return !!company.trim() && !!fact.trim();
    if (target === "projectFact") return !!projectName.trim();
    return !!text.trim();
  })();

  const save = () => {
    if (!canSave) return;
    const bank: MemoryBank = getMemoryBank();

    if (target === "experienceFact") {
      const item: MemoryExperienceFact = {
        company: company.trim(),
        fact: fact.trim(),
        tags,
        verified,
      };
      bank.experienceFacts = [item, ...bank.experienceFacts];
    } else if (target === "projectFact") {
      const item: MemoryProjectFact = {
        name: projectName.trim(),
        status: projectStatus.trim(),
        tools: projectTools.trim(),
        summary: projectSummary.trim(),
        tags,
        verified,
      };
      bank.projectFacts = [item, ...bank.projectFacts];
    } else if (target === "summaryWording") {
      bank.summaryWordings = [text.trim(), ...bank.summaryWordings];
    } else if (target === "bulletWording") {
      bank.bulletWordings = [text.trim(), ...bank.bulletWordings];
    } else if (target === "metricToVerify") {
      bank.metricsToVerify = [text.trim(), ...bank.metricsToVerify];
    } else if (target === "doNotSaveYet") {
      bank.doNotSaveYet = [text.trim(), ...bank.doNotSaveYet];
    }

    saveMemoryBank(bank);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    reset();
    // Force next capture to start unverified again — explicit opt-in every time.
    setVerified(false);
  };

  const toggleTag = (t: TrackId) => {
    if (tags.includes(t)) setTags(tags.filter((x) => x !== t));
    else setTags([...tags, t]);
  };

  const needsTags = target === "experienceFact" || target === "projectFact";
  const needsVerified = target === "experienceFact" || target === "projectFact";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Save-back to Memory Bank</CardTitle>
            <CardDescription>
              Capture learnings from this session straight into your Memory
              Bank — no need to leave the page.
            </CardDescription>
          </div>
          {saved ? (
            <Badge variant="success">Saved ✓</Badge>
          ) : (
            <Link href="/memory" className="shrink-0">
              <Button variant="ghost" size="sm">
                Open Memory Bank →
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Target picker */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
            Save as
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TARGETS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTarget(t.key);
                  reset();
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  target === t.key
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-500">{activeTarget.hint}</p>
        </div>

        {/* Form fields by target */}
        {target === "experienceFact" ? (
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <Input
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <Input
              placeholder="Verified fact"
              value={fact}
              onChange={(e) => setFact(e.target.value)}
            />
          </div>
        ) : null}

        {target === "projectFact" ? (
          <div className="grid gap-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Input
                placeholder="Status (Completed / Prototype / In progress)"
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
              />
            </div>
            <Input
              placeholder="Tools used"
              value={projectTools}
              onChange={(e) => setProjectTools(e.target.value)}
            />
            <Textarea
              rows={2}
              placeholder="One-line summary"
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
            />
          </div>
        ) : null}

        {target !== "experienceFact" && target !== "projectFact" ? (
          <Textarea
            rows={3}
            placeholder={
              target === "summaryWording"
                ? "e.g. Regional supply chain / supply planning candidate with…"
                : target === "bulletWording"
                  ? "e.g. Placed POs in SAP MM against 24-month rolling demand plans…"
                  : target === "metricToVerify"
                    ? "e.g. Exact % uplift from Power BI dashboard rollout"
                    : "e.g. AI project framed as production deployment"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : null}

        {/* Tags + verified (only for facts) */}
        {needsTags ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                Track tags
              </span>
              {TRACK_ORDER.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                      active
                        ? "border-ink-900 bg-ink-900 text-white"
                        : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
                    }`}
                  >
                    Track {t}
                  </button>
                );
              })}
            </div>
            {needsVerified ? (
              <label className="inline-flex items-center gap-2 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-ink-300 text-ink-900 focus:ring-accent-500"
                />
                Verified
              </label>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={reset} disabled={!canSave}>
            Clear
          </Button>
          <Button variant="primary" size="sm" onClick={save} disabled={!canSave}>
            Save to Memory Bank
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
