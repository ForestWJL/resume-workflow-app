// config/scoring.ts
// Scoring weights, thresholds, and recommendation logic.
// Tune these to match how you personally weight roles. All tuning knobs for
// calibration live here — lib/score.ts is just the mechanics.

import type { Confidence } from "@/lib/types";

export const SCORING = {
  // keyword weight by signal class
  weights: {
    title: 3,
    domain: 3,
    functional: 4,
    tool: 1,
  },

  // Soft saturation: score = x / (x + k). Asymptotes toward 1 but never reaches
  // it, so a "perfect" JD tops out in the mid-to-high 80s/90s, not 100.
  //   At x = k   → 50%
  //   At x = 2k  → 67%
  //   At x = 4k  → 80%
  softSaturation: {
    rawScoreK: 22, // worth-score base saturation constant
    functionalK: 8, // functional fit base
    domainK: 6, // domain fit base
  },
  // Final multiplier on functional / domain fits so even a "perfect" match
  // tops out at ~97, not 100. Keeps the UI honest.
  fitCeiling: 0.97,

  // Thin-evidence guard (used by lib/classify.ts): if a track's score came
  // almost entirely from title hits with no supporting signals, halve the raw
  // score. The routing code also refuses to apply any rescue promotion to a
  // winner whose thin-evidence guard fired — so a title-only match can never
  // be rescued up into a higher recommendation band.
  thinEvidence: {
    titleShareThreshold: 0.7, // title accounts for >70% of rawScore
    requireSupportingClasses: true, // AND domain + functional + tool == 0
    penaltyMultiplier: 0.5, // halve rawScore when triggered
  },

  // Transferable-role rescue (future / documentation): flags when domain is
  // strong but function is mid — surfaced via `transferable` on the routing
  // result; the visible recommendation label stays within the four bands.
  transferableRule: {
    functionalFitThreshold: 45,
    lowDomainFitThreshold: 32,
  },

  // Borderline rescue (future / documentation): runner-up margin tuning.
  borderlineRule: {
    runnerUpGapThreshold: 3,
  },

  // Confidence thresholds (ratio of winning track score to total of all track scores)
  confidence: {
    high: 0.55, // winning track holds 55%+ of total matched weight
    medium: 0.4, // 40–55%
    // below 40% → low
  },

  // Worth-applying score thresholds → recommendation band


  // Role-shape detector: distinguishes planning ownership (A_PMC) from
  // buyer / procurement execution (CB_BUYER) roles by measuring support-
  // verb density in the JD. When density is high AND neither safeguard fires,
  // penalise A_PMC and boost CB_BUYER before confidence / recommendation.
  //
  // Safeguards that block the A_PMC penalty:
  //   (a) A full-weight A_PMC titleSignal matched (role ownership is explicit
  //       in the title — e.g. "Supply Chain Planner", "Distribution Planner").
  //   (b) A_PMC-side regulated-planning hit count ≥ regulatedPlanningHitThreshold
  //       in regulatedPlanningSignals (clearly regulated supply / planning
  //       even if the JD uses support language).
  //
  // CB_BUYER boost still fires even when a safeguard blocks the A_PMC penalty —
  // safeguards only block the A_PMC penalty, not the whole detector.
  supportShape: {
    // Phrase matches are case-insensitive and counted with the same per-phrase
    // cap (3) as the keyword classifier. Multi-word phrases count as one hit.
    supportVerbs: [
      "assist",
      "assists",
      "assisting",
      "assist with",
      "help maintain",
      "help track",
      "help reconcile",
      "help follow up",
      "support the",
      "supporting the",
      "support production",
      "follow up",
      "follow-up",
      "following up",
      "reconcile",
      "reconciles",
      "reconciling",
      "reconciliation",
      "compile",
      "compiles",
      "compiling",
      "maintain records",
      "update records",
      "record-keeping",
      "record keeping",
      "record accuracy",
      "ledger",
      "month-end",
      "month end",
      "stock count",
      "stock counts",
      "cycle count",
      "cycle counts",
      "track material availability",
    ],
    // This many support-verb hits (summed across all phrases, per-phrase cap 3)
    // qualifies the JD as "support-shaped".
    densityThreshold: 8,
    // Safeguard (a): a full-weight A_PMC titleSignal fires → penalty blocked.
    suppressIfFullWeightATitle: true,
    // Safeguard (b): this many distinct regulated-planning phrases hit → penalty
    // blocked. Protects real pharma / regulated planning JDs that use support language.
    regulatedPlanningHitThreshold: 3,
    regulatedPlanningSignals: [
      "cgmp",
      "gmp",
      "gxp",
      "pharmaceutical industry",
      "pharmaceutical",
      "sops",
      "standard operating procedures",
      "validated systems",
      "fefo",
      "batch traceability",
      "mrp",
      "bom",
      "bill of materials",
      "direct materials",
      "production schedule",
      "production planning and scheduling",
      "raw material forecast",
      "raw material planning",
      "supply chain risk",
      "technology transfer",
      // Regulated clinical supply coordination (Almac-shape). Ensures the
      // support-shape safeguard blocks the A_PMC penalty on JDs that are
      // clearly regulated clinical supply even when the wording leans on
      // support-style verbs like "assist", "track", "monitor".
      "clinical trial supplies",
      "clinical trial supply",
      "clinical supplies",
      "clinical supply",
      "clinical services",
      "clinical trial material",
      "drug product",
      "drug products",
      "good manufacturing practice",
      "temperature excursions",
      "temperature excursion",
      "production jobs",
      "allocate components",
      "distribution protocols",
      "shipment tracking",
      "track shipment of samples",
      "supply chain health check",
      "supply chain health checks",
      "documentation and approvals",
      "expiry dates",
      "monitor expiry",
      "batch release",
      "batch record review",
      "batch documentation",
      "cold chain",
      "qualified person",
      "qp release",
      "gdp",
      "good distribution practice",
      "serialization",
      "quarantine",
      "deviation",
      "capa",
    ],
    // Multipliers applied to raw scores when support-shape fires and the
    // relevant safeguards do not block the adjustment.
    trackAPenaltyMultiplier: 0.88,
    trackBBoostMultiplier: 1.2,
  },

  // Clinical-supply D_SUPPORT guard: when a JD is clearly regulated clinical
  // supply coordination (Almac-shape), soft-generic analytics wording like
  // "reports", "project coordinator", "data" can over-pull D_SUPPORT. This
  // guard applies a multiplier to D_SUPPORT raw score when the clinical /
  // regulated supply signal count is high enough that analytics is unlikely
  // to be the primary track. Kept as a soft multiplier (not a hard zero) so
  // genuinely analytics-focused clinical roles can still win D_SUPPORT if
  // their own signals are strong.
  clinicalSupplyTrackDGuard: {
    // Phrases from this list that hit (case-insensitive, per-phrase cap 3)
    // count toward the regulated-clinical-supply signal total.
    regulatedClinicalSignals: [
      "clinical trial supplies",
      "clinical trial supply",
      "clinical supplies",
      "clinical supply",
      "clinical services",
      "clinical trial material",
      "drug product",
      "drug products",
      "good manufacturing practice",
      "gmp",
      "cgmp",
      "gxp",
      "temperature excursions",
      "temperature excursion",
      "cold chain",
      "production jobs",
      "allocate components",
      "distribution protocols",
      "shipment tracking",
      "track shipment of samples",
      "supply chain health check",
      "supply chain health checks",
      "documentation and approvals",
      "expiry dates",
      "monitor expiry",
      "batch traceability",
      "fefo",
      "batch release",
      "gdp",
      "good distribution practice",
      "serialization",
      "quarantine",
    ],
    regulatedHitThreshold: 3,
    trackDPenaltyMultiplier: 0.7,
  },

  // How much to penalize worth-score when the JD implies seniority the candidate hasn't held.
  seniorityKeywords: [
    "director",
    "head of",
    "vp",
    "vice president",
    "chief",
    "10+ years",
    "15+ years",
  ],
  seniorityPenalty: 12,
} as const;

