import type { StudioProjectStatus } from "@/generated/prisma/client";
import type { StudioGenerateInput } from "@/lib/studio/types";

export const PIPELINE_STEP_IDS = [
  "trend_research",
  "ai_research",
  "script_generator",
  "storyboard_generator",
  "scene_generator",
  "asset_generator",
  "voiceover_generator",
  "thumbnail_generator",
  "video_composer",
  "seo_generator",
  "publisher",
  "analytics",
] as const;

export type PipelineStepId = (typeof PIPELINE_STEP_IDS)[number];

export type PipelineStepDefinition = {
  id: PipelineStepId;
  label: string;
  moduleKey: string;
  projectStatus: StudioProjectStatus;
  progressPercent: number;
  estimatedSeconds: number;
};

export const PIPELINE_STEPS: readonly PipelineStepDefinition[] = [
  {
    id: "trend_research",
    label: "Trend Research",
    moduleKey: "trend-research",
    projectStatus: "researching",
    progressPercent: 8,
    estimatedSeconds: 30,
  },
  {
    id: "ai_research",
    label: "AI Research",
    moduleKey: "ai-research",
    projectStatus: "researching",
    progressPercent: 16,
    estimatedSeconds: 45,
  },
  {
    id: "script_generator",
    label: "Script Generation",
    moduleKey: "script-generator",
    projectStatus: "writing",
    progressPercent: 28,
    estimatedSeconds: 60,
  },
  {
    id: "storyboard_generator",
    label: "Storyboard",
    moduleKey: "storyboard-generator",
    projectStatus: "storyboarding",
    progressPercent: 40,
    estimatedSeconds: 45,
  },
  {
    id: "scene_generator",
    label: "Scene Generation",
    moduleKey: "scene-generator",
    projectStatus: "storyboarding",
    progressPercent: 52,
    estimatedSeconds: 60,
  },
  {
    id: "asset_generator",
    label: "Asset Generation",
    moduleKey: "asset-generator",
    projectStatus: "generating_assets",
    progressPercent: 60,
    estimatedSeconds: 90,
  },
  {
    id: "voiceover_generator",
    label: "Voiceover",
    moduleKey: "voiceover-generator",
    projectStatus: "creating_voice",
    progressPercent: 72,
    estimatedSeconds: 75,
  },
  {
    id: "thumbnail_generator",
    label: "Thumbnail",
    moduleKey: "thumbnail-generator",
    projectStatus: "generating_assets",
    progressPercent: 80,
    estimatedSeconds: 45,
  },
  {
    id: "video_composer",
    label: "Video Composition",
    moduleKey: "video-composer",
    projectStatus: "rendering_video",
    progressPercent: 90,
    estimatedSeconds: 120,
  },
  {
    id: "seo_generator",
    label: "SEO Package",
    moduleKey: "seo-generator",
    projectStatus: "writing",
    progressPercent: 94,
    estimatedSeconds: 30,
  },
  {
    id: "publisher",
    label: "Publisher",
    moduleKey: "publisher",
    projectStatus: "rendering_video",
    progressPercent: 97,
    estimatedSeconds: 45,
  },
  {
    id: "analytics",
    label: "Analytics Setup",
    moduleKey: "analytics",
    projectStatus: "completed",
    progressPercent: 100,
    estimatedSeconds: 15,
  },
] as const;

export type PipelineContext = {
  projectId: string;
  userId: string;
  input: StudioGenerateInput;
  metadata: Record<string, unknown>;
};

export type PipelineStepResult = {
  output: Record<string, unknown>;
  metadataPatch?: Record<string, unknown>;
};

export function getStepDefinition(stepId: PipelineStepId): PipelineStepDefinition {
  const step = PIPELINE_STEPS.find((item) => item.id === stepId);
  if (!step) {
    throw new Error(`Unknown pipeline step: ${stepId}`);
  }
  return step;
}

export function getNextStepId(
  currentStepId: PipelineStepId | null,
): PipelineStepId | null {
  if (!currentStepId) {
    return PIPELINE_STEPS[0]?.id ?? null;
  }

  const index = PIPELINE_STEPS.findIndex((step) => step.id === currentStepId);
  if (index === -1 || index >= PIPELINE_STEPS.length - 1) {
    return null;
  }

  return PIPELINE_STEPS[index + 1]?.id ?? null;
}

export function estimateCompletionFromStep(stepId: PipelineStepId | null): Date {
  const startIndex = stepId
    ? PIPELINE_STEPS.findIndex((step) => step.id === stepId)
    : 0;
  const remainingSeconds = PIPELINE_STEPS.slice(Math.max(0, startIndex)).reduce(
    (total, step) => total + step.estimatedSeconds,
    0,
  );

  return new Date(Date.now() + remainingSeconds * 1000);
}

export const PROJECT_STATUS_LABELS: Record<StudioProjectStatus, string> = {
  queued: "Queued",
  researching: "Researching",
  writing: "Writing Script",
  storyboarding: "Generating Storyboard",
  storyboard_complete: "Storyboard Complete",
  generating_assets: "Generating Assets",
  creating_voice: "Creating Voice",
  rendering_video: "Rendering Video",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};
