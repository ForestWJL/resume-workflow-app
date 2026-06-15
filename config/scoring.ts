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

  // ─── Classifier upgrade — Rules 1–6 (function-priority classification) ──────
  // These blocks layer ON TOP of the keyword scorer. They never rewrite the
  // per-track keyword lists in tracks.ts — they only adjust raw scores after
  // base scoring so coordination / execution-ownership roles route correctly
  // and analyst-titled planning roles don't get mis-sent to D_SUPPORT.
  //
  // Rule 1 — Function priority: function weight (4) already exceeds title (3),
  //   domain (3), tool (1) in `weights` above. No additional knob needed.
  // Rule 6 — Final priority order: function > ownership-level (title + role-
  //   shape) > environment (domain) > tools. The weight ordering above + the
  //   operationsExecutionOverride / trackDOwnershipRestriction / analystTitleGuard
  //   blocks below enforce this in practice.

  // Rule 2 — Operations / Coordination / Execution Ownership override.
  // When a JD shows real execution-ownership signals (owns execution, vendor
  // follow-up, shipment coordination, multi-workstream coordination, issue
  // escalation / resolution), the role belongs to AB_HYBRID — even if inventory
  // / warehouse / stock / ERP keywords are present. Without this, A_PMC pulls
  // wins purely from environment keywords.
  //
  // The regulatedSafeguard preserves the earlier Almac fix: if the JD is
  // genuinely a regulated-clinical-supply role (≥ regulatedSafeguardThreshold
  // hits in supportShape.regulatedPlanningSignals), A_REGULATED is NOT
  // penalised — the role is regulated execution, not generic execution.
  operationsExecutionOverride: {
    executionOwnershipSignals: [
      "owns execution",
      "own execution",
      "owns the execution",
      "execution ownership",
      "runs independently",
      "run independently",
      "operate independently",
      "operates independently",
      "manages multiple workstreams",
      "manage multiple workstreams",
      "multiple workstreams",
      "multi workstream",
      "multi-workstream",
      "vendor follow-up",
      "vendor follow up",
      "vendor following up",
      "supplier follow-up",
      "supplier follow up",
      "shipment coordination",
      "coordinate shipments",
      "coordinating shipments",
      "documentation handling",
      "handle documentation",
      "handling documentation",
      "issue escalation",
      "escalate issues",
      "escalating issues",
      "escalation and resolution",
      "issue resolution",
      "resolve issues",
      "stakeholder coordination",
      "cross-functional coordination",
      "cross functional coordination",
    ],
    // This many distinct execution-ownership phrases hit (per-phrase cap 3
    // shared with the keyword scorer) → override is "active".
    thresholdHits: 3,
    // Multipliers when override is active and the relevant safeguard does NOT block.
    abHybridBoostMultiplier: 1.5,
    trackAPmcPenaltyMultiplier: 0.55,
    trackARegulatedPenaltyMultiplier: 0.7,
    // Safeguard for Rule 4: when the JD has ≥ this many hits in
    // supportShape.regulatedPlanningSignals (the curated regulated/clinical
    // supply phrase list — including GMP, clinical trial supplies, drug
    // product, FEFO, batch release, etc.), the override does NOT penalise
    // A_REGULATED. The Almac JD scores 10+ hits here and stays regulated.
    regulatedSafeguardThreshold: 3,
  },

  // Rule 3 — D_SUPPORT can only win when the role is genuinely
  // reporting / analytics — no operations ownership, no coordination
  // ownership, no execution responsibility. When execution-ownership
  // signals appear (same list as Rule 2) above this threshold, soft-
  // penalise D_SUPPORT regardless of how many "reports / dashboard" keywords
  // the JD also contains. Lower threshold than Rule 2 because this is a
  // restriction, not a redirect.
  trackDOwnershipRestriction: {
    // Uses operationsExecutionOverride.executionOwnershipSignals.
    thresholdHits: 2,
    trackDPenaltyMultiplier: 0.5,
  },

  // Rule 5 — Analyst title handling. D_SUPPORT.titleSignals includes the
  // bare token "analyst", which can pull title hits from JDs like "Supply
  // Chain Analyst — Planning". When D_SUPPORT's raw score is dominated by
  // title contribution AND any other track has a meaningful functional
  // score, soft-penalise D_SUPPORT so the function-led track wins.
  analystTitleGuard: {
    titleShareThreshold: 0.55, // D_SUPPORT title share of its own raw score > 55%
    competingFunctionalThreshold: 6, // some other track has functional ≥ 6
    trackDPenaltyMultiplier: 0.55,
  },

  // ─── Transformation Override (Track E) ──────────────────────────────────
  // Track E — Supply Chain Business Analyst (AI & Digital Transformation) —
  // sits BETWEEN A_PMC / AB_HYBRID and D_SUPPORT. The hard call this override
  // adjudicates is:
  //
  //   - Primarily reporting / dashboards / SQL / Power BI / KPI                 → D_SUPPORT wins
  //   - Business ownership / AI adoption / workflow redesign / transformation   → Track E wins
  //
  // Active rule:
  //   When transformation-signal hits ≥ thresholdHits AND pure-analytics hits
  //   are below pureAnalyticsSafeguardThreshold, boost Track E, soft-penalise
  //   D_SUPPORT, and lightly soften A_PMC / A_REGULATED (they may still win
  //   when their own signals dominate).
  //
  // Safeguard rule:
  //   When pure-analytics hits ≥ pureAnalyticsSafeguardThreshold, the override
  //   does NOT fire — D_SUPPORT keeps its raw score and wins on pure-analytics
  //   JDs, even if some transformation language appears in passing.
  //
  // Combined with the existing Rule 1–6 overrides this means:
  //   regulated supply (Almac-shape) → A_REGULATED still wins (regulated safeguard)
  //   pure planning ownership        → A_PMC still wins (full-weight title safeguard)
  //   execution coordination         → AB_HYBRID still wins (ops-execution override)
  //   pure analytics                 → D_SUPPORT still wins (pure-analytics safeguard)
  //   SC + AI + transformation       → Track E wins (this block)
  transformationOverride: {
    transformationSignals: [
      // Domain
      "digital transformation",
      "supply chain transformation",
      "operations excellence",
      "operational excellence",
      "continuous improvement",
      "process improvement",
      "process optimisation",
      "process optimization",
      "business process re-engineering",
      "business process reengineering",
      "change management",
      "operational visibility",
      "decision support",
      "cross-functional transformation",
      "cross functional transformation",
      "business ownership",
      "stakeholder management",
      "ai adoption",
      "ai enablement",
      "digital adoption",
      "workflow automation",
      "workflow redesign",
      "workflow design",
      "process redesign",
      // Functional verbs
      "root cause analysis",
      "stakeholder workshops",
      "stakeholder engagement",
      "use case definition",
      "process mapping",
      "value stream mapping",
      "transformation roadmap",
      "transformation initiative",
      "kaizen",
      "lean six sigma",
      "ai-assisted",
      "ai assisted",
      "ai-driven",
      "ai driven",
      "ai-enabled",
      "ai enabled",
      "operating model",
      "process governance",
      "translate business requirements",
      "translate operations",
      // Titles
      "supply chain business analyst",
      "digital supply chain analyst",
      "supply chain transformation analyst",
      "ai enablement specialist",
      "operations excellence analyst",
      "process improvement analyst",
      "transformation analyst",
      "business transformation analyst",
    ],
    // Pure-analytics signals — when these dominate, D_SUPPORT keeps the win
    // even if some transformation language is present. Reuses D_SUPPORT's
    // tool stack plus the bare "data analyst" / "reporting analyst" titles.
    pureAnalyticsSignals: [
      "kpi reporting",
      "kpi dashboard",
      "kpi dashboards",
      "kpi tracking",
      "dashboard development",
      "dashboards",
      "power bi",
      "tableau",
      "sql",
      "t-sql",
      "data analyst",
      "reporting analyst",
      "bi analyst",
      "business intelligence analyst",
      "data validation",
      "data visualisation",
      "data visualization",
      "automated reports",
      "report writing",
    ],
    thresholdHits: 3, // ≥3 distinct transformation phrases → override is active
    pureAnalyticsSafeguardThreshold: 4, // ≥4 distinct pure-analytics phrases → D_SUPPORT keeps the win
    trackEBoostMultiplier: 1.4,
    trackDPenaltyMultiplier: 0.7,
    trackAPmcPenaltyMultiplier: 0.9, // mild — A_PMC may still win on planning-led roles
    trackARegulatedPenaltyMultiplier: 0.9, // mild
    // Inherits the existing regulated-safeguard threshold so A_REGULATED is
    // never penalised when the JD is genuinely regulated clinical supply.
    regulatedSafeguardThreshold: 3,
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