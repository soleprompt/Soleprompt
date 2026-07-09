"use client";

import { Loader2, Search } from "lucide-react";
import { CopySection } from "@/components/studio/CopySection";
import {
  StudioAlert,
  StudioEmptyState,
  StudioGlassCard,
  StudioLoadingState,
} from "@/components/studio/studio-ui";
import { Badge } from "@/components/ui/Badge";
import { RESEARCH_STATUS_LABELS } from "@/lib/studio/research/types";
import type { StudioResearchRecord } from "@/lib/studio/research/types";

type StudioResearchPanelProps = {
  research: StudioResearchRecord | null;
};

function formatList(items: string[], numbered = false) {
  if (items.length === 0) return "—";
  return items
    .map((item, index) => (numbered ? `${index + 1}. ${item}` : `• ${item}`))
    .join("\n");
}

function formatCompetitors(
  channels: StudioResearchRecord["competitorChannels"],
) {
  if (channels.length === 0) return "—";
  return channels
    .map(
      (channel, index) =>
        `${index + 1}. ${channel.channelName}\n   Angle: ${channel.contentAngle}\n   Strength: ${channel.strength}\n   Gap: ${channel.gapToExploit}`,
    )
    .join("\n\n");
}

function formatKeywordClusters(clusters: StudioResearchRecord["keywordClusters"]) {
  if (clusters.length === 0) return "—";
  return clusters
    .map((cluster) => `【${cluster.theme}】\n${cluster.keywords.join(", ")}`)
    .join("\n\n");
}

function formatThumbnailPsychology(
  tips: StudioResearchRecord["thumbnailPsychology"],
) {
  if (tips.length === 0) return "—";
  return tips
    .map((tip) => `• ${tip.principle}\n  → ${tip.recommendation}`)
    .join("\n\n");
}

export function StudioResearchPanel({ research }: StudioResearchPanelProps) {
  if (!research) {
    return (
      <StudioGlassCard>
        <StudioEmptyState
          icon={Search}
          variant="purple"
          title="Research pending"
          description="AI research will appear here once the pipeline reaches the Research step."
        />
      </StudioGlassCard>
    );
  }

  const isLoading =
    research.status === "queued" || research.status === "researching";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple/15 text-purple">
            <Search className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">AI Research</h2>
        </div>
        <Badge
          variant={
            research.status === "completed"
              ? "electric"
              : research.status === "failed"
                ? "outline"
                : "purple"
          }
        >
          {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          {RESEARCH_STATUS_LABELS[research.status]}
        </Badge>
      </div>

      {research.error && <StudioAlert variant="error">{research.error}</StudioAlert>}

      {isLoading && (
        <StudioLoadingState
          label="Running AI research"
          sublabel="Analyzing audience, competitors, keywords, and retention angles…"
        />
      )}

      {research.status === "completed" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CopySection title="Target audience" content={research.targetAudience} />
          <CopySection title="Search intent" content={research.searchIntent} />
          <CopySection
            title="Competitor channels"
            content={formatCompetitors(research.competitorChannels)}
            className="lg:col-span-2"
          />
          <CopySection
            title="Trending video angles"
            content={formatList(research.trendingVideoAngles, true)}
          />
          <CopySection
            title="Viral hooks"
            content={formatList(research.viralHooks, true)}
          />
          <CopySection
            title="Keyword clusters"
            content={formatKeywordClusters(research.keywordClusters)}
            className="lg:col-span-2"
          />
          <CopySection
            title="Long-tail keywords"
            content={formatList(research.longTailKeywords)}
            mono
          />
          <CopySection
            title="Questions people ask"
            content={formatList(research.questionsPeopleAsk, true)}
          />
          <CopySection
            title="Emotional triggers"
            content={formatList(research.emotionalTriggers)}
          />
          <CopySection
            title="Thumbnail psychology"
            content={formatThumbnailPsychology(research.thumbnailPsychology)}
          />
          <CopySection
            title="Viewer objections"
            content={formatList(research.viewerObjections, true)}
          />
          <CopySection
            title="Retention opportunities"
            content={formatList(research.retentionOpportunities, true)}
          />
          <CopySection title="Suggested CTA" content={research.suggestedCta} />
          <CopySection
            title="Monetization ideas"
            content={formatList(research.monetizationIdeas, true)}
          />
          <CopySection
            title="Affiliate opportunities"
            content={formatList(research.affiliateOpportunities, true)}
            className="lg:col-span-2"
          />
        </div>
      )}
    </div>
  );
}
