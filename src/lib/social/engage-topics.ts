export const ENGAGE_TOPICS = [
  { id: "ai", label: "AI" },
  { id: "productivity", label: "Productivity" },
  { id: "saas", label: "SaaS" },
  { id: "prompts", label: "Prompts" },
  { id: "marketing", label: "Marketing" },
  { id: "reputation", label: "Reputation" },
  { id: "x-cleanup", label: "X cleanup" },
] as const;

export type EngageTopicId = (typeof ENGAGE_TOPICS)[number]["id"];

const TOPIC_KEYWORDS: Record<EngageTopicId, string[]> = {
  ai: [
    "ai",
    "artificial intelligence",
    "llm",
    "gpt",
    "chatgpt",
    "claude",
    "gemini",
    "machine learning",
    "openai",
    "agents",
  ],
  productivity: [
    "productivity",
    "workflow",
    "automate",
    "efficiency",
    "time management",
    "deep work",
    "focus",
  ],
  saas: [
    "saas",
    "startup",
    "software",
    "b2b",
    "founder",
    "bootstrapped",
    "mrr",
    "arr",
    "indie hacker",
  ],
  prompts: ["prompt", "prompting", "prompt engineering", "system prompt"],
  marketing: [
    "marketing",
    "growth",
    "brand",
    "copy",
    "content",
    "seo",
    "ads",
    "launch",
  ],
  reputation: [
    "reputation",
    "brand safety",
    "crisis",
    "pr",
    "public relations",
    "trust",
  ],
  "x-cleanup": [
    "scrub",
    "delete tweets",
    "archive",
    "cleanup",
    "x cleanup",
    "twitter cleanup",
    "old tweets",
  ],
};

export type TopicRelevanceResult = {
  score: number;
  matchedTopics: EngageTopicId[];
};

export function scoreTopicRelevance(text: string): TopicRelevanceResult {
  const lower = text.toLowerCase();
  const matchedTopics: EngageTopicId[] = [];
  let score = 0;

  for (const topic of ENGAGE_TOPICS) {
    const keywords = TOPIC_KEYWORDS[topic.id];
    const hits = keywords.reduce(
      (sum, keyword) => sum + (lower.includes(keyword) ? 1 : 0),
      0,
    );
    if (hits > 0) {
      matchedTopics.push(topic.id);
      score += hits;
    }
  }

  return { score, matchedTopics };
}

export function isRelevantPost(text: string): boolean {
  return scoreTopicRelevance(text).score > 0;
}
