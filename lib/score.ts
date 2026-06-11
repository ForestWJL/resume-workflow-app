// lib/score.ts
// Worth-applying score + functional/domain fit + gap analysis + explainability.
//
// The worth score blends:
//   - winning-track saturation (how strongly the JD matches the best track)
//   - confidence ratio (how unambiguously this track wins)
//   - minus seniority penalty if the JD implies seniority beyond candidate's proven level
//
// This module also:
//   - resolves informational variants (e.g. AC_DEMAND → replenishment vs forecasting)
//   - builds a plain-English reasoning summary
//   - reports the runner-up track and gap
//   - classifies whether the winner is domain-led, function-led, or balanced
import { buildPrompt } from "./buildPrompt";
import {
  classifyJD, 
  guessJDCompany,
  guessJDTitle,
  normalise,
  type ClinicalSupplyGuardDecision,
  type SupportShapeDecision,
} from "./classify";
import { TRACKS, type TrackId } from "@/config/tracks";
import {
  SCORING,
  recommendationWithContext,
  type RecommendationDecision,
  type Recommendation,
} from "@/config/scoring";
import { resolvePromptMode } from "./prompt-routing";
import { MEMORY_SEED } from "@/config/memorySeed";
import { formatScore, nowIso, shortId, truncate } from "./utils";
import type {
  RoutingResult,
  MemoryBank,
  ScoreBreakdown,
  LeadType,
  TrackProfileBoostDecision,
} from "./types";

interface ScoreInput {
  jdText: string;
  memoryBank?: MemoryBank; // if supplied, used for gap analysis
}

