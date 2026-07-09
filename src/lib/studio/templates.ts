import type { StudioTone, StudioVideoType } from "@/lib/studio/types";

export type StudioProjectTemplateId =
  | "faceless-documentary"
  | "ai-news"
  | "finance"
  | "motivation"
  | "tech-reviews"
  | "storytelling"
  | "product-reviews"
  | "educational";

export type StudioProjectTemplate = {
  id: StudioProjectTemplateId;
  name: string;
  description: string;
  niche: string;
  tone: StudioTone;
  videoType: StudioVideoType;
  topicPlaceholder: string;
  accent: "purple" | "electric";
};

export const STUDIO_PROJECT_TEMPLATES: StudioProjectTemplate[] = [
  {
    id: "faceless-documentary",
    name: "Faceless Documentary",
    description: "Deep-dive narratives with archival-style storytelling.",
    niche: "Documentary & History",
    tone: "professional",
    videoType: "long-form",
    topicPlaceholder: "e.g. The hidden history of the Manhattan Project",
    accent: "purple",
  },
  {
    id: "ai-news",
    name: "AI News",
    description: "Fast-breaking AI updates and product launches.",
    niche: "AI & Technology News",
    tone: "professional",
    videoType: "shorts",
    topicPlaceholder: "e.g. OpenAI just dropped a new model — here's what changed",
    accent: "electric",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Money, investing, and wealth-building explainers.",
    niche: "Personal Finance & Investing",
    tone: "educational",
    videoType: "long-form",
    topicPlaceholder: "e.g. How to build a $1M portfolio starting from zero",
    accent: "electric",
  },
  {
    id: "motivation",
    name: "Motivation",
    description: "High-energy mindset and discipline content.",
    niche: "Self-improvement & Motivation",
    tone: "motivational",
    videoType: "shorts",
    topicPlaceholder: "e.g. The one habit that separates winners from everyone else",
    accent: "purple",
  },
  {
    id: "tech-reviews",
    name: "Tech Reviews",
    description: "Hands-on gadget reviews and comparisons.",
    niche: "Consumer Tech",
    tone: "professional",
    videoType: "long-form",
    topicPlaceholder: "e.g. MacBook Pro M5 — 30 days later, honest review",
    accent: "electric",
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Viral narrative hooks and plot-driven scripts.",
    niche: "Storytelling & Narrative",
    tone: "viral",
    videoType: "long-form",
    topicPlaceholder: "e.g. She vanished for 10 years — then showed up at her own funeral",
    accent: "purple",
  },
  {
    id: "product-reviews",
    name: "Product Reviews",
    description: "Honest product tests and buyer guides.",
    niche: "Product Reviews & Unboxing",
    tone: "educational",
    videoType: "long-form",
    topicPlaceholder: "e.g. Is this viral Amazon gadget actually worth $49?",
    accent: "electric",
  },
  {
    id: "educational",
    name: "Educational",
    description: "Clear tutorials and concept explainers.",
    niche: "Education & How-to",
    tone: "educational",
    videoType: "long-form",
    topicPlaceholder: "e.g. How blockchain actually works (simple explanation)",
    accent: "purple",
  },
];

export function getStudioProjectTemplate(
  id: StudioProjectTemplateId,
): StudioProjectTemplate | undefined {
  return STUDIO_PROJECT_TEMPLATES.find((template) => template.id === id);
}
