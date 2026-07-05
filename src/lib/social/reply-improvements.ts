import { SOLEPROMPT_LINK } from "@/lib/social/reply-templates";

export type ImprovementType =
  | "rewrite"
  | "shorten"
  | "friendlier"
  | "less-promotional"
  | "more-engaging";

export const IMPROVEMENT_OPTIONS: {
  id: ImprovementType;
  label: string;
}[] = [
  { id: "rewrite", label: "Rewrite" },
  { id: "shorten", label: "Shorten" },
  { id: "friendlier", label: "Make friendlier" },
  { id: "less-promotional", label: "Less promotional" },
  { id: "more-engaging", label: "More engaging" },
];

const FILLER_PHRASES = [
  "Totally agree — ",
  "Hope this helps — ",
  "One thing I've learned: ",
  "As a founder building with AI daily: ",
  "Worth noting: ",
  "Curious — ",
];

const PROMO_PATTERNS = [
  /SolePrompt has[^.!?]*[.!?]?/gi,
  /browse practical ChatGPT prompts on SolePrompt[^.!?]*[.!?]?/gi,
  /curated on SolePrompt[^.!?]*[.!?]?/gi,
  /SolePrompt is built for that[^.!?]*[.!?]?/gi,
  /SolePrompt has business-ready AI prompts[^.!?]*[.!?]?/gi,
  new RegExp(SOLEPROMPT_LINK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
];

function stripPromo(text: string): string {
  let result = text;
  for (const pattern of PROMO_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result.replace(/\s{2,}/g, " ").replace(/ — $/, "").trim();
}

function shortenText(text: string): string {
  let result = text;
  for (const phrase of FILLER_PHRASES) {
    result = result.replace(phrase, "");
  }

  const sentences = result.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > 1) {
    result = sentences.slice(0, 2).join(" ");
  }

  if (result.length > 200) {
    const words = result.split(/\s+/);
    result = `${words.slice(0, 28).join(" ")}…`;
  }

  return result.trim();
}

function rewriteText(text: string): string {
  const replacements: [RegExp, string][] = [
    [/\bTotally agree\b/gi, "Great point"],
    [/\bOne trick\b/gi, "A simple approach"],
    [/\bWorth saving\b/gi, "It helps to save"],
    [/\bTreat the first reply as a draft\b/gi, "Think of the first output as a draft"],
    [/\bCurious — what's your go-to approach here\?/gi, "What approach has worked best for you?"],
    [/\bHope this helps\b/gi, "Sharing in case it's useful"],
    [/\bOne thing I've learned\b/gi, "Something that's worked for me"],
    [/\bAs a founder building with AI daily\b/gi, "Running a product team with AI every day"],
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  if (result === text) {
    result = `Rephrasing: ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  }

  return result.trim();
}

function makeFriendlier(text: string): string {
  const warmOpeners = ["Love this — ", "Really resonate with this. ", "Thanks for sharing! "];
  const opener = warmOpeners[text.length % warmOpeners.length]!;
  if (/^(Love this|Really resonate|Thanks for sharing)/i.test(text)) {
    return text;
  }
  return `${opener}${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function makeMoreEngaging(text: string): string {
  if (/\?\s*$/.test(text)) {
    return text;
  }
  const hooks = [
    " Would love to hear your take.",
    " What's been your experience?",
    " Anyone else tried this?",
  ];
  const hook = hooks[text.length % hooks.length]!;
  return `${text.replace(/[.!?]\s*$/, "")}${hook}`;
}

function ensureMaxLength(content: string, max = 280): string {
  if (content.length <= max) return content;
  return `${content.slice(0, max - 1).trim()}…`;
}

export function applyImprovement(
  content: string,
  type: ImprovementType,
): string {
  const trimmed = content.trim();
  if (!trimmed) return trimmed;

  let result: string;
  switch (type) {
    case "rewrite":
      result = rewriteText(trimmed);
      break;
    case "shorten":
      result = shortenText(trimmed);
      break;
    case "friendlier":
      result = makeFriendlier(trimmed);
      break;
    case "less-promotional":
      result = stripPromo(trimmed);
      if (!result) {
        result = "Great thread — saving prompts as reusable templates has been a game-changer for me.";
      }
      break;
    case "more-engaging":
      result = makeMoreEngaging(trimmed);
      break;
    default:
      result = trimmed;
  }

  return ensureMaxLength(result);
}
