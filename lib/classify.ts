import { TRACKS, type TrackConfig, type TrackId } from "../config/tracks";
import { SCORING } from "../config/scoring";
import type {
  Confidence,
  ScoreBreakdown,
  TrackProfileBoostDecision,
} from "./types";

// lib/classify.ts
// Keyword-weighted track classifier.

export function normalise(text: string) {
  return text.toLowerCase();
}

function countOccurrences(haystack: string, needle: string) {
  if (!needle) return 0;
  const n = needle.toLowerCase();
  let count = 0;
  let idx = haystack.indexOf(n);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(n, idx + n.length);
  }
  // Cap per-keyword occurrences to avoid runaway weighting from very repetitive JDs.
  return Math.min(count, 3);
}

function scoreTrack(jd: string, track: TrackConfig): ScoreBreakdown {
  const matched: string[] = [];
  const matchedByClass = {
    title: [] as string[],
    domain: [] as string[],
    functional: [] as string[],
    tool: [] as string[],
  };
  const ambiguousTitleHits: string[] = [];

  let title = 0;
  let domain = 0;
  let functional = 0;
  let tool = 0;

  const tally = (
    sigs: string[],
    weight: number,
    bucket: keyof typeof matchedByClass
  ) => {
    let acc = 0;
    for (const kw of sigs) {
      const c = countOccurrences(jd, kw);
      if (c > 0) {
        matched.push(kw);
        matchedByClass[bucket].push(kw);
        acc += c * weight;
      }
    }
    return acc;
  };

  title = tally(track.titleSignals, SCORING.weights.title, "title");

  // Ambiguous title signals → scored at *functional* weight so they can't win
  // the track on their own. They still get recorded as title-class hits for
  // visibility, but the numeric contribution goes into the functional bucket.
  if (track.ambiguousTitleSignals?.length) {
    for (const kw of track.ambiguousTitleSignals) {
      const c = countOccurrences(jd, kw);
      if (c > 0) {
        matched.push(kw);
        ambiguousTitleHits.push(kw);
        matchedByClass.functional.push(kw);
        functional += c * SCORING.weights.functional;
      }
    }
  }

  domain = tally(track.domainSignals, SCORING.weights.domain, "domain");
  functional += tally(
    track.functionalSignals,
    SCORING.weights.functional,
    "functional"
  );
  tool = tally(track.toolSignals, SCORING.weights.tool, "tool");

  let rawScore = title + domain + functional + tool;

  // Thin-evidence guard: if the winning weight came almost entirely from
  // title hits with no supporting class at all, this is probably a
  // title-only coincidence. Halve the raw score.
  let thinEvidencePenaltyApplied = false;
  const { thinEvidence } = SCORING;
  if (rawScore > 0) {
    const titleShare = title / rawScore;
    const noSupporting = domain === 0 && functional === 0 && tool === 0;
    const needsSupporting = thinEvidence.requireSupportingClasses
      ? noSupporting
      : true;
    if (titleShare >= thinEvidence.titleShareThreshold && needsSupporting) {
      rawScore = rawScore * thinEvidence.penaltyMultiplier;
      thinEvidencePenaltyApplied = true;
    }
  }
  return {
    trackId: track.id,
    rawScore,
    title,
    domain,
    functional,
    tool,
    matchedKeywords: Array.from(new Set(matched)),
    matchedByClass: {
      title: Array.from(new Set(matchedByClass.title)),
      domain: Array.from(new Set(matchedByClass.domain)),
      functional: Array.from(new Set(matchedByClass.functional)),
      tool: Array.from(new Set(matchedByClass.tool)),
    },
    ambiguousTitleHits: Array.from(new Set(ambiguousTitleHits)),
    thinEvidencePenaltyApplied,
  };
}

/* ───── Support-shape detector (role shape: planning ownership vs support) ───── */

export interface SupportShapeDecision {
  active: boolean;
  density: number;
  trackAPenaltyApplied: boolean;
  trackBBoostApplied: boolean;
  suppressedByFullWeightATitle: boolean;
  suppressedByRegulatedPlanning: boolean;
  matchedVerbs: string[];
}

function computeSupportDensity(
  jd: string
): { density: number; matchedVerbs: string[] } {
  const matchedVerbs: string[] = [];
  let density = 0;
  for (const verb of SCORING.supportShape.supportVerbs) {
    const c = countOccurrences(jd, verb);
    if (c > 0) {
      matchedVerbs.push(verb);
      density += c;
    }
  }
  return { density, matchedVerbs };
}

