import type {
  StudioAssetType,
  StudioLogLevel,
  StudioProjectStatus,
} from "@/generated/prisma/client";
import type { StudioResearchRecord } from "@/lib/studio/research/types";
import type { StudioGenerateInput } from "@/lib/studio/types";

export type StudioProjectLogRecord = {
  id: string;
  level: StudioLogLevel;
  step: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type StudioProjectSummary = {
  id: string;
  topic: string;
  niche: string | null;
  videoType: string;
  tone: string | null;
  status: StudioProjectStatus;
  currentStep: string | null;
  progressPercent: number;
  estimatedCompletionAt: string | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  packageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudioProjectDetail = StudioProjectSummary & {
  metadata: Record<string, unknown> | null;
  logs: StudioProjectLogRecord[];
  research: StudioResearchRecord | null;
  sceneCount: number;
  assetCount: number;
  voiceoverCount: number;
  videoCount: number;
  thumbnailCount: number;
  uploadCount: number;
  analyticsCount: number;
};

export type CreateStudioProjectInput = StudioGenerateInput;

export type StudioProjectStatusPayload = {
  id: string;
  status: StudioProjectStatus;
  currentStep: string | null;
  progressPercent: number;
  estimatedCompletionAt: string | null;
  error: string | null;
  completedAt: string | null;
  logs: StudioProjectLogRecord[];
  research: StudioResearchRecord | null;
  sceneCount: number;
};

export type StudioAssetRecord = {
  id: string;
  type: StudioAssetType;
  name: string;
  url: string | null;
  provider: string | null;
};
