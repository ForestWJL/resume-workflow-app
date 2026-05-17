// lib/types.ts
import type { TrackId } from "@/config/tracks";
import type { Recommendation, RescueReason } from "@/config/scoring";
import type { PromptMode } from "./prompt-routing";

export type Confidence = "high" | "medium" | "low";

export interface ScoreBreakdown {
  trackId: TrackId;
  rawScore: number;
  title: number;
  domain: number;
  functional: number;
  tool: number;
  matchedKeywords: string[];
  // New (optional for backward-compat with older LocalStorage entries):
  matchedByClass?: {
    title: string[];
    domain: string[];
    functional: string[];
    tool: string[];
  };
  // Ambiguous title phrases that matched but were scored at functional weight
  // instead of title weight (e.g. "supply chain executive").
  ambiguousTitleHits?: string[];
  // True when the thin-evidence guard halved this track's raw score.
  thinEvidencePenaltyApplied?: boolean;
  // True when the support-shape adjustment modified this track's raw score
  // (Track A penalty or Track B boost). Used for explainability on the router.
  supportShapeAdjustmentApplied?: boolean;
  // True when the clinical-supply Track D guard soft-penalised this track
  // (only ever set on Track D). Used for explainability.
  clinicalSupplyGuardApplied?: boolean;
}

export type LeadType = "domain-led" | "function-led" | "balanced";

export interface RoutingResult {
  promptMode: PromptMode;
  generatedPrompt?: string;
  id: string; // stable id used by storage
  createdAt: string;
  jdTitleGuess: string;
  // Extracted from the JD header independently from the title. Never
  // concatenated with the title. Optional for backward-compat with older
  // LocalStorage entries. Empty string ("") when no company could be inferred.
  jdCompanyGuess?: string;
  jdText: string;
  selectedTrack: TrackId;
  confidence: Confidence;
  confidenceRatio: number; // 0..1 — winning share of total
  worthApplyingScore: number; // 0..100
  recommendation: Recommendation;
  functionalFit: number; // 0..100
  domainFit: number; // 0..100
  allTrackScores: ScoreBreakdown[];
  matchedKeywords: string[];
  realGaps: string[]; // JD keywords likely not in current experience
  positioningGaps: string[]; // JD keywords present but not currently emphasised
  topAtsKeywords: string[];
  suggestedNextStep: string;
  trackerTag: string;
  seniorityPenaltyApplied: boolean;
  // New (optional for backward-compat with older LocalStorage entries):
  // Informational variant label (e.g. Track C → Replenishment / Forecasting / Mixed).
  // Does NOT change recommendation, file stack, or prompt selection.
  variantId?: string;
  variantName?: string;
  // Plain-English explanation of why this track won.
  reasoningSummary?: string;
  // Runner-up track + raw-point gap for the explainability card.
  runnerUp?: {
    trackId: TrackId;
    rawScore: number;
    gap: number;
  };
  // Whether the JD leaned more on domain language or on functional/verb language.
  leadType?: LeadType;
  // Top matched signals per class, surfaced in the "Why this track won" card.
  // `ambiguousTitle` is shown as a separate column so ambiguous-title phrases
  // (e.g. "supply chain analyst") are not confused with real functional skills
  // — they were scored at functional weight but are semantically titles.
  topMatchedSignals?: {
    title: string[];
    ambiguousTitle?: string[];
    domain: string[];
    functional: string[];
    tool: string[];
  };
  // Rescue-rule outputs (optional, backward-compat for older LocalStorage entries).
  // Semantic flags: true when the role fits the pattern, even if no promotion fired.
  transferable?: boolean;
  borderline?: boolean;
  // Set only when a rescue rule actually promoted the recommendation.
  promotedFrom?: Recommendation; // original recommendation before the rescue
  rescueReason?: RescueReason; // which rule(s) fired
  // Role-shape detector output (optional, backward-compat for older LocalStorage entries).
  // Active when support-verb density crossed the threshold; penalty/boost reflect
  // whether each adjustment was actually applied (safeguards may block the A penalty).
  supportShape?: {
    active: boolean;
    density: number;
    trackAPenaltyApplied: boolean;
    trackBBoostApplied: boolean;
    suppressedByFullWeightATitle: boolean;
    suppressedByRegulatedPlanning: boolean;
    matchedVerbs: string[];
  };
}

export interface WorkflowSession {
  id: string;
  createdAt: string;
  routingId: string;
  confirmedTrack: TrackId;
  trackerStatus:
    | "Routed"
    | "Round 1 Drafted"
    | "Round 2 Refined"
    | "Round 3 QA"
    | "Submitted"
    | "Passed"
    | "Rejected";
  notes: string;
}

export interface MemoryExperienceFact {
  company: string;
  fact: string;
  tags: Array<TrackId>;
  // Whether this fact is verified and safe to put on a resume without caveats.
  // Optional for backward-compat with older LocalStorage entries; treat missing
  // as verified = true in UI so existing seeded data is not demoted.
  verified?: boolean;
}

export interface MemoryProjectFact {
  name: string;
  status: string;
  tools: string;
  summary: string;
  tags: Array<TrackId>;
  verified?: boolean;
}

export interface MemoryBank {
  experienceFacts: MemoryExperienceFact[];
  projectFacts: MemoryProjectFact[];
  summaryWordings: string[];
  bulletWordings: string[];
  metricsToVerify: string[];
  doNotSaveYet: string[];
  trackNotes: Record<TrackId, string>;
}
