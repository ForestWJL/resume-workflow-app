// lib/prompt-routing.ts

export type PromptMode =
  | "FULL"
  | "LIGHT"
  | "GAP"
  | "SKIP";

export function resolvePromptMode(
  recommendation: string
): PromptMode {

  if (recommendation === "Strong Apply") {
    return "FULL";
  }

  if (recommendation === "Apply") {
    return "LIGHT";
  }

  if (recommendation === "Stretch") {
    return "GAP";
  }

  return "SKIP";
}