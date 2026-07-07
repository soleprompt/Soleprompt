import { getToolCoverImage } from "../../src/lib/tool-images";

export const COMPATIBLE_MODELS = [
  "GPT-4o",
  "GPT-4",
  "Claude 3.5 Sonnet",
  "Claude 3 Opus",
  "Gemini 2.0",
  "Llama 3.1",
  "Mistral Large",
] as const;

export type CategorySlug =
  | "productivity"
  | "business"
  | "marketing"
  | "sales"
  | "solar"
  | "social-media"
  | "real-estate"
  | "coding"
  | "finance"
  | "writing"
  | "education";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type StarterPromptDefinition = {
  title: string;
  categorySlug: CategorySlug;
  tags: string[];
  price: 0 | 1.99 | 2.99;
  difficulty: Difficulty;
  estimatedTimeSaved: string;
  description: string;
  content: string;
  preview: string;
  compatibleModels: string[];
  sampleOutput: string;
  coverImageUrl: string;
  sellerIndex?: number;
  featured?: boolean;
};

export type BundleDefinition = Omit<StarterPromptDefinition, "price"> & {
  price: number;
  exactPrice: true;
};

export type CatalogEntry = StarterPromptDefinition | BundleDefinition;

export function coverImageUrl(categorySlug: CategorySlug, title: string): string {
  const image = getToolCoverImage(title, categorySlug);
  // Only persist static assets in the DB; generated previews resolve at render time.
  if (image.startsWith("/tools/") || image.startsWith("/categories/")) {
    return image;
  }
  return "";
}

export function pickCompatibleModels(title: string): string[] {
  const hash = title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = hash % (COMPATIBLE_MODELS.length - 2);
  return [...COMPATIBLE_MODELS.slice(start, start + 3)];
}

export function buildSampleOutput(title: string, deliverable: string): string {
  return `# ${title} — Sample Output

## Summary
${deliverable} tailored to your inputs, goals, and constraints.

## What You Get
1. Structured recommendations you can act on immediately
2. Clear next steps with priorities
3. Copy-ready or template-ready deliverables

## Example
Based on your context, here are prioritized actions with rationale and timelines you can deploy today.

---
*Actual output adapts to your specific situation.*`;
}

export function starterPrompt(
  title: string,
  categorySlug: CategorySlug,
  tags: string[],
  price: 0 | 1.99 | 2.99,
  difficulty: Difficulty,
  estimatedTimeSaved: string,
  role: string,
  task: string,
  outputs: string[],
  extraInstructions = "",
): StarterPromptDefinition {
  const outputList = outputs.map((o, i) => `${i + 1}. ${o}`).join("\n");
  const content = `You are a ${role}.

The user will provide their context, goals, constraints, and any relevant background. Your job is to ${task}.

${extraInstructions ? `${extraInstructions}\n\n` : ""}Return your response in clear sections with these deliverables:
${outputList}

Ask clarifying questions only when critical information is missing. Be specific, actionable, and practical — avoid generic filler.`;

  const description = `${task.charAt(0).toUpperCase()}${task.slice(1)}. Saves ~${estimatedTimeSaved} with structured outputs and ready-to-use results.`;

  return {
    title,
    categorySlug,
    tags,
    price,
    difficulty,
    estimatedTimeSaved,
    description,
    content,
    preview: `${content.slice(0, 180)}${content.length > 180 ? "…" : ""}`,
    compatibleModels: pickCompatibleModels(title),
    sampleOutput: buildSampleOutput(title, task),
    coverImageUrl: coverImageUrl(categorySlug, title),
  };
}

export function bundlePrompt(
  title: string,
  categorySlug: CategorySlug,
  tags: string[],
  price: number,
  difficulty: Difficulty,
  estimatedTimeSaved: string,
  description: string,
  content: string,
  sellerIndex?: number,
): BundleDefinition {
  return {
    title,
    categorySlug,
    tags,
    price,
    exactPrice: true,
    difficulty,
    estimatedTimeSaved,
    description,
    content,
    preview: `${description.slice(0, 180)}${description.length > 180 ? "…" : ""}`,
    compatibleModels: pickCompatibleModels(title),
    sampleOutput: buildSampleOutput(title, "multi-prompt bundle with copy-paste instructions for each included prompt"),
    coverImageUrl: coverImageUrl(categorySlug, title),
    sellerIndex,
  };
}