function countRegulatedPlanningHits(jd: string): number {
  let hits = 0;
  for (const kw of SCORING.supportShape.regulatedPlanningSignals) {
    if (countOccurrences(jd, kw) > 0) hits++;
  }
  return hits;
}

/* ───── Regulated + procurement profile boosts (migration tuning) ───── */

const REGULATED_PROFILE_GROUPS: string[][] = [
  ["gmp", "cgmp", "gxp", "good manufacturing practice", "pharmaceutical industry"],
  [
    "fefo",
    "first expired first out",
    "expiry control",
    "expiry dates",
    "monitor expiry",
  ],
  [
    "batch release",
    "batch record",
    "batch documentation",
    "batch disposition",
    "qp release",
    "qualified person",
  ],
  [
    "clinical supply",
    "clinical trial supply",
    "clinical supplies",
    "clinical trial supplies",
    "drug product",
  ],
  ["cold chain", "temperature excursion", "temperature excursions"],
  [
    "gdp",
    "good distribution practice",
    "serialization",
    "quarantine",
    "capa",
    "deviation",
  ],
];

const PROCUREMENT_PROFILE_GROUPS: string[][] = [
  [
    "rfq",
    "rfi",
    "request for quotation",
    "request for quote",
    "invitation to tender",
  ],
  ["sourcing", "procurement", "purchasing", "buyer", "category sourcing"],
  [
    "vendor",
    "supplier coordination",
    "supplier evaluation",
    "vendor evaluation",
    "vendor management",
  ],
  ["quotation", "quotations", "vendor quotation", "supplier quote", "tender", "bidding"],
];

function countProfileGroups(jd: string, groups: string[][]): number {
  let buckets = 0;
  for (const group of groups) {
    const hit = group.some((kw) => countOccurrences(jd, kw) > 0);
    if (hit) buckets++;
  }
  return buckets;
}

function applyTrackProfileBoosts(
  jd: string,
  breakdown: ScoreBreakdown[]
): TrackProfileBoostDecision {
  const regulatedSupplyBuckets = countProfileGroups(jd, REGULATED_PROFILE_GROUPS);
  const procurementBuckets = countProfileGroups(jd, PROCUREMENT_PROFILE_GROUPS);

  const ar = breakdown.find((b) => b.trackId === "A_REGULATED");
  const cb = breakdown.find((b) => b.trackId === "CB_BUYER");

  let regulatedSupplyBoostApplied = false;
  if (ar && regulatedSupplyBuckets >= 2) {
    ar.rawScore *= 1.28;
    regulatedSupplyBoostApplied = true;
  }

  let procurementBoostApplied = false;
  if (cb && procurementBuckets >= 2) {
    cb.rawScore *= 1.22;
    procurementBoostApplied = true;
  }

  return {
    regulatedSupplyBuckets,
    regulatedSupplyBoostApplied,
    procurementBuckets,
    procurementBoostApplied,
  };
}

/* ───── Clinical-supply D_SUPPORT guard ───── */

export interface ClinicalSupplyGuardDecision {
  active: boolean;
  hits: number;
  matchedSignals: string[];
  trackDPenaltyApplied: boolean;
}

function countClinicalSupplySignals(jd: string): {
  hits: number;
  matched: string[];
} {
  const matched: string[] = [];
  for (const kw of SCORING.clinicalSupplyTrackDGuard.regulatedClinicalSignals) {
    if (countOccurrences(jd, kw) > 0) matched.push(kw);
  }
  return { hits: matched.length, matched };
}