export type Recommendation =
  | "Strong Apply"
  | "Apply"
  | "Stretch"
  | "Skip";

export type RescueReason =
  | "transferable"
  | "borderline"
  | "transferable + borderline";

export interface RecommendationContext {
  baseWorth: number; // 0..100 post-seniority worth score
  functionalFit: number; // 0..100
  domainFit: number; // 0..100
  confidence: Confidence;
  runnerUpGap: number | undefined;
  // Safeguard: if the winner's thin-evidence guard fired, rescue promotion
  // is disabled regardless of the other signals. A title-only match should
  // never be upgraded by transferable or borderline rules.
  thinEvidencePenaltyApplied: boolean;
}

export interface RecommendationDecision {
  recommendation: Recommendation;
  transferable: boolean; // semantic flag, true even when no promotion occurred
  borderline: boolean; // semantic flag, true even when no promotion occurred
  promotedFrom?: Recommendation; // original recommendation before rescue
  rescueReason?: RescueReason; // reason the rescue fired
}

export function recommendationWithContext(
  ctx: RecommendationContext
): RecommendationDecision {

  if (ctx.functionalFit >= 60) {
    return {
      recommendation: "Strong Apply",
      transferable: false,
      borderline: false,
    };
  }

  if (
    ctx.functionalFit >= 35 &&
    ctx.domainFit >= 60
  ) {
    return {
      recommendation: "Apply",
      transferable: true,
      borderline: false,
    };
  }

  if (ctx.functionalFit >= 45) {
    return {
      recommendation: "Apply",
      transferable: false,
      borderline: false,
    };
  }

  if (ctx.functionalFit >= 30) {
    return {
      recommendation: "Stretch",
      transferable: false,
      borderline: true,
    };
  }

  return {
    recommendation: "Skip",
    transferable: false,
    borderline: false,
  };
}