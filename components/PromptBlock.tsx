"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PromptBlockTone = "round1" | "round2" | "qa" | "round3" | "default";

// Color stripe at the top of the card — keeps visual hierarchy calm but
// lets you scan the playbook by round at a glance.
const TONE_STYLES: Record<
  PromptBlockTone,
  { border: string; pill: string; label: string }
> = {
  round1: {
    border: "border-t-sky-400",
    pill: "bg-sky-50 text-sky-700 ring-sky-200",
    label: "Round 1",
  },
  round2: {
    border: "border-t-indigo-400",
    pill: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    label: "Round 2",
  },
  qa: {
    border: "border-t-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "QA",
  },
  round3: {
    border: "border-t-amber-400",
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    label: "Round 3",
  },
  default: {
    border: "border-t-ink-200",
    pill: "bg-ink-50 text-ink-700 ring-ink-200",
    label: "",
  },
};

export function PromptBlock({
  title,
  description,
  text,
  meta,
  className,
  stepNumber,
  tone = "default",
  done = false,
  onMarkDone,
  markDoneLabel,
}: {
  title: string;
  description?: string;
  text: string;
  meta?: string;
  className?: string;
  stepNumber?: number;
  tone?: PromptBlockTone;
  done?: boolean;
  onMarkDone?: () => void;
  markDoneLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const toneCfg = TONE_STYLES[tone];
  const charCount = text.length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card border-t-2",
        toneCfg.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
        <div className="flex min-w-0 items-start gap-4">
          {typeof stepNumber === "number" ? (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white"
              aria-hidden
            >
              {stepNumber}
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-ink-900">
                {title}
              </h3>
              {toneCfg.label ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1",
                    toneCfg.pill
                  )}
                >
                  {toneCfg.label}
                </span>
              ) : null}
              {done ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                  Done
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                {description}
              </p>
            ) : null}
            {meta ? (
              <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-400">
                {meta}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand prompt" : "Collapse prompt"}
          >
            {collapsed ? "Expand" : "Collapse"}
          </Button>
          <Button size="sm" variant="outline" onClick={onCopy}>
            {copied ? "Copied ✓" : "Copy"}
          </Button>
          {onMarkDone ? (
            <Button
              size="sm"
              variant={done ? "default" : "primary"}
              onClick={onMarkDone}
            >
              {done ? "✓ Done" : markDoneLabel ?? "Mark done"}
            </Button>
          ) : null}
        </div>
      </div>
      {!collapsed ? (
        <>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words bg-ink-50/60 px-6 py-5 font-mono text-[12.5px] leading-relaxed text-ink-800">
            {text}
          </pre>
          <div className="flex items-center justify-between border-t border-ink-100 bg-white px-6 py-2 text-[11px] text-ink-400">
            <span>{charCount.toLocaleString()} characters</span>
            <span className="font-mono">Ready to paste</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
