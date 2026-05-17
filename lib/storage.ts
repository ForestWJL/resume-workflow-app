// lib/storage.ts
// LocalStorage persistence for routing results, workflow sessions, and memory bank.
// Safe for SSR: every helper guards against `window === undefined`.

import type { RoutingResult, WorkflowSession, MemoryBank } from "./types";
import { MEMORY_SEED } from "@/config/memorySeed";

const KEYS = {
  routing: "rwf.routingResults.v1",
  workflow: "rwf.workflowSessions.v1",
  memory: "rwf.memoryBank.v1",
  // Tracks the routing the user most recently chose to work on (via Open
  // Workflow, switch-routing pills, or View). Used as a secondary fallback
  // when the workflow page is opened without a routingId query param.
  lastActiveRouting: "rwf.lastActiveRoutingId.v1",
} as const;

function isClient() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors silently for V1 */
  }
}

/* ───── Routing results ───── */
export function getRoutingResults(): RoutingResult[] {
  return read<RoutingResult[]>(KEYS.routing, []);
}

export function saveRoutingResult(r: RoutingResult) {
  const all = getRoutingResults();
  all.unshift(r);
  write(KEYS.routing, all.slice(0, 50)); // cap to last 50
}

export function getRoutingResult(id: string): RoutingResult | undefined {
  return getRoutingResults().find((r) => r.id === id);
}

export function getLatestRoutingResult(): RoutingResult | undefined {
  return getRoutingResults()[0];
}

export function deleteRoutingResult(id: string) {
  const all = getRoutingResults().filter((r) => r.id !== id);
  write(KEYS.routing, all);
  // If the deleted routing was the last-active one, clear the pointer so we
  // don't land on a ghost id next time the workflow page opens.
  if (getLastActiveRoutingId() === id) clearLastActiveRoutingId();
}

/* ───── Last-active routing (secondary fallback for workflow handoff) ───── */
export function setLastActiveRoutingId(id: string) {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(KEYS.lastActiveRouting, id);
  } catch {
    /* ignore */
  }
}

export function getLastActiveRoutingId(): string | undefined {
  if (!isClient()) return undefined;
  try {
    const v = window.localStorage.getItem(KEYS.lastActiveRouting);
    return v ?? undefined;
  } catch {
    return undefined;
  }
}

export function clearLastActiveRoutingId() {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(KEYS.lastActiveRouting);
  } catch {
    /* ignore */
  }
}

/* ───── Workflow sessions ───── */
export function getWorkflowSessions(): WorkflowSession[] {
  return read<WorkflowSession[]>(KEYS.workflow, []);
}

export function saveWorkflowSession(s: WorkflowSession) {
  const all = getWorkflowSessions();
  const idx = all.findIndex((x) => x.id === s.id);
  if (idx >= 0) all[idx] = s;
  else all.unshift(s);
  write(KEYS.workflow, all.slice(0, 50));
}

export function getWorkflowSessionForRouting(
  routingId: string
): WorkflowSession | undefined {
  return getWorkflowSessions().find((s) => s.routingId === routingId);
}

/* ───── Memory bank ───── */
export function getMemoryBank(): MemoryBank {
  return read<MemoryBank>(KEYS.memory, MEMORY_SEED);
}

export function saveMemoryBank(m: MemoryBank) {
  write(KEYS.memory, m);
}

export function resetMemoryBank() {
  write(KEYS.memory, MEMORY_SEED);
}
