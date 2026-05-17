"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TrackBadge } from "@/components/TrackBadge";
import { getMemoryBank, resetMemoryBank, saveMemoryBank } from "@/lib/storage";
import type {
  MemoryBank,
  MemoryExperienceFact,
  MemoryProjectFact,
} from "@/lib/types";
import type { TrackId } from "@/config/tracks";
import { TRACK_ORDER, TRACKS } from "@/config/tracks";

type VerifiedFilter = "all" | "verified" | "to-verify";
type TrackFilter = "all" | TrackId;

// Treat legacy facts (no `verified` field) as verified by default, matching
// the behavior described in types.ts.
const isVerified = (v: boolean | undefined) => v !== false;

// Case-insensitive substring match with short-circuit for empty queries.
const makeMatcher = (q: string) => {
  const needle = q.trim().toLowerCase();
  return (s: string | undefined) => {
    if (!needle) return true;
    if (!s) return false;
    return s.toLowerCase().includes(needle);
  };
};

export default function MemoryPage() {
  const [mem, setMem] = useState<MemoryBank | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMem(getMemoryBank());
  }, []);

  const save = () => {
    if (!mem) return;
    saveMemoryBank(mem);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const reset = () => {
    resetMemoryBank();
    setMem(getMemoryBank());
    setDirty(false);
  };

  if (!mem) {
    return (
      <div>
        <Badge variant="muted" className="mb-3">
          Page 3 · Memory Bank
        </Badge>
        <p className="text-sm text-ink-500">Loading memory…</p>
      </div>
    );
  }

  const update = <K extends keyof MemoryBank>(key: K, value: MemoryBank[K]) => {
    setMem({ ...mem, [key]: value });
    setDirty(true);
  };

  // Search matcher (case-insensitive substring).
  const match = makeMatcher(search);
  const q = search.trim();

  // Tab-level counts reflect the search scope when one is active.
  const expTotal = mem.experienceFacts.length;
  const projTotal = mem.projectFacts.length;
  const wordingTotal =
    mem.summaryWordings.length + mem.bulletWordings.length;
  const flagTotal =
    mem.metricsToVerify.length + mem.doNotSaveYet.length;

  const expMatched = mem.experienceFacts.filter(
    (f) => match(f.company) || match(f.fact)
  ).length;
  const projMatched = mem.projectFacts.filter(
    (p) =>
      match(p.name) || match(p.status) || match(p.tools) || match(p.summary)
  ).length;
  const wordingMatched =
    mem.summaryWordings.filter(match).length +
    mem.bulletWordings.filter(match).length;
  const flagMatched =
    mem.metricsToVerify.filter(match).length +
    mem.doNotSaveYet.filter(match).length;
  const notesMatched = TRACK_ORDER.filter((t) =>
    match(mem.trackNotes[t as TrackId] ?? "")
  ).length;

  const factLabel = q
    ? `${expMatched + projMatched} / ${expTotal + projTotal}`
    : `${expTotal + projTotal}`;
  const wordingLabel = q ? `${wordingMatched} / ${wordingTotal}` : `${wordingTotal}`;
  const flagLabel = q ? `${flagMatched} / ${flagTotal}` : `${flagTotal}`;
  const notesLabel = q ? `${notesMatched} / 4` : undefined;

  return (
    <div className="flex flex-col gap-8">
      {/* ───── Hero ───── */}
      <section className="flex flex-col gap-3">
        <Badge variant="muted" className="self-start">
          Page 3 · Memory Bank
        </Badge>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Memory Bank
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-500">
              Single source of truth for your verified facts, reusable wording,
              and guardrails. Edits save to this browser.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saved ? (
              <Badge variant="success">Saved ✓</Badge>
            ) : dirty ? (
              <Badge variant="warn">Unsaved changes</Badge>
            ) : null}
            <Button variant="outline" onClick={reset}>
              Reset to seed
            </Button>
            <Button variant="primary" onClick={save} disabled={!dirty}>
              Save
            </Button>
          </div>
        </div>
      </section>

      {/* ───── Search bar ───── */}
      <div className="rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
        <label
          htmlFor="memory-search"
          className="text-[10px] font-medium uppercase tracking-wide text-ink-500"
        >
          Search memory
        </label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            id="memory-search"
            placeholder="Search facts, wording, metrics, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
            >
              Clear
            </Button>
          ) : null}
        </div>
        {q ? (
          <p className="mt-2 text-[11px] text-ink-500">
            Showing matches for <span className="font-mono">“{q}”</span>{" "}
            across all sections.
          </p>
        ) : null}
      </div>

      {/* ───── Tabs ───── */}
      <Tabs defaultValue="facts" className="flex flex-col gap-6">
        <TabsList>
          <TabsTrigger value="facts">Facts · {factLabel}</TabsTrigger>
          <TabsTrigger value="wording">Wording · {wordingLabel}</TabsTrigger>
          <TabsTrigger value="flags">Flags · {flagLabel}</TabsTrigger>
          <TabsTrigger value="notes">
            Track notes{notesLabel ? ` · ${notesLabel}` : ""}
          </TabsTrigger>
        </TabsList>

        {/* ─── FACTS ─── */}
        <TabsContent value="facts" className="flex flex-col gap-6">
          <FactsPane
            experienceFacts={mem.experienceFacts}
            projectFacts={mem.projectFacts}
            onChangeExperience={(v) => update("experienceFacts", v)}
            onChangeProjects={(v) => update("projectFacts", v)}
            search={q}
          />
        </TabsContent>

        {/* ─── WORDING ─── */}
        <TabsContent value="wording" className="grid gap-6 lg:grid-cols-2">
          <StringList
            title="Reusable summary wording"
            description="Positioning lines you can pull into Professional Summary."
            items={mem.summaryWordings}
            onChange={(v) => update("summaryWordings", v)}
            placeholder="e.g. Regional supply chain / supply planning candidate with…"
            search={q}
          />
          <StringList
            title="Reusable bullet wording"
            description="Battle-tested bullets safe to reuse verbatim."
            items={mem.bulletWordings}
            onChange={(v) => update("bulletWordings", v)}
            placeholder="e.g. Placed POs in SAP MM against 24-month rolling demand plans…"
            search={q}
          />
        </TabsContent>

        {/* ─── FLAGS ─── */}
        <TabsContent value="flags" className="grid gap-6 lg:grid-cols-2">
          <StringList
            title="Metrics to verify later"
            description="Numbers you haven't confirmed yet — treat as 'metric to verify'."
            items={mem.metricsToVerify}
            onChange={(v) => update("metricsToVerify", v)}
            placeholder="e.g. Exact % uplift from Power BI dashboard rollout"
            accent="warn"
            search={q}
          />
          <StringList
            title="Do not save yet"
            description="Claims that aren't proven — keep out of the resume for now."
            items={mem.doNotSaveYet}
            onChange={(v) => update("doNotSaveYet", v)}
            placeholder="e.g. AI project framed as production deployment"
            accent="danger"
            search={q}
          />
        </TabsContent>

        {/* ─── TRACK NOTES ─── */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Track-specific notes</CardTitle>
                  <CardDescription>
                    One paragraph per track — your running coach-style reminders.
                  </CardDescription>
                </div>
                {q ? (
                  <Badge variant="muted">
                    {notesMatched} of 4 match
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
  {TRACK_ORDER.filter(
    (t) => !q || match(mem.trackNotes[t as TrackId] ?? "")
  ).map((t) => (
    <div key={t} className="flex flex-col gap-2">
      <TrackBadge
        trackId={t as TrackId}
        label={TRACKS[t as TrackId].name}
      />
      <Textarea
        rows={4}
        value={mem.trackNotes[t as TrackId] ?? ""}
        onChange={(e) => {
          const next = {
            ...mem.trackNotes,
            [t as TrackId]: e.target.value,
          };
          update("trackNotes", next);
        }}
      />
    </div>
  ))}
              {q && notesMatched === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-xs text-ink-500">
                  No track notes match this search.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Facts pane — sub-tabs (Experience / Project), filter pills,
   quick-add, verified toggle per row.
   ────────────────────────────────────────────────────────────── */

function FactsPane({
  experienceFacts,
  projectFacts,
  onChangeExperience,
  onChangeProjects,
  search,
}: {
  experienceFacts: MemoryExperienceFact[];
  projectFacts: MemoryProjectFact[];
  onChangeExperience: (v: MemoryExperienceFact[]) => void;
  onChangeProjects: (v: MemoryProjectFact[]) => void;
  search: string;
}) {
  const [verifiedFilter, setVerifiedFilter] =
    useState<VerifiedFilter>("all");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");

  const match = makeMatcher(search);

  const experienceMatchesSearch = (f: MemoryExperienceFact) =>
    match(f.company) || match(f.fact);
  const projectMatchesSearch = (p: MemoryProjectFact) =>
    match(p.name) || match(p.status) || match(p.tools) || match(p.summary);

  const passesFilters = <T extends { verified?: boolean; tags: TrackId[] }>(
    f: T
  ) => {
    if (verifiedFilter === "verified" && !isVerified(f.verified)) return false;
    if (verifiedFilter === "to-verify" && isVerified(f.verified)) return false;
    if (trackFilter !== "all" && !f.tags.includes(trackFilter)) return false;
    return true;
  };

  const filteredExperience = useMemo(
    () =>
      experienceFacts
        .filter(passesFilters)
        .filter(experienceMatchesSearch),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [experienceFacts, verifiedFilter, trackFilter, search]
  );
  const filteredProjects = useMemo(
    () =>
      projectFacts
        .filter(passesFilters)
        .filter(projectMatchesSearch),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectFacts, verifiedFilter, trackFilter, search]
  );

  const expVerified = experienceFacts.filter((f) => isVerified(f.verified))
    .length;
  const projVerified = projectFacts.filter((p) => isVerified(p.verified))
    .length;

  return (
    <div className="flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
            Show
          </span>
          {(
            [
              { v: "all", label: "All" },
              { v: "verified", label: "Verified" },
              { v: "to-verify", label: "To verify" },
            ] as Array<{ v: VerifiedFilter; label: string }>
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setVerifiedFilter(o.v)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                verifiedFilter === o.v
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-ink-100" />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
            Track
          </span>
          <button
            type="button"
            onClick={() => setTrackFilter("all")}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
              trackFilter === "all"
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
            }`}
          >
            All
          </button>
          {TRACK_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrackFilter(t as TrackId)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                trackFilter === t
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
              }`}
            >
              Track {t}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="experience" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="experience">
            Experience · {expVerified}/{experienceFacts.length}
          </TabsTrigger>
          <TabsTrigger value="project">
            Project · {projVerified}/{projectFacts.length}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experience" className="flex flex-col gap-4">
          <ExperienceQuickAdd
            onAdd={(f) =>
              onChangeExperience([f, ...experienceFacts])
            }
          />
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Experience facts</CardTitle>
                  <CardDescription>
                    Anchor statements by company. Point to these in interviews
                    without overstating.
                  </CardDescription>
                </div>
                <Badge variant="muted">
                  Showing {filteredExperience.length} of{" "}
                  {experienceFacts.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredExperience.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-xs text-ink-500">
                  No facts match the current filter.
                </p>
              ) : null}
              {filteredExperience.map((f) => {
                const realIdx = experienceFacts.indexOf(f);
                return (
                  <ExperienceFactRow
                    key={realIdx}
                    value={f}
                    onChange={(next) => {
                      const copy = [...experienceFacts];
                      copy[realIdx] = next;
                      onChangeExperience(copy);
                    }}
                    onDelete={() =>
                      onChangeExperience(
                        experienceFacts.filter((_, idx) => idx !== realIdx)
                      )
                    }
                  />
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project" className="flex flex-col gap-4">
          <ProjectQuickAdd
            onAdd={(p) => onChangeProjects([p, ...projectFacts])}
          />
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Project facts</CardTitle>
                  <CardDescription>
                    Portfolio / prototype / concept projects. Label status
                    honestly.
                  </CardDescription>
                </div>
                <Badge variant="muted">
                  Showing {filteredProjects.length} of {projectFacts.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredProjects.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-xs text-ink-500">
                  No projects match the current filter.
                </p>
              ) : null}
              {filteredProjects.map((p) => {
                const realIdx = projectFacts.indexOf(p);
                return (
                  <ProjectFactRow
                    key={realIdx}
                    value={p}
                    onChange={(next) => {
                      const copy = [...projectFacts];
                      copy[realIdx] = next;
                      onChangeProjects(copy);
                    }}
                    onDelete={() =>
                      onChangeProjects(
                        projectFacts.filter((_, idx) => idx !== realIdx)
                      )
                    }
                  />
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Quick-add rows — tuck the "add" action at the top so you don't
   have to scroll to the end of a long list.
   ────────────────────────────────────────────────────────────── */

function ExperienceQuickAdd({
  onAdd,
}: {
  onAdd: (v: MemoryExperienceFact) => void;
}) {
  const [company, setCompany] = useState("");
  const [fact, setFact] = useState("");

  const canAdd = !!company.trim() && !!fact.trim();

  const add = () => {
    if (!canAdd) return;
    onAdd({
      company: company.trim(),
      fact: fact.trim(),
      tags: [],
      verified: true,
    });
    setCompany("");
    setFact("");
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
        Quick-add experience fact
      </span>
      <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
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
        <Button variant="primary" size="sm" onClick={add} disabled={!canAdd}>
          + Add
        </Button>
      </div>
    </div>
  );
}

function ProjectQuickAdd({
  onAdd,
}: {
  onAdd: (v: MemoryProjectFact) => void;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const canAdd = !!name.trim();

  const add = () => {
    if (!canAdd) return;
    onAdd({
      name: name.trim(),
      status: status.trim(),
      tools: "",
      summary: "",
      tags: [],
      verified: true,
    });
    setName("");
    setStatus("");
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
        Quick-add project
      </span>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Status (Completed / Prototype / In progress)"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Button variant="primary" size="sm" onClick={add} disabled={!canAdd}>
          + Add
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Row components
   ────────────────────────────────────────────────────────────── */

function ExperienceFactRow({
  value,
  onChange,
  onDelete,
}: {
  value: MemoryExperienceFact;
  onChange: (v: MemoryExperienceFact) => void;
  onDelete: () => void;
}) {
  const verified = isVerified(value.verified);
  return (
    <div
      className={`rounded-xl border p-3 ${
        verified
          ? "border-ink-100 bg-ink-50/40"
          : "border-amber-200 bg-amber-50/40"
      }`}
    >
      <div className="mb-2 grid gap-2 sm:grid-cols-[180px_1fr]">
        <Input
          placeholder="Company"
          value={value.company}
          onChange={(e) => onChange({ ...value, company: e.target.value })}
        />
        <Input
          placeholder="Verified fact"
          value={value.fact}
          onChange={(e) => onChange({ ...value, fact: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TrackTagPicker
          tags={value.tags}
          onChange={(tags) => onChange({ ...value, tags })}
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-ink-600">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => onChange({ ...value, verified: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-ink-300 text-ink-900 focus:ring-accent-500"
            />
            Verified
          </label>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProjectFactRow({
  value,
  onChange,
  onDelete,
}: {
  value: MemoryProjectFact;
  onChange: (v: MemoryProjectFact) => void;
  onDelete: () => void;
}) {
  const verified = isVerified(value.verified);
  return (
    <div
      className={`rounded-xl border p-3 ${
        verified
          ? "border-ink-100 bg-ink-50/40"
          : "border-amber-200 bg-amber-50/40"
      }`}
    >
      <div className="mb-2 grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Project name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        <Input
          placeholder="Status (Completed / Prototype / In progress)"
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value })}
        />
      </div>
      <div className="mb-2 grid gap-2">
        <Input
          placeholder="Tools used"
          value={value.tools}
          onChange={(e) => onChange({ ...value, tools: e.target.value })}
        />
        <Textarea
          rows={2}
          placeholder="One-line summary"
          value={value.summary}
          onChange={(e) => onChange({ ...value, summary: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TrackTagPicker
          tags={value.tags}
          onChange={(tags) => onChange({ ...value, tags })}
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-ink-600">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => onChange({ ...value, verified: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-ink-300 text-ink-900 focus:ring-accent-500"
            />
            Verified
          </label>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

function TrackTagPicker({
  tags,
  onChange,
}: {
  tags: TrackId[];
  onChange: (t: TrackId[]) => void;
}) {
  const toggle = (t: TrackId) => {
    if (tags.includes(t)) onChange(tags.filter((x) => x !== t));
    else onChange([...tags, t]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {TRACK_ORDER.map((t) => {
        const active = tags.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
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
  );
}

function StringList({
  title,
  description,
  items,
  onChange,
  placeholder,
  accent,
  search,
}: {
  title: string;
  description: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  accent?: "warn" | "danger";
  search?: string;
}) {
  const [quick, setQuick] = useState("");

  const add = () => {
    const t = quick.trim();
    if (!t) return;
    onChange([t, ...items]);
    setQuick("");
  };

  const accentRing =
    accent === "danger"
      ? "border-rose-200 bg-rose-50/30"
      : accent === "warn"
        ? "border-amber-200 bg-amber-50/30"
        : "border-ink-100 bg-ink-50/40";

  // Filter visible items by search, but keep the real index so edit/delete
  // writes back to the correct slot in the source array.
  const match = makeMatcher(search ?? "");
  const visibleIndices = items
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => match(s));
  const searchActive = !!(search && search.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="muted">
            {searchActive
              ? `${visibleIndices.length} / ${items.length}`
              : items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={add}
            disabled={!quick.trim()}
          >
            + Add
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-200 px-4 py-5 text-center text-xs text-ink-500">
            Nothing here yet.
          </p>
        ) : null}
        {items.length > 0 && visibleIndices.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-200 px-4 py-5 text-center text-xs text-ink-500">
            No matches in this section.
          </p>
        ) : null}
        {visibleIndices.map(({ s, i }) => (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${accentRing}`}
          >
            <Textarea
              rows={2}
              value={s}
              placeholder={placeholder}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = e.target.value;
                onChange(copy);
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              ✕
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