export function classifyJD(jdText: string): {
  winner: ScoreBreakdown;
  breakdown: ScoreBreakdown[];
  confidence: Confidence;
  confidenceRatio: number;
  supportShape: SupportShapeDecision;
  clinicalSupplyGuard: ClinicalSupplyGuardDecision;
  trackProfileBoosts: TrackProfileBoostDecision;
} {
  const jd = normalise(jdText);
  const breakdown: ScoreBreakdown[] = (
    Object.values(TRACKS) as TrackConfig[]
  ).map((t) => scoreTrack(jd, t));

  const trackProfileBoosts = applyTrackProfileBoosts(jd, breakdown);

  // ─── Support-shape adjustment ───────────────────────────────────────────
  // After per-track raw scores are computed but before sorting, adjust A_PMC
  // and CB_BUYER based on role shape (support vs ownership / buying execution).
  const supportShape = applySupportShapeAdjustment(jd, breakdown);

  // ─── Clinical-supply D_SUPPORT guard ──────────────────────────────────────
  // When the JD is clearly regulated clinical supply coordination, soft-
  // penalise D_SUPPORT so weak generic analytics words ("reports", "project
  // coordinator") can't drag the role into the wrong track.
  const clinicalSupplyGuard = applyClinicalSupplyTrackDGuard(jd, breakdown);

  // Sort descending by raw score
  breakdown.sort((a, b) => b.rawScore - a.rawScore);

  const winner = breakdown[0];
  const totalScore = breakdown.reduce((s, b) => s + b.rawScore, 0);

  let confidenceRatio = totalScore > 0 ? winner.rawScore / totalScore : 0;
  let confidence: Confidence = "low";

  if (winner.rawScore === 0) {
    confidence = "low";
  } else if (confidenceRatio >= SCORING.confidence.high) {
    confidence = "high";
  } else if (confidenceRatio >= SCORING.confidence.medium) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  // Tie-break: if winner is very close to runner-up (< 2 raw points), drop confidence.
  if (breakdown.length > 1) {
    const runner = breakdown[1];
    if (winner.rawScore - runner.rawScore < 2 && confidence === "high") {
      confidence = "medium";
    }
  }

  return {
    winner,
    breakdown,
    confidence,
    confidenceRatio,
    supportShape,
    clinicalSupplyGuard,
    trackProfileBoosts,
  };
}

function applyClinicalSupplyTrackDGuard(
  jd: string,
  breakdown: ScoreBreakdown[]
): ClinicalSupplyGuardDecision {
  const { clinicalSupplyTrackDGuard } = SCORING;
  const { hits, matched } = countClinicalSupplySignals(jd);
  const active = hits >= clinicalSupplyTrackDGuard.regulatedHitThreshold;

  const trackD = breakdown.find((b) => b.trackId === "D_SUPPORT");
  let trackDPenaltyApplied = false;

  if (active && trackD && trackD.rawScore > 0) {
    trackD.rawScore *= clinicalSupplyTrackDGuard.trackDPenaltyMultiplier;
    trackD.clinicalSupplyGuardApplied = true;
    trackDPenaltyApplied = true;
  }

  return {
    active,
    hits,
    matchedSignals: matched,
    trackDPenaltyApplied,
  };
}

function applySupportShapeAdjustment(
  jd: string,
  breakdown: ScoreBreakdown[]
): SupportShapeDecision {
  const { supportShape } = SCORING;
  const { density, matchedVerbs } = computeSupportDensity(jd);
  const active = density >= supportShape.densityThreshold;

  const trackA = breakdown.find((b) => b.trackId === "A_PMC");
  const trackB = breakdown.find((b) => b.trackId === "CB_BUYER");

  // Safeguard (a): did a full-weight A_PMC titleSignal fire? A_PMC's
  // `matchedByClass.title` contains only full-weight title hits (ambiguous
  // title hits go into the functional bucket), so this check is direct.
  const suppressedByFullWeightATitle =
    supportShape.suppressIfFullWeightATitle &&
    !!trackA &&
    (trackA.matchedByClass?.title?.length ?? 0) > 0;

  // Safeguard (b): regulated-planning strong-signal count ≥ threshold.
  const regulatedHits = countRegulatedPlanningHits(jd);
  const suppressedByRegulatedPlanning =
    regulatedHits >= supportShape.regulatedPlanningHitThreshold;

  const penaltyBlocked =
    suppressedByFullWeightATitle || suppressedByRegulatedPlanning;

  let trackAPenaltyApplied = false;
  let trackBBoostApplied = false;

  if (active && trackA && !penaltyBlocked) {
    trackA.rawScore *= supportShape.trackAPenaltyMultiplier;
    trackA.supportShapeAdjustmentApplied = true;
    trackAPenaltyApplied = true;
  }

  if (active && trackB) {
    trackB.rawScore *= supportShape.trackBBoostMultiplier;
    trackB.supportShapeAdjustmentApplied = true;
    trackBBoostApplied = true;
  }

  return {
    active,
    density,
    trackAPenaltyApplied,
    trackBBoostApplied,
    suppressedByFullWeightATitle,
    suppressedByRegulatedPlanning,
    matchedVerbs,
  };
}

