import type { StudioResearchRecord } from "@/lib/studio/research/types";
import type { StoryboardSceneRecord } from "@/lib/studio/storyboard/types";
import type { StudioGeneratedContent } from "@/lib/studio/types";
import type { VideoProjectState } from "@/lib/studio/video/types";
import type { MvpVoiceoverState } from "@/lib/studio/voiceover/types";

export const MVP_STEPS = [
  "research",
  "script",
  "storyboard",
  "thumbnail",
  "seo",
] as const;

export type MvpStep = (typeof MVP_STEPS)[number];

export type MvpStepStatus = "pending" | "running" | "completed" | "failed";

export type MvpProgress = Record<MvpStep, MvpStepStatus>;

export type MvpSeoPackage = {
  titles: string[];
  description: string;
  tags: string[];
  pinnedComment: string;
};

export type MvpThumbnailConcept = {
  id: string;
  title: string;
  isPrimary: boolean;
};

export type MvpProjectState = {
  projectId: string;
  topic: string;
  niche: string | null;
  videoType: string;
  tone: string | null;
  status: string;
  mvpProgress: MvpProgress;
  activeStep: MvpStep | null;
  error: string | null;
  research: StudioResearchRecord | null;
  script: StudioGeneratedContent | null;
  scenes: StoryboardSceneRecord[];
  thumbnails: MvpThumbnailConcept[];
  seo: MvpSeoPackage | null;
  voiceover: MvpVoiceoverState;
  video: VideoProjectState;
  packageId: string | null;
};

export const MVP_STEP_LABELS: Record<MvpStep, string> = {
  research: "Research",
  script: "Script",
  storyboard: "Storyboard",
  thumbnail: "Thumbnail",
  seo: "SEO",
};

export function createInitialMvpProgress(): MvpProgress {
  return {
    research: "pending",
    script: "pending",
    storyboard: "pending",
    thumbnail: "pending",
    seo: "pending",
  };
}
