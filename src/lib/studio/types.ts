export const STUDIO_VIDEO_TYPES = ["shorts", "long-form"] as const;
export type StudioVideoType = (typeof STUDIO_VIDEO_TYPES)[number];

export const STUDIO_TONES = [
  "educational",
  "viral",
  "motivational",
  "professional",
  "funny",
] as const;
export type StudioTone = (typeof STUDIO_TONES)[number];

export const STUDIO_TONE_LABELS: Record<StudioTone, string> = {
  educational: "Educational",
  viral: "Viral",
  motivational: "Motivational",
  professional: "Professional",
  funny: "Funny",
};

export const STUDIO_VIDEO_TYPE_LABELS: Record<StudioVideoType, string> = {
  shorts: "Shorts",
  "long-form": "Long-form",
};

export type StudioMainSection = {
  heading: string;
  content: string;
  retentionTip?: string;
};

export type StudioGenerateInput = {
  topic: string;
  niche?: string;
  videoType: StudioVideoType;
  tone?: StudioTone;
};

export type StudioGeneratedContent = {
  titles: string[];
  script: string;
  hook: string;
  intro: string;
  mainSections: StudioMainSection[];
  outro: string;
  callToAction: string;
  description: string;
  tags: string[];
  thumbnailIdeas: string[];
  pinnedComment: string;
};

export type StudioPackageRecord = StudioGeneratedContent & {
  id: string;
  topic: string;
  niche: string | null;
  videoType: string;
  tone: string | null;
  createdAt: string;
  updatedAt: string;
};
