export type RiskCategory =
  | "political"
  | "offensive"
  | "profanity"
  | "substances"
  | "employer"
  | "controversial"
  | "personal";

export type TweetRiskResult = {
  score: number;
  level: "low" | "medium" | "high";
  categories: RiskCategory[];
  matchedKeywords: string[];
  reasons: string[];
};

type RiskPattern = {
  category: RiskCategory;
  keywords: string[];
  weight: number;
  reason: string;
};

const RISK_PATTERNS: RiskPattern[] = [
  {
    category: "political",
    keywords: [
      "trump",
      "biden",
      "democrat",
      "republican",
      "liberal",
      "conservative",
      "maga",
      "socialism",
      "fascist",
      "election fraud",
      "woke",
      "antifa",
    ],
    weight: 25,
    reason: "Political content can polarize audiences and employers.",
  },
  {
    category: "offensive",
    keywords: [
      "stupid",
      "idiot",
      "moron",
      "hate",
      "kill yourself",
      "kys",
      "retard",
      "loser",
      "ugly",
      "fat",
    ],
    weight: 30,
    reason: "Potentially offensive or insulting language.",
  },
  {
    category: "profanity",
    keywords: [
      "fuck",
      "shit",
      "damn",
      "bitch",
      "asshole",
      "crap",
      "wtf",
      "af",
    ],
    weight: 15,
    reason: "Profanity may appear unprofessional to recruiters or clients.",
  },
  {
    category: "substances",
    keywords: [
      "drunk",
      "wasted",
      "high af",
      "cocaine",
      "weed",
      "marijuana",
      "hangover",
      "party hard",
      "blackout",
    ],
    weight: 20,
    reason: "Substance-related content can raise professional concerns.",
  },
  {
    category: "employer",
    keywords: [
      "hate my job",
      "hate my boss",
      "worst company",
      "toxic workplace",
      "quit tomorrow",
      "fired",
      "my manager is",
      "coworker is",
      "hr is useless",
    ],
    weight: 35,
    reason: "Employer or workplace complaints are high-risk for career damage.",
  },
  {
    category: "controversial",
    keywords: [
      "hot take",
      "unpopular opinion",
      "fight me",
      "change my mind",
      "controversial",
      "triggered",
      "snowflake",
      "cancel culture",
    ],
    weight: 18,
    reason: "Deliberately provocative framing may not age well.",
  },
  {
    category: "personal",
    keywords: [
      "breakup",
      "divorce",
      "depression",
      "suicidal",
      "anxiety attack",
      "therapy session",
      "medication",
      "diagnosis",
    ],
    weight: 12,
    reason: "Deeply personal content may be oversharing for a public timeline.",
  },
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function scoreTweetRisk(text: string): TweetRiskResult {
  const normalized = normalizeText(text);
  const categories = new Set<RiskCategory>();
  const matchedKeywords = new Set<string>();
  const reasons = new Set<string>();
  let score = 0;

  for (const pattern of RISK_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        categories.add(pattern.category);
        matchedKeywords.add(keyword);
        reasons.add(pattern.reason);
        score += pattern.weight;
        break;
      }
    }
  }

  if (text.includes("!!!") || text.includes("CAPS LOCK")) {
    // mild heuristic: lots of caps words
    const capsWords = text.split(/\s+/).filter((w) => w.length > 3 && w === w.toUpperCase());
    if (capsWords.length >= 3) {
      score += 8;
      reasons.add("Heavy use of caps can read as aggressive.");
    }
  }

  score = Math.min(100, score);

  let level: TweetRiskResult["level"] = "low";
  if (score >= 50) {
    level = "high";
  } else if (score >= 25) {
    level = "medium";
  }

  return {
    score,
    level,
    categories: [...categories],
    matchedKeywords: [...matchedKeywords],
    reasons: [...reasons],
  };
}

export function scoreTweets<T extends { text: string }>(
  tweets: T[],
): Array<T & { risk: TweetRiskResult }> {
  return tweets.map((tweet) => ({
    ...tweet,
    risk: scoreTweetRisk(tweet.text),
  }));
}