// Conservative role-title extractor.
//
// Strategy:
//   1. Look at the first ~20 non-empty lines of the JD.
//   2. Strip "Job Title:" / "Position:" / "Role:" / "Title:" prefixes.
//   3. Skip obvious section headers ("About us", "Responsibilities", etc.).
//   4. Prefer short lines (< 80 chars) that contain a role-title keyword.
//   5. Fall back to the first non-empty line (truncated) if nothing scored.
//   6. Only return "Untitled role" when the JD text is empty.
const ROLE_TITLE_KEYWORDS = [
  "planner",
  "analyst",
  "coordinator",
  "specialist",
  "executive",
  "manager",
  "buyer",
  "procurement",
  "purchasing",
  "logistics",
  "supply chain",
  "operations",
  "officer",
  "associate",
  "lead",
  "head of",
  "director",
  "assistant",
  "scm",
  "materials",
  // Warehouse / inventory / SME role shapes (Jabil-style titles).
  "warehouse",
  "inventory",
  "subject matter expert",
  "sme",
  "expert",
  "engineer",
  "technician",
  "controller",
  "administrator",
];

const SECTION_HEADERS = [
  /^about\b/i,
  /^our\b/i,
  /^we\b/i,
  /^who\b/i,
  /^why\b/i,
  /^responsibilities\b/i,
  /^requirements\b/i,
  /^qualifications\b/i,
  /^the role\b/i,
  /^the company\b/i,
  /^job description\b/i,
  /^overview\b/i,
  /^benefits\b/i,
];

// Lines that look like pure company names — ending in a legal-entity suffix
// and containing no role-title keyword. We still allow the primary pass to
// reject them via the role-keyword check, but these patterns also gate the
// fallback path so a company header never surfaces as the guessed title.
const COMPANY_SUFFIX_PATTERNS = [
  /\bpte\.?\s*ltd\.?\s*\.?$/i,
  /\bpte\.?\s*limited\s*\.?$/i,
  /\bco\.?\s*ltd\.?\s*\.?$/i,
  /\bcompany\s+ltd\.?\s*\.?$/i,
  /\bcompany\s+limited\s*\.?$/i,
  /\bltd\.?\s*\.?$/i,
  /\bllc\.?\s*\.?$/i,
  /\binc\.?\s*\.?$/i,
  /\bcorp\.?\s*\.?$/i,
  /\bcorporation\s*\.?$/i,
  /\bgmbh\s*\.?$/i,
];

