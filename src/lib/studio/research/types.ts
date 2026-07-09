import type { StudioResearchStatus } from "@/generated/prisma/client";

export type CompetitorChannel = {
  channelName: string;
  contentAngle: string;
  strength: string;
  gapToExploit: string;
};

export type KeywordCluster = {
  theme: string;
  keywords: string[];
};

export type ThumbnailPsychologyTip = {
  principle: string;
  recommendation: string;
};

export type StudioResearchContent = {
  targetAudience: string;
  searchIntent: string;
  competitorChannels: CompetitorChannel[];
  trendingVideoAngles: string[];
  viralHooks: string[];
  keywordClusters: KeywordCluster[];
  longTailKeywords: string[];
  questionsPeopleAsk: string[];
  emotionalTriggers: string[];
  thumbnailPsychology: ThumbnailPsychologyTip[];
  viewerObjections: string[];
  retentionOpportunities: string[];
  suggestedCta: string;
  monetizationIdeas: string[];
  affiliateOpportunities: string[];
};

export type StudioResearchInput = {
  topic: string;
  niche?: string;
  videoType?: string;
  tone?: string;
  trendingAngles?: string[];
};

export type StudioResearchRecord = StudioResearchContent & {
  id: string;
  userId: string;
  projectId: string | null;
  topic: string;
  niche: string | null;
  videoType: string | null;
  tone: string | null;
  status: StudioResearchStatus;
  error: string | null;
  provider: string | null;
  model: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const RESEARCH_STATUS_LABELS: Record<StudioResearchStatus, string> = {
  queued: "Queued",
  researching: "Researching",
  completed: "Completed",
  failed: "Failed",
};
