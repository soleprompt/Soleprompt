import { getCategoryVisual } from "@/lib/category-visuals";
import { getCategoryCoverImage } from "@/lib/tool-images";

const GRADIENTS = [
  "from-electric/40 via-purple/30 to-indigo-600/40",
  "from-orange-500/40 via-amber-500/30 to-yellow-600/40",
  "from-emerald-500/40 via-teal-500/30 to-cyan-600/40",
  "from-rose-500/40 via-pink-500/30 to-fuchsia-600/40",
  "from-sky-500/40 via-blue-500/30 to-indigo-600/40",
] as const;

export function categoryNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function getPromptThumbnailImage(categoryName: string): string {
  const slug = categoryNameToSlug(categoryName);
  return getCategoryCoverImage(slug);
}

export function getPromptThumbnailGradient(
  categoryName: string,
  title: string,
): string {
  const slug = categoryNameToSlug(categoryName);
  const visual = getCategoryVisual(slug);
  const categoryGradient = visual.gradient
    .replace(/\/30/g, "/50")
    .replace(/\/20/g, "/35");
  if (categoryGradient !== visual.gradient) {
    return categoryGradient;
  }
  const index =
    title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    GRADIENTS.length;
  return GRADIENTS[index];
}

export type PromptDifficultyTier = "Beginner" | "Pro";

export function getPromptDifficultyTier(prompt: {
  id: string;
  price: number;
  difficulty?: string;
}): PromptDifficultyTier {
  if (prompt.difficulty === "beginner") return "Beginner";
  if (prompt.difficulty === "advanced") return "Pro";
  if (prompt.price <= 0 || prompt.price < 5) return "Beginner";
  if (prompt.price >= 15) return "Pro";
  const hash = prompt.id.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? "Beginner" : "Pro";
}

const DEFAULT_MODEL_BADGES = ["ChatGPT", "Claude", "Gemini"] as const;

export function getCompatibleModelBadges(models: string[]): string[] {
  const labels = models
    .map((m) => {
      const key = m.toLowerCase();
      for (const [pattern, label] of Object.entries(MODEL_LABELS)) {
        if (key.includes(pattern)) return label;
      }
      return null;
    })
    .filter((v): v is string => v !== null)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return labels.length > 0 ? labels : [...DEFAULT_MODEL_BADGES];
}

export function getPromptBenefit(
  description: string,
  estimatedTimeSaved: string | null,
): string {
  if (estimatedTimeSaved) {
    return `Save ${estimatedTimeSaved} on every use`;
  }
  const firstSentence = description.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length <= 90) {
    return firstSentence;
  }
  if (description.length <= 90) return description;
  return `${description.slice(0, 87).trimEnd()}…`;
}

const MODEL_LABELS: Record<string, string> = {
  "gpt-4": "ChatGPT",
  "gpt-4o": "ChatGPT",
  chatgpt: "ChatGPT",
  claude: "Claude",
  "claude-3": "Claude",
  gemini: "Gemini",
};

export function formatCompatibleModels(models: string[]): string {
  const labels = models
    .map((m) => {
      const key = m.toLowerCase();
      for (const [pattern, label] of Object.entries(MODEL_LABELS)) {
        if (key.includes(pattern)) return label;
      }
      return m;
    })
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const display =
    labels.length > 0 ? labels : ["ChatGPT", "Claude", "Gemini"];

  if (display.length === 1) return `Works with ${display[0]}`;
  if (display.length === 2) return `Works with ${display[0]} & ${display[1]}`;
  return `Works with ${display.slice(0, -1).join(", ")} & ${display.at(-1)}`;
}
