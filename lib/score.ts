// lib/score.ts
// Worth-applying score + functional/domain fit + gap analysis + explainability.
//
// The worth score blends:
//   - winning-track saturation (how strongly the JD matches the best track)
//   - confidence ratio (how unambiguously this track wins)
//   - minus seniority penalty if the JD implies seniority beyond candidate's proven level
//
// This module also:
//   - resolves informational variants (e.g. Track C → Replenishment vs Forecasting)
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
import { TRACKS, type TrackId, type TrackVariant } from "@/config/tracks";
import {
  SCORING,
  recommendationWithContext,
  type RecommendationDecision,
} from "@/config/scoring";
import { resolvePromptMode } from "./prompt-routing";
import { MEMORY_SEED } from "@/config/memorySeed";
import { formatScore, nowIso, shortId, truncate } from "./utils";
import type {
  RoutingResult,
  MemoryBank,
  ScoreBreakdown,
  LeadType,
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
// ✅ 先算 functional / domain fit
const functionalFit = formatScore(
  (winner.functional /
    (winner.functional + SCORING.softSaturation.functionalK)) *
    100 *
    SCORING.fitCeiling
);

const domainFit = formatScore(
  (winner.domain /
    (winner.domain + SCORING.softSaturation.domainK)) *
    100 *
    SCORING.fitCeiling
);

// 🔥 1. 主惩罚（只选一个）
if (functionalFit < 30) {
  worth *= 0.7; // hard fail
} else if (functionalFit < 50) {
  worth *= 0.85; // borderline
}

// 🔥 2. Domain保护（不是再砍，而是减轻误伤）
if (domainFit > 60 && functionalFit >= 30 && functionalFit < 50) {
  worth *= 1.1; // 从 1.03 → 1.1
}

// ✅ 最后才出 score
const worthApplyingScore = formatScore(worth);
const recDecision = recommendationWithContext(
  worthApplyingScore,
  functionalFit,
  domainFit
);

const uiDecision = getDecisionLabel(
  worthApplyingScore,
  functionalFit,
  domainFit
);

let recommendation = uiDecision.label;


// 🔥 NEW：让 transferable 有机会 override
if (
  recommendation === "Skip" &&
  functionalFit >= 35 &&
  domainFit >= 60
) {
  recommendation = "Apply"
}
const promptMode = resolvePromptMode(recommendation);
const generatedPrompt = buildPrompt(
  winner.trackId,
  promptMode,
  jdText
);
  // Runner-up + gap (needed both for rescue logic and the UI card)
  const runnerUpBreakdown = breakdown[1];
  const runnerUp = runnerUpBreakdown
    ? {
        trackId: runnerUpBreakdown.trackId,
        rawScore: round2(runnerUpBreakdown.rawScore),
        gap: round2(winner.rawScore - runnerUpBreakdown.rawScore),
      }
    : undefined;

  // Context-aware recommendation — applies transferable / borderline rescue
  // unless the winner's thin-evidence guard already fired (in which case
  // rescue is disabled regardless of the other signals).

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
  });

  const suggestedNextStep = buildNextStep(
    recommendation,
    winnerTrack.name,
    confidence
  );

  const titleForTag = guessJDTitle(jdText);
  const companyForTag = guessJDCompany(jdText, titleForTag);
  const trackerTag = `[Track ${winner.trackId}${
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

  const counts = variants.map((v: TrackVariant) => {
    let hits = 0;
    for (const kw of v.strongSignals) {
      if (jd.includes(kw.toLowerCase())) hits++;
    }
    return { v, hits };
  });

  const best = counts.reduce((a, b) => (b.hits > a.hits ? b : a));
  const tied = counts.filter((c) => c.hits === best.hits).length > 1;

  if (best.hits === 0 || tied) {
    return { id: `${trackId}-mixed`, name: `Track ${trackId} (mixed)` };
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
  decision: RecommendationDecision,
  functionalFit: number;
  domainFit: number;
  supportShape: SupportShapeDecision;
  clinicalSupplyGuard: ClinicalSupplyGuardDecision;
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
    `Track ${winner.trackId} (${winnerTrackName}) won on ${leadPhrase}` +
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
      `Runner-up Track ${runnerUp.trackId} trailed by ${runnerUp.gap} pts.`
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

  // Support-shape narration.
  if (supportShape.active) {
    const adjustments: string[] = [];
    if (supportShape.trackAPenaltyApplied) adjustments.push("Track A raw score ×0.7");
    if (supportShape.trackBBoostApplied) adjustments.push("Track B raw score ×1.2");
    const safeguards: string[] = [];
    if (supportShape.suppressedByFullWeightATitle)
      safeguards.push("full-weight Track A title matched");
    if (supportShape.suppressedByRegulatedPlanning)
      safeguards.push("regulated-planning safeguard fired");
    const base = `Support-shape role detected (density ${supportShape.density})`;
    if (adjustments.length > 0) {
      parts.push(`${base} — ${adjustments.join(", ")}.`);
    } else if (safeguards.length > 0) {
      parts.push(
        `${base} — Track A penalty blocked (${safeguards.join(", ")}); Track B boost ${
          supportShape.trackBBoostApplied ? "applied" : "skipped"
        }.`
      );
    } else {
      parts.push(`${base}.`);
    }
  }

  // Clinical-supply Track D guard narration — only fires when the guard
  // actually changed Track D's raw score.
  if (clinicalSupplyGuard.active && clinicalSupplyGuard.trackDPenaltyApplied) {
    parts.push(
      `Clinical-supply guard fired (${clinicalSupplyGuard.hits} regulated-clinical signals) — Track D raw score ×0.7 so generic analytics wording could not over-pull the classification.`
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
    // Flags were set but no promotion was available (e.g. base was already
    // Light Tailor or Deep Tailor). Just annotate so the user sees why the
    // Transferable / Borderline badges appeared.
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
// 👇 放在 scoreJD 函数下面（文件底部）
function getDecisionLabel(
  worth: number,
  functionalFit: number,
  domainFit: number
): { label: string; color: string; reason: string } {

  // ✅ 1. 强功能匹配（最优）
  if (functionalFit >= 60) {
    return {
      label: "Strong Apply",
      color: "green",
      reason: "High functional match"
    };
  }

    // 🔥 2. Domain 强 → 可转型（关键新增）
    if (functionalFit >= 35 && domainFit >= 60) {
      return {
        label: "Apply (Transferable)",
        color: "blue",
        reason: "Strong domain, transferable skills"
      };
    }

  // ✅ 3. 可直接投
  if (functionalFit >= 45) {
    return {
      label: "Apply",
      color: "blue",
      reason: "Good functional base, gaps manageable"
    };
  }

  // ⚠️ 4. 边缘尝试
  if (functionalFit >= 30) {
    return {
      label: "Stretch",
      color: "orange",
      reason: "Below target but still possible"
    };
  }

  // ❌ 5. 真正不匹配
  return {
    label: "Skip",
    color: "gray",
    reason: "Low functional alignment"
  };
}