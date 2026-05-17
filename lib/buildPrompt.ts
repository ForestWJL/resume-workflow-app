// lib/buildPrompt.ts

import type { PromptMode } from "./prompt-routing";
import type { TrackId } from "@/config/tracks";

import { A_PMC_PROMPT } from "@/config/prompts/A_PMC";
import { A_REGULATED_PROMPT } from "@/config/prompts/A_REGULATED";
import { AB_HYBRID_PROMPT } from "@/config/prompts/AB_HYBRID";
import { AC_DEMAND_PROMPT } from "@/config/prompts/AC_DEMAND";
import { CB_BUYER_PROMPT } from "@/config/prompts/CB_BUYER";
import { D_SUPPORT_PROMPT } from "@/config/prompts/D_SUPPORT";

function getTrackPrompt(track: TrackId): string {

  switch (track) {

    case "A_PMC":
      return A_PMC_PROMPT;

    case "A_REGULATED":
      return A_REGULATED_PROMPT;

    case "AB_HYBRID":
      return AB_HYBRID_PROMPT;

    case "AC_DEMAND":
      return AC_DEMAND_PROMPT;

    case "CB_BUYER":
      return CB_BUYER_PROMPT;

    case "D_SUPPORT":
      return D_SUPPORT_PROMPT;

    default:
      return "";
  }
}

function getModePrompt(
  promptMode: PromptMode
): string {

  switch (promptMode) {


    case "FULL":
      return `
Perform a FULL resume tailoring rewrite.
Aggressively optimize ATS alignment,
positioning, recruiter clarity,
and JD matching.
`;

    case "GAP":
      return `
Perform a GAP analysis only.

Focus on:
- missing skills
- missing experience
- positioning weaknesses
- transferable opportunities

Do NOT rewrite the full resume.
`;

    default:
      return `
This role is NOT recommended.
`;
  }
}

export function buildPrompt(
  track: TrackId,
  promptMode: PromptMode,
  jdText: string
): string {

  const trackPrompt = getTrackPrompt(track);

  const modePrompt = getModePrompt(promptMode);

  return `

${trackPrompt}

--------------------------------

${modePrompt}

--------------------------------

TARGET JOB DESCRIPTION

${jdText}

`;
}