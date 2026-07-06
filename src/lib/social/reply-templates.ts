import { ACQUISITION_SOURCE_URLS } from "@/lib/utm";

export const SOLEPROMPT_LINK = ACQUISITION_SOURCE_URLS.xReplies;

export const REPLY_STYLES = [
  { id: "educational", label: "Educational" },
  { id: "question", label: "Question" },
  { id: "founder", label: "Founder" },
  { id: "helpful", label: "Helpful" },
  { id: "less-promotional", label: "Less promotional" },
] as const;

export type ReplyStyle = (typeof REPLY_STYLES)[number]["id"];

export type ReplyCategory =
  | "ai-prompts"
  | "chatgpt"
  | "productivity"
  | "marketing"
  | "small-business";

export type ReplyTemplate = {
  taglineKey: string;
  text: string;
  includesLink: boolean;
};

export const REPLY_CATEGORIES: { id: ReplyCategory; label: string }[] = [
  { id: "ai-prompts", label: "AI prompts" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "productivity", label: "Productivity" },
  { id: "marketing", label: "Marketing" },
  { id: "small-business", label: "Small business" },
];

export const REPLY_TEMPLATES: Record<ReplyCategory, ReplyTemplate[]> = {
  "ai-prompts": [
    {
      taglineKey: "ai-prompts-better-output",
      text: "Totally agree — the prompt is half the battle. A clear structure (role + task + format) usually beats a longer ramble.",
      includesLink: false,
    },
    {
      taglineKey: "ai-prompts-marketplace-tip",
      text: "If you want ready-made prompts instead of starting from scratch, SolePrompt has curated packs for business and marketing: {{link}}",
      includesLink: true,
    },
    {
      taglineKey: "ai-prompts-save-templates",
      text: "Worth saving your best prompts as templates. Reuse beats reinventing every session.",
      includesLink: false,
    },
    {
      taglineKey: "ai-prompts-specificity",
      text: "One trick: ask for one specific output format up front (bullets, table, email draft). Cuts revision loops way down.",
      includesLink: false,
    },
  ],
  chatgpt: [
    {
      taglineKey: "chatgpt-context-window",
      text: "Giving ChatGPT a short example of the tone you want works better than a long list of rules.",
      includesLink: false,
    },
    {
      taglineKey: "chatgpt-prompt-library",
      text: "If you're tired of blank-screen syndrome, browse practical ChatGPT prompts on SolePrompt: {{link}}",
      includesLink: true,
    },
    {
      taglineKey: "chatgpt-iterate",
      text: "Treat the first reply as a draft — ask it to tighten, shorten, or change audience. Second pass is where the magic happens.",
      includesLink: false,
    },
    {
      taglineKey: "chatgpt-system-style",
      text: "Start with \"Act as a [role]\" plus one constraint (word count, audience, channel). Simple but effective.",
      includesLink: false,
    },
  ],
  productivity: [
    {
      taglineKey: "productivity-batch-tasks",
      text: "Batch similar AI tasks in one session — emails, summaries, outlines — so you stay in context instead of re-explaining.",
      includesLink: false,
    },
    {
      taglineKey: "productivity-prompts-shortcut",
      text: "For recurring workflows, pre-built prompts save more time than tweaking ChatGPT each time. SolePrompt is built for that: {{link}}",
      includesLink: true,
    },
    {
      taglineKey: "productivity-checklist",
      text: "Ask AI for a checklist first, then execute item by item. Stops vague \"do everything\" answers.",
      includesLink: false,
    },
    {
      taglineKey: "productivity-timebox",
      text: "Set a 10-minute cap: one prompt, one output, ship it. Perfectionism is the real productivity killer.",
      includesLink: false,
    },
  ],
  marketing: [
    {
      taglineKey: "marketing-hook-first",
      text: "Lead with the hook, not the features. Ask AI for 5 headline variants before you write the body.",
      includesLink: false,
    },
    {
      taglineKey: "marketing-copy-prompts",
      text: "Marketing prompts for ads, email, and landing pages — curated on SolePrompt if you want a head start: {{link}}",
      includesLink: true,
    },
    {
      taglineKey: "marketing-audience-pain",
      text: "Frame prompts around one customer pain point. \"Write for someone who [specific problem]\" beats generic \"write marketing copy.\"",
      includesLink: false,
    },
    {
      taglineKey: "marketing-test-angles",
      text: "Generate 3 angles (urgency, social proof, curiosity) and A/B the winner. AI is great for rapid angle testing.",
      includesLink: false,
    },
  ],
  "small-business": [
    {
      taglineKey: "small-business-automate-repeat",
      text: "Automate the repeat stuff first — follow-ups, FAQs, review responses — not the high-touch sales conversations.",
      includesLink: false,
    },
    {
      taglineKey: "small-business-prompts",
      text: "Small teams don't have time to prompt-engineer. SolePrompt has business-ready AI prompts you can copy and use: {{link}}",
      includesLink: true,
    },
    {
      taglineKey: "small-business-one-tool",
      text: "Pick one AI workflow that saves an hour a week (invoicing emails, social captions, customer replies) and master it before adding more.",
      includesLink: false,
    },
    {
      taglineKey: "small-business-outsource-draft",
      text: "Use AI for first drafts, you for final voice. Keeps quality up without burning out on blank pages.",
      includesLink: false,
    },
  ],
};

const CATEGORY_KEYWORDS: Record<ReplyCategory, string[]> = {
  "ai-prompts": [
    "prompt",
    "prompts",
    "prompt engineering",
    "system prompt",
    "few-shot",
    "llm",
  ],
  chatgpt: ["chatgpt", "gpt-4", "gpt4", "gpt-3", "openai", "copilot"],
  productivity: [
    "productivity",
    "workflow",
    "time management",
    "efficiency",
    "automate",
    "deep work",
  ],
  marketing: [
    "marketing",
    "copywriting",
    "ads",
    "campaign",
    "content marketing",
    "seo",
    "social media",
  ],
  "small-business": [
    "small business",
    "smb",
    "solopreneur",
    "founder",
    "startup",
    "entrepreneur",
    "side hustle",
  ],
};

export function detectCategoryFromText(text: string): ReplyCategory {
  const lower = text.toLowerCase();
  let best: ReplyCategory = "ai-prompts";
  let bestScore = 0;

  for (const { id } of REPLY_CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[id];
    const score = keywords.reduce(
      (sum, keyword) => sum + (lower.includes(keyword) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }

  return best;
}

export function renderReplyTemplate(template: ReplyTemplate): string {
  if (template.includesLink) {
    return template.text.replace(/\{\{link\}\}/g, SOLEPROMPT_LINK);
  }
  return template.text.replace(/\{\{link\}\}/g, "").trim();
}

export function pickReplyTemplate(
  category: ReplyCategory,
  usedTaglineKeys: Set<string>,
): ReplyTemplate | null {
  const templates = [...REPLY_TEMPLATES[category]];

  for (let i = templates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [templates[i], templates[j]] = [templates[j]!, templates[i]!];
  }

  const available = templates.filter((t) => !usedTaglineKeys.has(t.taglineKey));
  if (available.length === 0) {
    return null;
  }

  return available[0]!;
}

export const DISCOVERY_KEYWORDS = [
  "AI prompts",
  "ChatGPT tips",
  "productivity hacks",
  "marketing copy AI",
  "small business automation",
];
