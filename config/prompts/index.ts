// config/prompts/index.ts

import type { TrackId } from "../tracks";

import { A_PMC_PROMPT } from "./A_PMC";
import { A_REGULATED_PROMPT } from "./A_REGULATED";
import { AB_HYBRID_PROMPT } from "./AB_HYBRID";
import { AC_DEMAND_PROMPT } from "./AC_DEMAND";
import { CB_BUYER_PROMPT } from "./CB_BUYER";
import { D_SUPPORT_PROMPT } from "./D_SUPPORT";

export interface TrackPromptPackage {
  sourceFile: string;
  displayName: string;
  round1: string;
  round2: string;
  round3: string;
}

export const PROMPTS: Record<TrackId, TrackPromptPackage> = {
  A_PMC: A_PMC_PROMPT,

  A_REGULATED: A_REGULATED_PROMPT,

  AB_HYBRID: AB_HYBRID_PROMPT,

  AC_DEMAND: AC_DEMAND_PROMPT,

  CB_BUYER: CB_BUYER_PROMPT,

  D_SUPPORT: D_SUPPORT_PROMPT,
};

// Optional shared polish pass
export const CHATGPT_REFINE_PROMPT = `
Please do a final human-readability and ATS polish pass on this resume.

Important:
- Do not change any official company names, job titles, dates, or locations.
- Do not rewrite whole sections unless a line is genuinely broken.
- Do not add new experience or invent tools / metrics.
- Keep the overall wording style and structure.

Please review specifically for:
1. ATS-friendly phrasing and keyword density without stuffing
2. Recruiter readability: natural English, no awkward wording
3. Bullet rhythm: strong verb start, clear outcome
4. Grammar slips or duplicated words
5. Whether the top third passes a 6-second recruiter scan
6. Metrics flagged as "to verify"

Output:
A. Top 5 polish fixes applied
B. Remaining risks
C. Metrics to verify
D. Submission readiness
`;