export function scoreJD({ jdText, memoryBank }: ScoreInput): RoutingResult {
  const {
    winner,
    breakdown,
    confidence,
    confidenceRatio,
    supportShape,
    clinicalSupplyGuard,
    trackProfileBoosts,
    operationsExecutionOverride,
    trackDOwnership,
    analystTitleGuard,
  } = classifyJD(jdText);
  const winnerTrack = TRACKS[winner.trackId];
  const jd = normalise(jdText);

  // 1) Soft saturation: rawScore / (rawScore + k). Asymptotes to 1 without
  //    reaching it — very keyword-rich JDs land in the mid-70s to 80s, not 100.
  const saturation =
    winner.rawScore /
    (winner.rawScore + SCORING.softSaturation.rawScoreK);

  // 2) Confidence factor (0..1)
  const confidenceFactor = Math.min(confidenceRatio / 0.6, 1);

  // 3) Base 0..100
  let worth = (saturation * 0.7 + confidenceFactor * 0.3) * 100;

  // 4) Seniority penalty
  const seniorityHit = SCORING.seniorityKeywords.some((k) =>
    jd.includes(k.toLowerCase())
  );
  if (seniorityHit) worth -= SCORING.seniorityPenalty;

  const functionalFit = formatScore(
    (winner.functional /
      (winner.functional + SCORING.softSaturation.functionalK)) *
      100 *
      SCORING.fitCeiling
  );

  const domainFit = formatScore(
    (winner.domain / (winner.domain + SCORING.softSaturation.domainK)) *
      100 *
      SCORING.fitCeiling
  );

  if (functionalFit < 30) {
    worth *= 0.7;
  } else if (functionalFit < 50) {
    worth *= 0.85;
  }

  if (domainFit > 60 && functionalFit >= 30 && functionalFit < 50) {
    worth *= 1.1;
  }

  const worthApplyingScore = formatScore(worth);

  const runnerUpBreakdown = breakdown[1];
  const runnerUp = runnerUpBreakdown
    ? {
        trackId: runnerUpBreakdown.trackId,
        rawScore: round2(runnerUpBreakdown.rawScore),
        gap: round2(winner.rawScore - runnerUpBreakdown.rawScore),
      }
    : undefined;

  const recDecision = recommendationWithContext({
    baseWorth: worthApplyingScore,
    functionalFit,
    domainFit,
    confidence,
    runnerUpGap: runnerUp?.gap,
    thinEvidencePenaltyApplied: winner.thinEvidencePenaltyApplied ?? false,
  });

  const uiDecision = uiFromRecDecision(recDecision, functionalFit);
  const recommendation = recDecision.recommendation;
  const promptMode = resolvePromptMode(recommendation);
  const generatedPrompt = buildPrompt(winner.trackId, promptMode, jdText);

  // Context-aware recommendation bands (Strong Apply / Apply / Stretch / Skip)
  // plus transferable / borderline flags from `recommendationWithContext`.

  // Gap analysis
  const mem = memoryBank ?? MEMORY_SEED;
  const memoryCorpus = buildMemoryCorpus(mem);

  const positioningGaps = Array.from(
    new Set(
      [
        ...winnerTrack.functionalSignals,
        ...winnerTrack.toolSignals,
      ].filter((k) => jd.includes(k.toLowerCase()))
    )
  ).slice(0, 10);

  const realGaps = positioningGaps
    .filter((kw) => !memoryCorpus.includes(kw.toLowerCase()))
    .slice(0, 8);

    const topAtsKeywords = Array.from(
      new Set([
        ...winner.matchedKeywords.slice(0, 12),
      ])
    ).slice(0, 12);

  // Variant resolution (informational only — does NOT change recommendation)
  const variant = resolveVariant(jd, winner.trackId);

  // Lead type (domain-led / function-led / balanced) from winner breakdown
  const leadType = computeLeadType(winner);

  // Top matched signals per class (surfaced in the "Why this track won" card).
  //
  // Ambiguous title phrases get their own column so the UI can show them as
  // titles rather than leaking them into "Functional signals" — the classifier
  // internally scored them at functional weight, but they are semantically
  // title-class matches and should be displayed that way.
  const ambiguousTitleSet = new Set(winner.ambiguousTitleHits ?? []);
  const topMatchedSignals = {
    title: (winner.matchedByClass?.title ?? []).slice(0, 6),
    ambiguousTitle: (winner.ambiguousTitleHits ?? []).slice(0, 6),
    domain: (winner.matchedByClass?.domain ?? []).slice(0, 6),
    functional: (winner.matchedByClass?.functional ?? [])
      .filter((kw) => !ambiguousTitleSet.has(kw))
      .slice(0, 6),
    tool: (winner.matchedByClass?.tool ?? []).slice(0, 6),
  };

  const reasoningSummary = buildReasoningSummary({
    winner,
    winnerTrackName: winnerTrack.name,
    confidence,
    confidenceRatio,
    runnerUp,
    leadType,
    variant,
    topMatchedSignals,
    decision: recDecision,
    functionalFit,
    domainFit,
    supportShape,
    clinicalSupplyGuard,
    trackProfileBoosts,
    operationsExecutionOverride,
    trackDOwnership,
    analystTitleGuard,
  });

  const suggestedNextStep = buildNextStep(
    recommendation,
    winnerTrack.name,
    confidence
  );

  const titleForTag = guessJDTitle(jdText);
  const companyForTag = guessJDCompany(jdText, titleForTag);
  const trackerTag = `[${winner.trackId}${
    variant ? ` · ${variant.name}` : ""
  }] ${truncate(titleForTag, 60)} — ${recommendation}`;

  return {
    id: shortId(),
    createdAt: nowIso(),
    jdTitleGuess: titleForTag,
    jdCompanyGuess: companyForTag,
    jdText,
    selectedTrack: winner.trackId,
    confidence,
    confidenceRatio,
    worthApplyingScore,
    recommendation,
    uiDecision,
    promptMode,
    generatedPrompt,
    functionalFit: Math.min(functionalFit, 100),
    domainFit: Math.min(domainFit, 100),
    decisionLabel: uiDecision.label,
    decisionColor: uiDecision.color,
    decisionReason: uiDecision.reason,
    allTrackScores: breakdown,
    matchedKeywords: winner.matchedKeywords,
    realGaps,
    positioningGaps,
    topAtsKeywords,
    suggestedNextStep,
    trackerTag,
    seniorityPenaltyApplied: seniorityHit,
    // Explainability fields
    variantId: variant?.id,
    variantName: variant?.name,
    reasoningSummary,
    runnerUp,
    leadType,
    topMatchedSignals,
    // Rescue-rule outputs
    transferable: recDecision.transferable,
    borderline: recDecision.borderline,
    promotedFrom: recDecision.promotedFrom,
    rescueReason: recDecision.rescueReason,
    // Support-shape detector output
    supportShape,
    trackProfileBoosts,
    // Rules 1–6 classifier upgrade
    operationsExecutionOverride,
    trackDOwnership,
    analystTitleGuard,
  };
}

