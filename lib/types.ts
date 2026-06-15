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
  // (A_PMC penalty or CB_BUYER boost). Used for explainability on the router.
  supportShapeAdjustmentApplied?: boolean;
  // True when the clinical-supply D_SUPPORT guard soft-penalised this track
  // (only ever set on D_SUPPORT). Used for explainability.
  clinicalSupplyGuardApplied?: boolean;
  // True when the operations / coordination / execution-ownership override
  // (Rule 2) adjusted this track's raw score — AB_HYBRID boost, or A_PMC /
  // A_REGULATED penalty (Rule 4).
  operationsExecutionOverrideApplied?: boolean;
  // True when the D_SUPPORT ownership restriction (Rule 3) penalised D_SUPPORT.
  trackDOwnershipRestrictionApplied?: boolean;
  // True when the analyst-title guard (Rule 5) penalised D_SUPPORT.
  analystTitleGuardApplied?: boolean;
  // True when the Transformation Override (Track E) adjusted this track's
  // raw score — E_TRANSFORMATION boost, or D_SUPPORT / A_PMC / A_REGULATED
  // penalty.
  transformationOverrideApplied?: boolean;
}

/** Operations / coordination / execution-ownership override (Rules 1, 2, 4). */
export interface OperationsExecutionOverrideDecision {
  active: boolean;
  hits: number;
  matchedSignals: string[];
  regulatedHits: number;
  regulatedSafeguardBlockedARegulated: boolean;
  abHybridBoosted: boolean;
  trackAPmcPenalised: boolean;
  trackARegulatedPenalised: boolean;
}

/** D_SUPPORT ownership restriction (Rule 3). */
export interface TrackDOwnershipDecision {
  active: boolean;
  hits: number;
  trackDPenaltyApplied: boolean;
}

/** Analyst-title guard for D_SUPPORT (Rule 5). */
export interface AnalystTitleGuardDecision {
  active: boolean;
  trackDTitleShare: number;
  bestCompetingFunctional: number;
  trackDPenaltyApplied: boolean;
}

/** Transformation Override (Track E vs D_SUPPORT / SC anchors). */
export interface TransformationOverrideDecision {
  active: boolean;
  transformationHits: number;
  pureAnalyticsHits: number;
  matchedTransformationSignals: string[];
  matchedPureAnalyticsSignals: string[];
  // True when pure-analytics signals dominated and Track E was deliberately
  // NOT boosted — D_SUPPORT keeps the win.
  pureAnalyticsSafeguardBlockedOverride: boolean;
  // True when the regulated-clinical safeguard blocks the A_REGULATED penalty
  // (Almac-shape regulated supply still wins despite some transformation language).
  regulatedSafeguardBlockedARegulated: boolean;
  regulatedHits: number;
  trackEBoosted: boolean;
  trackDPenalised: boolean;
  trackAPmcPenalised: boolean;
  trackARegulatedPenalised: boolean;
}

/** JD profile boosts applied before support-shape / D_SUPPORT guard (classifier). */
export interface TrackProfileBoostDecision {
  regulatedSupplyBuckets: number;
  regulatedSupplyBoostApplied: boolean;
  procurementBuckets: number;
  procurementBoostApplied: boolean;
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
  // Informational variant label (e.g. AC_DEMAND → replenishment vs forecasting / mixed).
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
  // whether each adjustment was actually applied (safeguards may block the A_PMC penalty).
  supportShape?: {
    active: boolean;
    density: number;
    trackAPenaltyApplied: boolean;
    trackBBoostApplied: boolean;
    suppressedByFullWeightATitle: boolean;
    suppressedByRegulatedPlanning: boolean;
    matchedVerbs: string[];
  };
  /** Regulated / procurement profile boosts (optional for older saved routings). */
  trackProfileBoosts?: TrackProfileBoostDecision;
  /** Operations / coordination / execution-ownership override (Rules 1, 2, 4). */
  operationsExecutionOverride?: OperationsExecutionOverrideDecision;
  /** D_SUPPORT ownership restriction (Rule 3). */
  trackDOwnership?: TrackDOwnershipDecision;
  /** Analyst-title guard for D_SUPPORT (Rule 5). */
  analystTitleGuard?: AnalystTitleGuardDecision;
  /** Transformation Override — adjudicates Track E vs D_SUPPORT / SC anchors. */
  transformationOverride?: TransformationOverrideDecision;
  /** UI row for decision chip (optional for older saved routings). */
  uiDecision?: {
    label: Recommendation;
    color: string;
    reason: string;
  };
  decisionLabel?: Recommendation;
  decisionColor?: string;
  decisionReason?: string;
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
