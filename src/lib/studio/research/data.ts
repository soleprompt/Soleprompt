import "server-only";

import type { Prisma, StudioResearchStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { GenerateResearchResult } from "@/lib/studio/research/generate";
import type {
  CompetitorChannel,
  KeywordCluster,
  StudioResearchContent,
  StudioResearchInput,
  StudioResearchRecord,
  ThumbnailPsychologyTip,
} from "@/lib/studio/research/types";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toCompetitorChannels(value: unknown): CompetitorChannel[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (
      typeof record.channelName !== "string" ||
      typeof record.contentAngle !== "string" ||
      typeof record.strength !== "string" ||
      typeof record.gapToExploit !== "string"
    ) {
      return [];
    }
    return [
      {
        channelName: record.channelName,
        contentAngle: record.contentAngle,
        strength: record.strength,
        gapToExploit: record.gapToExploit,
      },
    ];
  });
}

function toKeywordClusters(value: unknown): KeywordCluster[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.theme !== "string" || !Array.isArray(record.keywords)) {
      return [];
    }
    return [
      {
        theme: record.theme,
        keywords: toStringArray(record.keywords),
      },
    ];
  });
}

function toThumbnailPsychology(value: unknown): ThumbnailPsychologyTip[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (
      typeof record.principle !== "string" ||
      typeof record.recommendation !== "string"
    ) {
      return [];
    }
    return [
      {
        principle: record.principle,
        recommendation: record.recommendation,
      },
    ];
  });
}

export function serializeStudioResearch(row: {
  id: string;
  userId: string;
  projectId: string | null;
  topic: string;
  niche: string | null;
  videoType: string | null;
  tone: string | null;
  status: StudioResearchStatus;
  error: string | null;
  targetAudience: string | null;
  searchIntent: string | null;
  competitorChannels: unknown;
  trendingVideoAngles: unknown;
  viralHooks: unknown;
  keywordClusters: unknown;
  longTailKeywords: unknown;
  questionsPeopleAsk: unknown;
  emotionalTriggers: unknown;
  thumbnailPsychology: unknown;
  viewerObjections: unknown;
  retentionOpportunities: unknown;
  suggestedCta: string | null;
  monetizationIdeas: unknown;
  affiliateOpportunities: unknown;
  provider: string | null;
  model: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): StudioResearchRecord {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId,
    topic: row.topic,
    niche: row.niche,
    videoType: row.videoType,
    tone: row.tone,
    status: row.status,
    error: row.error,
    targetAudience: row.targetAudience ?? "",
    searchIntent: row.searchIntent ?? "",
    competitorChannels: toCompetitorChannels(row.competitorChannels),
    trendingVideoAngles: toStringArray(row.trendingVideoAngles),
    viralHooks: toStringArray(row.viralHooks),
    keywordClusters: toKeywordClusters(row.keywordClusters),
    longTailKeywords: toStringArray(row.longTailKeywords),
    questionsPeopleAsk: toStringArray(row.questionsPeopleAsk),
    emotionalTriggers: toStringArray(row.emotionalTriggers),
    thumbnailPsychology: toThumbnailPsychology(row.thumbnailPsychology),
    viewerObjections: toStringArray(row.viewerObjections),
    retentionOpportunities: toStringArray(row.retentionOpportunities),
    suggestedCta: row.suggestedCta ?? "",
    monetizationIdeas: toStringArray(row.monetizationIdeas),
    affiliateOpportunities: toStringArray(row.affiliateOpportunities),
    provider: row.provider,
    model: row.model,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function contentToDbFields(content: StudioResearchContent & {
  provider: string;
  model: string;
}): Prisma.StudioResearchUpdateInput {
  return {
    targetAudience: content.targetAudience,
    searchIntent: content.searchIntent,
    competitorChannels: content.competitorChannels,
    trendingVideoAngles: content.trendingVideoAngles,
    viralHooks: content.viralHooks,
    keywordClusters: content.keywordClusters,
    longTailKeywords: content.longTailKeywords,
    questionsPeopleAsk: content.questionsPeopleAsk,
    emotionalTriggers: content.emotionalTriggers,
    thumbnailPsychology: content.thumbnailPsychology,
    viewerObjections: content.viewerObjections,
    retentionOpportunities: content.retentionOpportunities,
    suggestedCta: content.suggestedCta,
    monetizationIdeas: content.monetizationIdeas,
    affiliateOpportunities: content.affiliateOpportunities,
    provider: content.provider,
    model: content.model,
  };
}

export async function createQueuedResearch(
  userId: string,
  input: StudioResearchInput,
  projectId?: string,
) {
  const row = await prisma.studioResearch.create({
    data: {
      userId,
      projectId: projectId ?? null,
      topic: input.topic,
      niche: input.niche ?? null,
      videoType: input.videoType ?? null,
      tone: input.tone ?? null,
      status: "queued",
    },
  });

  return serializeStudioResearch(row);
}

export async function markResearchResearching(researchId: string) {
  const row = await prisma.studioResearch.update({
    where: { id: researchId },
    data: { status: "researching", error: null },
  });

  return serializeStudioResearch(row);
}

export async function saveResearchResults(
  researchId: string,
  content: GenerateResearchResult,
) {
  const row = await prisma.studioResearch.update({
    where: { id: researchId },
    data: {
      ...contentToDbFields(content),
      status: "completed",
      completedAt: new Date(),
      error: null,
    },
  });

  return serializeStudioResearch(row);
}

export async function markResearchFailed(researchId: string, error: string) {
  const row = await prisma.studioResearch.update({
    where: { id: researchId },
    data: {
      status: "failed",
      error,
    },
  });

  return serializeStudioResearch(row);
}

export async function getResearchForUser(
  researchId: string,
  userId: string,
): Promise<StudioResearchRecord | null> {
  const row = await prisma.studioResearch.findFirst({
    where: { id: researchId, userId },
  });

  return row ? serializeStudioResearch(row) : null;
}

export async function getResearchForProject(
  projectId: string,
  userId: string,
): Promise<StudioResearchRecord | null> {
  const row = await prisma.studioResearch.findFirst({
    where: { projectId, userId },
  });

  return row ? serializeStudioResearch(row) : null;
}

export async function getOrCreateProjectResearch(
  userId: string,
  projectId: string,
  input: StudioResearchInput,
) {
  const existing = await prisma.studioResearch.findFirst({
    where: { projectId, userId },
  });

  if (existing) {
    return serializeStudioResearch(existing);
  }

  return createQueuedResearch(userId, input, projectId);
}