/* ───── helpers ───── */

function buildMemoryCorpus(mem: MemoryBank): string {
  return [
    ...mem.experienceFacts.map((f) => `${f.company} ${f.fact}`),
    ...mem.projectFacts.map(
      (p) => `${p.name} ${p.status} ${p.tools} ${p.summary}`
    ),
    ...mem.summaryWordings,
    ...mem.bulletWordings,
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Variant resolution. Informational only.
 *
 * Count how many of each variant's strongSignals appear in the JD. Pick the
 * highest. On a tie (or zero matches across all variants) return a "mixed"
 * pseudo-variant so the UI can still display a label.
 */
function resolveVariant(
  jd: string,
  trackId: TrackId
): { id: string; name: string } | undefined {
  const track = TRACKS[trackId];
  const variants = track.variants;
  if (!variants || variants.length === 0) return undefined;

  const counts = variants.map((v) => {
    let hits = 0;
    for (const kw of v.strongSignals) {
      if (jd.includes(kw.toLowerCase())) hits++;
    }
    return { v, hits };
  });

  const best = counts.reduce((a, b) => (b.hits > a.hits ? b : a));
  const tied = counts.filter((c) => c.hits === best.hits).length > 1;

  if (best.hits === 0 || tied) {
    return { id: `${trackId}-mixed`, name: `${trackId} — mixed variant` };
  }
  return { id: best.v.id, name: best.v.name };
}

function computeLeadType(winner: ScoreBreakdown): LeadType {
  const f = winner.functional;
  const d = winner.domain;
  if (f === 0 && d === 0) return "balanced";
  if (f > d * 1.2) return "function-led";
  if (d > f * 1.2) return "domain-led";
  return "balanced";
}

function buildReasoningSummary(args: {
  winner: ScoreBreakdown;
  winnerTrackName: string;
  confidence: RoutingResult["confidence"];
  confidenceRatio: number;
  runnerUp?: RoutingResult["runnerUp"];
  leadType: LeadType;
  variant?: { id: string; name: string };
  topMatchedSignals: NonNullable<RoutingResult["topMatchedSignals"]>;
  decision: RecommendationDecision;
  functionalFit: number;
  domainFit: number;
  supportShape: SupportShapeDecision;
  clinicalSupplyGuard: ClinicalSupplyGuardDecision;
  trackProfileBoosts: TrackProfileBoostDecision;
  operationsExecutionOverride: import("./types").OperationsExecutionOverrideDecision;
  trackDOwnership: import("./types").TrackDOwnershipDecision;
  analystTitleGuard: import("./types").AnalystTitleGuardDecision;
}): string {
  const {
    winner,
    winnerTrackName,
    confidence,
    confidenceRatio,
    runnerUp,
    leadType,
    variant,
    topMatchedSignals,
    decision,
    functionalFit,
    domainFit,
    supportShape,
    clinicalSupplyGuard,
    trackProfileBoosts,
    operationsExecutionOverride,
    trackDOwnership,
    analystTitleGuard,
  } = args;

  // Pick the top 3 signals that most strongly influenced the decision,
  // preferring the class that led (domain or functional) before falling back.
  const pools: string[] = [];
  if (leadType === "domain-led") {
    pools.push(
      ...topMatchedSignals.domain,
      ...topMatchedSignals.functional,
      ...topMatchedSignals.title,
      ...topMatchedSignals.tool
    );
  } else if (leadType === "function-led") {
    pools.push(
      ...topMatchedSignals.functional,
      ...topMatchedSignals.domain,
      ...topMatchedSignals.title,
      ...topMatchedSignals.tool
    );
  } else {
    pools.push(
      ...topMatchedSignals.domain,
      ...topMatchedSignals.functional,
      ...topMatchedSignals.title,
      ...topMatchedSignals.tool
    );
  }
  const topThree = Array.from(new Set(pools)).slice(0, 3);

  const parts: string[] = [];
  const leadPhrase =
    leadType === "domain-led"
      ? "domain-led signals"
      : leadType === "function-led"
        ? "functional-verb signals"
        : "balanced domain + functional signals";

  parts.push(
    `${winner.trackId} (${winnerTrackName}) won on ${leadPhrase}` +
      (topThree.length
        ? ` — top matches: ${topThree.join(", ")}.`
        : ".")
  );

  if (variant) {
    parts.push(`Variant: ${variant.name}.`);
  }

  parts.push(
    `Confidence: ${confidence} (${Math.round(confidenceRatio * 100)}%).`
  );

  if (runnerUp) {
    parts.push(
      `Runner-up ${runnerUp.trackId} trailed by ${runnerUp.gap} pts.`
    );
  }

  if (winner.thinEvidencePenaltyApplied) {
    parts.push(
      `Thin-evidence guard halved the raw score — the title matched but supporting signals were absent. Rescue promotion is disabled.`
    );
  }

  if (winner.ambiguousTitleHits && winner.ambiguousTitleHits.length > 0) {
    const label =
      winner.ambiguousTitleHits.length === 1
        ? "Ambiguous title hit"
        : "Ambiguous title hits";
    parts.push(
      `${label}: ${winner.ambiguousTitleHits.join(
        ", "
      )} (scored at functional weight, not title weight).`
    );
  }

  if (
    trackProfileBoosts.regulatedSupplyBoostApplied ||
    trackProfileBoosts.procurementBoostApplied
  ) {
    const bits: string[] = [];
    if (trackProfileBoosts.regulatedSupplyBoostApplied) {
      bits.push(
        `Regulated-supply profile signal (${trackProfileBoosts.regulatedSupplyBuckets} theme groups) — A_REGULATED raw score ×1.28 before ordering tracks.`
      );
    }
    if (trackProfileBoosts.procurementBoostApplied) {
      bits.push(
        `Procurement / sourcing profile signal (${trackProfileBoosts.procurementBuckets} theme groups) — CB_BUYER raw score ×1.22 before ordering tracks.`
      );
    }
    parts.push(bits.join(" "));
  }

  // Support-shape narration.
  if (supportShape.active) {
    const adjustments: string[] = [];
    const pen = SCORING.supportShape.trackAPenaltyMultiplier;
    const boost = SCORING.supportShape.trackBBoostMultiplier;
    if (supportShape.trackAPenaltyApplied) {
      adjustments.push(`A_PMC raw score ×${pen}`);
    }
    if (supportShape.trackBBoostApplied) {
      adjustments.push(`CB_BUYER raw score ×${boost}`);
    }
    const safeguards: string[] = [];
    if (supportShape.suppressedByFullWeightATitle) {
      safeguards.push("full-weight A_PMC title matched");
    }
    if (supportShape.suppressedByRegulatedPlanning) {
      safeguards.push("regulated-planning safeguard fired");
    }
    const base = `Support-shape role detected (density ${supportShape.density})`;
    if (adjustments.length > 0) {
      parts.push(`${base} — ${adjustments.join(", ")}.`);
    } else if (safeguards.length > 0) {
      parts.push(
        `${base} — A_PMC penalty blocked (${safeguards.join(", ")}); CB_BUYER boost ${
          supportShape.trackBBoostApplied ? "applied" : "skipped"
        }.`
      );
    } else {
      parts.push(`${base}.`);
    }
  }

  // Operations / execution-ownership override narration (Rules 2 + 4).
  if (operationsExecutionOverride.active) {
    const cfg = SCORING.operationsExecutionOverride;
    const adjustments: string[] = [];
    if (operationsExecutionOverride.abHybridBoosted) {
      adjustments.push(`AB_HYBRID raw score ×${cfg.abHybridBoostMultiplier}`);
    }
    if (operationsExecutionOverride.trackAPmcPenalised) {
      adjustments.push(`A_PMC raw score ×${cfg.trackAPmcPenaltyMultiplier}`);
    }
    if (operationsExecutionOverride.trackARegulatedPenalised) {
      adjustments.push(
        `A_REGULATED raw score ×${cfg.trackARegulatedPenaltyMultiplier}`
      );
    } else if (operationsExecutionOverride.regulatedSafeguardBlockedARegulated) {
      adjustments.push(
        `A_REGULATED penalty blocked (regulated safeguard: ${operationsExecutionOverride.regulatedHits} regulated-supply hits)`
      );
    }
    parts.push(
      `Operations / coordination / execution-ownership override fired (${operationsExecutionOverride.hits} execution signals) — ${adjustments.join(
        "; "
      )}.`
    );
  }

  // D_SUPPORT ownership restriction narration (Rule 3).
  if (trackDOwnership.active && trackDOwnership.trackDPenaltyApplied) {
    const m = SCORING.trackDOwnershipRestriction.trackDPenaltyMultiplier;
    parts.push(
      `D_SUPPORT ownership restriction fired (${trackDOwnership.hits} execution-ownership signals) — D_SUPPORT raw score ×${m}. Pure analytics roles only.`
    );
  }

  // Analyst-title guard narration (Rule 5).
  if (analystTitleGuard.active && analystTitleGuard.trackDPenaltyApplied) {
    const m = SCORING.analystTitleGuard.trackDPenaltyMultiplier;
    parts.push(
      `Analyst-title guard fired (D_SUPPORT title share ${Math.round(
        analystTitleGuard.trackDTitleShare * 100
      )}% with competing functional ${analystTitleGuard.bestCompetingFunctional}) — D_SUPPORT raw score ×${m}.`
    );
  }

  // Clinical-supply D_SUPPORT guard narration — only when D_SUPPORT raw score was scaled.
  if (clinicalSupplyGuard.active && clinicalSupplyGuard.trackDPenaltyApplied) {
    parts.push(
      `Clinical-supply guard fired (${clinicalSupplyGuard.hits} regulated-clinical signals) — D_SUPPORT raw score ×${SCORING.clinicalSupplyTrackDGuard.trackDPenaltyMultiplier} so generic analytics wording could not over-pull the classification.`
    );
  }

  // Rescue narration — only fires when a promotion actually happened.
  if (decision.promotedFrom && decision.rescueReason) {
    const reasonPhrase =
      decision.rescueReason === "transferable"
        ? `transferable-fit rescue: functional fit ${functionalFit} with weak domain fit ${domainFit} flagged this as a transferable-skills role`
        : decision.rescueReason === "borderline"
          ? `borderline-margin rescue: the runner-up track is close enough that tailoring is worthwhile`
          : `transferable + borderline rescue: strong functional fit combined with a narrow winner margin`;
    parts.push(
      `Promoted ${decision.promotedFrom} → ${decision.recommendation} (${reasonPhrase}).`
    );
  } else if (
    !winner.thinEvidencePenaltyApplied &&
    (decision.transferable || decision.borderline) &&
    !decision.promotedFrom
  ) {
    // Flags were set but no promotion was available (e.g. the visible band was
    // already Strong Apply or Apply).
    const labels: string[] = [];
    if (decision.transferable) labels.push("transferable");
    if (decision.borderline) labels.push("borderline");
    parts.push(
      `Flagged as ${labels.join(" + ")} — no promotion needed because the base band was already ${decision.recommendation}.`
    );
  }

  return parts.join(" ");
}

function buildNextStep(
  rec: RoutingResult["recommendation"],
  trackName: string,
  confidence: RoutingResult["confidence"]
): string {

  switch (rec) {

    case "Strong Apply":
      return `Open the Workflow Assistant → run full tailoring workflow for ${trackName}.`;

    case "Apply":
      return `Use targeted tailoring for ${trackName}. Refresh summary, keywords, and strongest experience bullets.`;

    case "Stretch":
      return `Treat this as a stretch application. Time-box effort and focus on transferable strengths.`;

    case "Skip":
      return `Low fit${
        confidence === "low" ? " and low confidence" : ""
      } — skip and save energy for higher-fit roles.`;

    default:
      return `Review manually.`;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function uiFromRecDecision(
  rec: RecommendationDecision,
  functionalFit: number
): { label: Recommendation; color: string; reason: string } {
  switch (rec.recommendation) {
    case "Strong Apply":
      return {
        label: "Strong Apply",
        color: "green",
        reason: "High functional match",
      };
    case "Apply": {
      const reason = rec.transferable
        ? "Strong domain, transferable skills"
        : functionalFit >= 45
          ? "Good functional base, gaps manageable"
          : "Moderate fit — proceed with targeted tailoring";
      return { label: "Apply", color: "blue", reason };
    }
    case "Stretch":
      return {
        label: "Stretch",
        color: "orange",
        reason: "Below target but still possible",
      };
    case "Skip":
      return {
        label: "Skip",
        color: "gray",
        reason: "Low functional alignment",
      };
  }
}