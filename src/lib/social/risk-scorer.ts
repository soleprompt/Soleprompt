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
  /** Concrete potential-impact statements for matched categories. */
  impacts: string[];
  /** Short label for the top matched risk category. */
  primaryReason: string | null;
  /** Match strength from 0–100; 0 when the tweet is clean. */
  confidence: number;
};

export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  political: "Strong political language",
  offensive: "Potentially offensive language",
  profanity: "Profanity",
  substances: "Substance-related content",
  employer: "Workplace complaints",
  controversial: "Controversial framing",
  personal: "Personal oversharing",
};

/** Guidance-style impact statements per risk category. */
export const CATEGORY_IMPACTS: Record<RiskCategory, string[]> = {
  political: [
    "May affect hiring decisions",
    "May discourage potential clients",
    "Could reduce brand trust",
  ],
  offensive: [
    "May affect hiring decisions",
    "Could damage professional reputation",
    "May discourage potential clients",
  ],
  profanity: [
    "May appear unprofessional to recruiters",
    "Could discourage potential clients",
    "May affect hiring decisions",
  ],
  substances: [
    "May raise concerns with employers",
    "Could affect client trust",
    "May affect hiring decisions",
  ],
  employer: [
    "May affect hiring decisions",
    "Could harm current employment",
    "May discourage potential clients",
  ],
  controversial: [
    "Could reduce brand trust",
    "May discourage potential clients",
    "May affect hiring decisions",
  ],
  personal: [
    "May overshare beyond professional comfort",
    "Could affect how others perceive you professionally",
    "May discourage potential clients",
  ],
};

const CATEGORY_WEIGHTS: Record<RiskCategory, number> = {
  employer: 35,
  offensive: 30,
  political: 25,
  substances: 20,
  controversial: 18,
  profanity: 15,
  personal: 12,
};

type RiskPattern = {
  category: RiskCategory;
  keywords: string[];
  weight: number;
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
  },
];

const AGGRESSIVE_TONE_IMPACT =
  "Could read as aggressive to professional audiences";

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function sortCategoriesByWeight(
  categories: RiskCategory[],
): RiskCategory[] {
  return [...categories].sort(
    (a, b) => CATEGORY_WEIGHTS[b] - CATEGORY_WEIGHTS[a],
  );
}

function primaryReasonForCategories(
  categories: RiskCategory[],
): string | null {
  if (categories.length === 0) return null;
  return CATEGORY_LABELS[sortCategoriesByWeight(categories)[0]];
}

export function getImpactsForCategories(
  categories: RiskCategory[],
  extraImpacts: string[] = [],
): string[] {
  const seen = new Set<string>();
  const impacts: string[] = [];

  for (const impact of extraImpacts) {
    if (!seen.has(impact)) {
      seen.add(impact);
      impacts.push(impact);
    }
  }

  for (const category of sortCategoriesByWeight(categories)) {
    for (const impact of CATEGORY_IMPACTS[category]) {
      if (!seen.has(impact)) {
        seen.add(impact);
        impacts.push(impact);
      }
    }
  }

  return impacts;
}

function calculateConfidence(
  score: number,
  matchedKeywordCount: number,
): number {
  if (score === 0) return 0;

  const base = 60;
  const scoreBonus = Math.min(30, score * 0.4);
  const keywordBonus = Math.min(10, matchedKeywordCount * 5);

  return Math.round(Math.min(100, base + scoreBonus + keywordBonus));
}

export function calculateReputationScore(
  tweets: Array<{ risk: TweetRiskResult }>,
): number {
  let penalty = 0;

  for (const tweet of tweets) {
    if (tweet.risk.score === 0) continue;

    switch (tweet.risk.level) {
      case "high":
        penalty += 3;
        break;
      case "medium":
        penalty += 1.5;
        break;
      case "low":
        penalty += 0.5;
        break;
    }
  }

  return Math.max(0, Math.round(100 - penalty));
}

export function getReputationDisplay(score: number): {
  emoji: string;
  tone: "good" | "caution" | "poor";
} {
  if (score >= 90) {
    return { emoji: "🛡️", tone: "good" };
  }
  if (score >= 70) {
    return { emoji: "🛡️", tone: "caution" };
  }
  return { emoji: "🛡️", tone: "poor" };
}

export function countRiskBreakdown(
  tweets: Array<{ risk: TweetRiskResult }>,
  flaggedOnly = true,
): { low: number; medium: number; high: number } {
  const relevant = flaggedOnly
    ? tweets.filter((t) => t.risk.score > 0)
    : tweets;

  return {
    low: relevant.filter((t) => t.risk.level === "low").length,
    medium: relevant.filter((t) => t.risk.level === "medium").length,
    high: relevant.filter((t) => t.risk.level === "high").length,
  };
}

export function scoreTweetRisk(text: string): TweetRiskResult {
  const normalized = normalizeText(text);
  const categories = new Set<RiskCategory>();
  const matchedKeywords = new Set<string>();
  const extraImpacts: string[] = [];
  let score = 0;

  for (const pattern of RISK_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        categories.add(pattern.category);
        matchedKeywords.add(keyword);
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
      extraImpacts.push(AGGRESSIVE_TONE_IMPACT);
    }
  }

  score = Math.min(100, score);

  let level: TweetRiskResult["level"] = "low";
  if (score >= 50) {
    level = "high";
  } else if (score >= 25) {
    level = "medium";
  }

  const categoryList = [...categories];
  const matchedKeywordList = [...matchedKeywords];
  const impacts = getImpactsForCategories(categoryList, extraImpacts);

  return {
    score,
    level,
    categories: categoryList,
    matchedKeywords: matchedKeywordList,
    reasons: impacts,
    impacts,
    primaryReason: primaryReasonForCategories(categoryList),
    confidence: calculateConfidence(score, matchedKeywordList.length),
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
