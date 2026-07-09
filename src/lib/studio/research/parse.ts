import type {
  CompetitorChannel,
  KeywordCluster,
  StudioResearchContent,
  ThumbnailPsychologyTip,
} from "@/lib/studio/research/types";

function asRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${field}: expected non-empty string.`);
  }
  return value.trim();
}

function asStringArray(value: unknown, field: string, min = 1): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${field}: expected string array.`);
  }

  const items = value.filter((item): item is string => typeof item === "string");
  if (items.length < min) {
    throw new Error(`Invalid ${field}: expected at least ${min} entries.`);
  }

  return items.map((item) => item.trim()).filter(Boolean);
}

function asCompetitorChannels(value: unknown): CompetitorChannel[] {
  if (!Array.isArray(value) || value.length < 3) {
    throw new Error("Invalid competitorChannels: expected at least 3 entries.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid competitorChannels[${index}].`);
    }

    const record = item as Record<string, unknown>;
    return {
      channelName: asRequiredString(record.channelName, `competitorChannels[${index}].channelName`),
      contentAngle: asRequiredString(record.contentAngle, `competitorChannels[${index}].contentAngle`),
      strength: asRequiredString(record.strength, `competitorChannels[${index}].strength`),
      gapToExploit: asRequiredString(record.gapToExploit, `competitorChannels[${index}].gapToExploit`),
    };
  });
}

function asKeywordClusters(value: unknown): KeywordCluster[] {
  if (!Array.isArray(value) || value.length < 3) {
    throw new Error("Invalid keywordClusters: expected at least 3 clusters.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid keywordClusters[${index}].`);
    }

    const record = item as Record<string, unknown>;
    return {
      theme: asRequiredString(record.theme, `keywordClusters[${index}].theme`),
      keywords: asStringArray(record.keywords, `keywordClusters[${index}].keywords`, 2),
    };
  });
}

function asThumbnailPsychology(value: unknown): ThumbnailPsychologyTip[] {
  if (!Array.isArray(value) || value.length < 3) {
    throw new Error("Invalid thumbnailPsychology: expected at least 3 entries.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid thumbnailPsychology[${index}].`);
    }

    const record = item as Record<string, unknown>;
    return {
      principle: asRequiredString(record.principle, `thumbnailPsychology[${index}].principle`),
      recommendation: asRequiredString(
        record.recommendation,
        `thumbnailPsychology[${index}].recommendation`,
      ),
    };
  });
}

export function parseStudioResearchContent(raw: unknown): StudioResearchContent {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI response was not a JSON object.");
  }

  const record = raw as Record<string, unknown>;

  return {
    targetAudience: asRequiredString(record.targetAudience, "targetAudience"),
    searchIntent: asRequiredString(record.searchIntent, "searchIntent"),
    competitorChannels: asCompetitorChannels(record.competitorChannels),
    trendingVideoAngles: asStringArray(record.trendingVideoAngles, "trendingVideoAngles", 5),
    viralHooks: asStringArray(record.viralHooks, "viralHooks", 5),
    keywordClusters: asKeywordClusters(record.keywordClusters),
    longTailKeywords: asStringArray(record.longTailKeywords, "longTailKeywords", 8),
    questionsPeopleAsk: asStringArray(record.questionsPeopleAsk, "questionsPeopleAsk", 6),
    emotionalTriggers: asStringArray(record.emotionalTriggers, "emotionalTriggers", 4),
    thumbnailPsychology: asThumbnailPsychology(record.thumbnailPsychology),
    viewerObjections: asStringArray(record.viewerObjections, "viewerObjections", 3),
    retentionOpportunities: asStringArray(
      record.retentionOpportunities,
      "retentionOpportunities",
      4,
    ),
    suggestedCta: asRequiredString(record.suggestedCta, "suggestedCta"),
    monetizationIdeas: asStringArray(record.monetizationIdeas, "monetizationIdeas", 3),
    affiliateOpportunities: asStringArray(
      record.affiliateOpportunities,
      "affiliateOpportunities",
      3,
    ),
  };
}
