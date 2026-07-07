import { matchPromptsByTitles } from "@/lib/category-landing";
import type { Prompt } from "@/types";

export type OnboardingGoalId =
  | "learn"
  | "get-job"
  | "start-business"
  | "make-money"
  | "grow-audience"
  | "automate-work";

export const ONBOARDING_STORAGE_KEY = "soleprompt-onboarding-goal";

export interface OnboardingGoal {
  id: OnboardingGoalId;
  emoji: string;
  label: string;
  resultHeadline: string;
  resultDescription: string;
  academyHref: string;
  exploreHref: string;
  pathCta: string;
  featuredTitles: string[];
  keywords: string[];
  categoryNames: string[];
}

export const ONBOARDING_GOALS: OnboardingGoal[] = [
  {
    id: "learn",
    emoji: "📚",
    label: "Learn",
    resultHeadline: "Start with free basics, then level up",
    resultDescription:
      "AI fundamentals, prompt writing, and starter templates — then premium packs when you're ready.",
    academyHref: "/academy/learners",
    exploreHref: "/explore?price=free",
    pathCta: "Start learning path",
    featuredTitles: [
      "Welcome Pack - 10 Free AI Prompts",
      "Study Guide Generator",
      "Complete AI Starter Mega Pack",
    ],
    keywords: ["study", "starter", "welcome", "learn", "guide", "free"],
    categoryNames: ["Education", "Productivity"],
  },
  {
    id: "get-job",
    emoji: "💼",
    label: "Get a job",
    resultHeadline: "Land internships and stand out to recruiters",
    resultDescription:
      "Resume builders, cover letters, interview prep, and portfolio tools for your major.",
    academyHref: "/academy/students",
    exploreHref: "/explore?category=writing",
    pathCta: "View student toolkit",
    featuredTitles: [
      "Resume Achievement Bullets",
      "Cover Letter Personalizer",
      "Internship Application Coach",
      "College Essay Coach",
    ],
    keywords: ["resume", "cover letter", "internship", "career", "interview", "ats"],
    categoryNames: ["Writing", "Education"],
  },
  {
    id: "start-business",
    emoji: "🚀",
    label: "Start a business",
    resultHeadline: "Launch faster with a founder toolkit",
    resultDescription:
      "Business plans, pitch decks, branding briefs, and go-to-market tools for new ventures.",
    academyHref: "/academy/entrepreneurs",
    exploreHref: "/explore?category=business",
    pathCta: "View founder toolkit",
    featuredTitles: [
      "One-Page Business Plan Generator",
      "Business Model Canvas Coach",
      "Pitch Deck Outline Generator",
      "Startup Launch Pack",
    ],
    keywords: ["business", "startup", "launch", "pitch", "canvas", "mvp"],
    categoryNames: ["Business", "Marketing"],
  },
  {
    id: "make-money",
    emoji: "💰",
    label: "Make money",
    resultHeadline: "Side hustles, pricing, and income workflows",
    resultDescription:
      "Tools to price offers, close clients, and grow revenue — without guessing.",
    academyHref: "/academy/entrepreneurs",
    exploreHref: "/explore?category=finance",
    pathCta: "View income toolkit",
    featuredTitles: [
      "Side Hustle Idea Validator",
      "Freelancer Essentials Bundle",
      "Pricing Model Analyzer",
      "Cold Outreach Email Writer",
    ],
    keywords: ["money", "income", "pricing", "freelance", "side hustle", "sales"],
    categoryNames: ["Finance", "Sales", "Business"],
  },
  {
    id: "grow-audience",
    emoji: "📈",
    label: "Grow my audience",
    resultHeadline: "Publish more with scripts, hooks, and captions",
    resultDescription:
      "Content systems for YouTube, TikTok, X, and newsletters — built for creators who post daily.",
    academyHref: "/academy/creators",
    exploreHref: "/explore?category=social-media",
    pathCta: "View creator toolkit",
    featuredTitles: [
      "YouTube Title & Thumbnail Pack",
      "TikTok Hook Library",
      "Instagram Carousel Planner",
      "Newsletter Hook Library",
    ],
    keywords: ["youtube", "tiktok", "caption", "hook", "social", "newsletter", "content"],
    categoryNames: ["Social Media", "Writing", "Marketing"],
  },
  {
    id: "automate-work",
    emoji: "🤖",
    label: "Automate work",
    resultHeadline: "Workflows that cut hours off your week",
    resultDescription:
      "Productivity systems, SOPs, meeting notes, and dev automation — copy, paste, done.",
    academyHref: "/academy/freelancers",
    exploreHref: "/explore?category=productivity",
    pathCta: "View automation toolkit",
    featuredTitles: [
      "Productivity Power Pack",
      "Daily Prioritizer",
      "Operating Cadence Designer",
      "Developer Quick Wins Pack",
    ],
    keywords: ["productivity", "workflow", "automate", "sop", "meeting", "daily"],
    categoryNames: ["Productivity", "Business", "Coding"],
  },
];

export function getOnboardingGoal(id: string): OnboardingGoal | null {
  return ONBOARDING_GOALS.find((g) => g.id === id) ?? null;
}

function scorePrompt(prompt: Prompt, goal: OnboardingGoal): number {
  let score = 0;

  if (goal.categoryNames.includes(prompt.category)) {
    score += 2;
  }

  for (const keyword of goal.keywords) {
    const needle = keyword.toLowerCase();
    if (prompt.title.toLowerCase().includes(needle)) {
      score += 4;
    } else if (prompt.tags.some((tag) => tag.toLowerCase().includes(needle))) {
      score += 2;
    }
  }

  score += Math.min(prompt.salesCount / 10, 3);

  return score;
}

export function getRecommendationsForGoal(
  goalId: OnboardingGoalId,
  prompts: Prompt[],
  limit = 3,
): Prompt[] {
  const goal = getOnboardingGoal(goalId);
  if (!goal) return [];

  const used = new Set<string>();
  const results: Prompt[] = [];

  for (const prompt of matchPromptsByTitles(prompts, goal.featuredTitles)) {
    if (results.length >= limit) break;
    results.push(prompt);
    used.add(prompt.id);
  }

  const ranked = prompts
    .filter((p) => !used.has(p.id))
    .map((p) => ({ prompt: p, score: scorePrompt(p, goal) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.prompt.salesCount - a.prompt.salesCount ||
        b.prompt.rating - a.prompt.rating,
    );

  for (const { prompt } of ranked) {
    if (results.length >= limit) break;
    results.push(prompt);
    used.add(prompt.id);
  }

  if (results.length < limit) {
    for (const prompt of [...prompts].sort(
      (a, b) => b.salesCount - a.salesCount,
    )) {
      if (results.length >= limit) break;
      if (!used.has(prompt.id) && goal.categoryNames.includes(prompt.category)) {
        results.push(prompt);
        used.add(prompt.id);
      }
    }
  }

  if (results.length < limit) {
    for (const prompt of [...prompts].sort(
      (a, b) => b.salesCount - a.salesCount,
    )) {
      if (results.length >= limit) break;
      if (!used.has(prompt.id)) {
        results.push(prompt);
        used.add(prompt.id);
      }
    }
  }

  return results.slice(0, limit);
}