// Job-board / posting-metadata lines that are never role titles.
const METADATA_LINE_PATTERNS = [
  /^mcf\b/i,
  /\bmcf\s+reference\b/i,
  /^reference\s*[:#]/i,
  /^ref\s*[:#]/i,
  /^job\s*id\s*[:#]/i,
  /^salary\s*[:#\-]/i,
  /^remuneration\s*[:#\-]/i,
  /^location\s*[:#\-]/i,
  /^employment\s*type\s*[:#\-]/i,
  /^working\s*hours\s*[:#\-]/i,
  /^\$[\d,]/,
  /^sgd\s*[\d,]/i,
  /^s\$[\d,]/i,
  /^usd\s*[\d,]/i,
  /^\d[\d,]*\s*-\s*\d[\d,]*\s*(sgd|usd|\$)/i,
];

// Job-board page-chrome / UI noise that shows up at the top of scraped JDs.
// These are lines like "Jabil Logo", "Apply on employer site", "Show less",
// "Save", "Share", hashtags, and bare single-word lines that look like
// company/brand headers (one word, no role keyword). Used for BOTH the
// primary-pass reject and the fallback reject.
const NOISE_LINE_PATTERNS = [
  /\blogo\s*$/i,                  // "Jabil Logo", "Company Logo"
  /^apply\b/i,                    // "Apply on employer site", "Apply now", "Apply via..."
  /^show\s*(less|more)\b/i,       // "Show less", "Show more"
  /^save\b/i,                     // "Save for later", "Save job"
  /^share\b/i,                    // "Share this job"
  /^report\s+(this|discriminatory)\b/i, // "Report this listing", "Report discriminatory job ad..."
  /^#/,                           // "#whereyoubelong" style hashtags
  /^see\s+more\b/i,
  /^read\s+more\b/i,
];

const TITLE_LABEL_PREFIX = /^(job\s*title|position|role|title)\s*[:\-–—]\s*/i;

function isCompanyOrMetadataLine(line: string): boolean {
  if (METADATA_LINE_PATTERNS.some((re) => re.test(line))) return true;
  if (NOISE_LINE_PATTERNS.some((re) => re.test(line))) return true;
  // Company-suffix check: only reject if the line also has NO role-title
  // keyword, so lines like "Supply Chain Planner — XANDRO PTE. LTD." are kept.
  const lc = line.toLowerCase();
  const hasRoleKw = ROLE_TITLE_KEYWORDS.some((kw) => lc.includes(kw));
  if (!hasRoleKw && COMPANY_SUFFIX_PATTERNS.some((re) => re.test(line))) {
    return true;
  }
  // Bare single-word / two-char lines with no role keyword are almost always
  // company-brand headers or page chrome (e.g. "Jabil", "Amazon"). Reject
  // these from the fallback path so they never surface as the guessed title.
  if (!hasRoleKw) {
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 1) return true;
  }
  return false;
}

export function guessJDTitle(jdText: string): string {
  const lines = jdText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 20);

  if (lines.length === 0) return "Untitled role";

  const scored: Array<{ line: string; score: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(TITLE_LABEL_PREFIX, "").trim();
    if (line.length === 0 || line.length > 140) continue;
    if (SECTION_HEADERS.some((re) => re.test(line))) continue;
    if (isCompanyOrMetadataLine(line)) continue;
    // Skip obvious sentences (long + ends in sentence punctuation).
    if (line.length > 80 && /[.?!]$/.test(line)) continue;

    const lc = line.toLowerCase();
    const hasRoleKw = ROLE_TITLE_KEYWORDS.some((kw) => lc.includes(kw));
    if (!hasRoleKw) continue;

    // Score: earlier lines + lines closer to ~45 chars win.
    const earliness = 20 - i;
    const lenPenalty = Math.abs(line.length - 45) / 30;
    const score = earliness - lenPenalty;
    scored.push({ line, score });
  }

  if (scored.length > 0) {
    scored.sort((a, b) => b.score - a.score);
    return scored[0].line;
  }

  // Fallback: first non-empty line that isn't a pure company name or job-
  // board metadata line. If everything near the top is company/metadata,
  // fall back to the very first line as a last resort.
  const cleanFallback = lines.find(
    (l) => !isCompanyOrMetadataLine(l) && !SECTION_HEADERS.some((re) => re.test(l))
  );
  const fallback = cleanFallback ?? lines[0];
  return fallback.length <= 140 ? fallback : fallback.slice(0, 100) + "…";
}

// Conservative company-name extractor. Runs independently from title
// extraction — does NOT concatenate with the title, does NOT alter scoring.
//
// Strategy:
//   1. Look at first ~15 non-empty lines.
//   2. Strip trailing " Logo" so "Jabil Logo" → "Jabil".
//   3. Skip the line we already returned as the title, plus section headers,
//      metadata lines, and job-board noise lines.
//   4. Skip lines with role-title keywords (those are titles, not companies).
//   5. Score candidates: legal-entity suffix (+3), ALL CAPS (+2), sitting
//      above the title line (+2), short-and-near-top (+1), plus a small
//      earliness bonus.
//   6. Return the top-scored line, or "" when nothing looks like a company.
export function guessJDCompany(jdText: string, guessedTitle?: string): string {
  const lines = jdText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 15);

  if (lines.length === 0) return "";

  const titleLc = (guessedTitle ?? "").toLowerCase().trim();
  const titleIdx = titleLc
    ? lines.findIndex((l) => l.toLowerCase() === titleLc)
    : -1;

  const scored: Array<{ line: string; score: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    // Strip trailing " Logo" so scraped "Jabil Logo" → "Jabil"
    const line = lines[i].replace(/\s+logo\s*$/i, "").trim();
    if (line.length === 0 || line.length > 120) continue;
    if (titleLc && line.toLowerCase() === titleLc) continue;

    if (SECTION_HEADERS.some((re) => re.test(line))) continue;
    if (METADATA_LINE_PATTERNS.some((re) => re.test(line))) continue;
    if (NOISE_LINE_PATTERNS.some((re) => re.test(line))) continue;
    // Skip obvious sentences.
    if (line.length > 80 && /[.?!]$/.test(line)) continue;

    const lc = line.toLowerCase();
    const hasRoleKw = ROLE_TITLE_KEYWORDS.some((kw) => lc.includes(kw));
    // Company candidates never have role keywords — those are titles.
    if (hasRoleKw) continue;

    const hasCompanySuffix = COMPANY_SUFFIX_PATTERNS.some((re) => re.test(line));
    const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
    const beforeTitle = titleIdx > 0 && i < titleIdx;

    let s = 0;
    if (hasCompanySuffix) s += 3;
    if (isAllCaps) s += 2;
    if (beforeTitle) s += 2;
    if (line.length <= 60 && i < 5) s += 1;
    // Earliness tie-breaker.
    s += Math.max(0, 5 - i) * 0.1;

    if (s > 0) scored.push({ line, score: s });
  }

  if (scored.length === 0) return "";
  scored.sort((a, b) => b.score - a.score);
  return scored[0].line;
}

// Helper used elsewhere when we already know the track.
export function trackById(id: TrackId) {
  return TRACKS[id];
}
