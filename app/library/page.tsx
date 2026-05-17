"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackBadge } from "@/components/TrackBadge";
import { FILE_STACKS } from "@/config/fileStacks";
import { TRACKS, TRACK_ORDER, type TrackId } from "@/config/tracks";
import { PROMPTS } from "@/config/prompts";


const ROLES = [
  { key: "formatTemplate", label: "Format Template" },
  { key: "contentMaster", label: "Content Master" },
  { key: "evidenceBank", label: "Evidence Bank" },
  { key: "supportingReference", label: "Supporting Reference" },
] as const;

export default function LibraryPage() {
  const [view, setView] = useState<"byTrack" | "byRole">("byTrack");

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Badge variant="muted" className="self-start">
          Page 4 · File Library
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          File Library
        </h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Canonical file-role setup for every track. Pulls from{" "}
          <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[11px]">
            config/fileStacks.ts
          </code>
          . Rename a file there to update it everywhere.
        </p>
      </section>

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList>
          <TabsTrigger value="byTrack">By Track</TabsTrigger>
          <TabsTrigger value="byRole">By File Role</TabsTrigger>
        </TabsList>

        <TabsContent value="byTrack" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {TRACK_ORDER.map((t) => (
              <TrackStackCard key={t} trackId={t as TrackId} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="byRole" className="mt-6">
          <div className="grid gap-6">
            {ROLES.map((r) => (
              <Card key={r.key}>
                <CardHeader>
                  <CardTitle>{r.label}</CardTitle>
                  <CardDescription>
                    Which file plays this role for each track.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {TRACK_ORDER.map((t) => {
                    const entry = FILE_STACKS[t][r.key];
                    return (
                      <div
                        key={t}
                        className="flex flex-col gap-1 rounded-xl border border-ink-100 bg-ink-50/40 px-4 py-3"
                      >
                        <TrackBadge trackId={t} size="sm" />
                        <span className="font-mono text-[12.5px] text-ink-800">
                          {entry.fileName}
                        </span>
                        {entry.note ? (
                          <span className="text-xs text-ink-500">
                            {entry.note}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrackStackCard({ trackId }: { trackId: TrackId }) {
  const track = TRACKS[trackId];
  const stack = FILE_STACKS[trackId];
  const prompt = PROMPTS[trackId];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrackBadge trackId={trackId} size="md" />
          <CardTitle>{track.name}</CardTitle>
        </div>
        <CardDescription>{track.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ROLES.map((r) => {
          const row = stack[r.key];
          return (
            <div
              key={r.key}
              className="flex flex-col gap-0.5 border-t border-ink-100 pt-3 first:border-t-0 first:pt-0"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                {row.label}
              </span>
              <span className="font-mono text-[13px] text-ink-800">
                {row.fileName}
              </span>
              {row.note ? (
                <span className="text-xs text-ink-500">{row.note}</span>
              ) : null}
            </div>
          );
        })}
        <div className="mt-4 rounded-xl border border-ink-100 bg-white px-3 py-2 text-xs text-ink-500">
          <span className="font-medium text-ink-700">Prompt file: </span>
          <span className="font-mono">{prompt.sourceFile}</span>
        </div>
      </CardContent>
    </Card>
  );
}
