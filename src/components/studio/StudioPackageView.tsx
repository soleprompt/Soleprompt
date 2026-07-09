import { ArrowLeft, Calendar, Film, Sparkles } from "lucide-react";
import Link from "next/link";
import { CopySection } from "@/components/studio/CopySection";
import { StudioBrandPill } from "@/components/studio/studio-ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  STUDIO_TONE_LABELS,
  STUDIO_VIDEO_TYPE_LABELS,
  type StudioPackageRecord,
  type StudioTone,
  type StudioVideoType,
} from "@/lib/studio/types";

type StudioPackageViewProps = {
  pkg: StudioPackageRecord;
};

function formatTitles(titles: string[]) {
  return titles.map((title, index) => `${index + 1}. ${title}`).join("\n\n");
}

function formatTags(tags: string[]) {
  return tags.join(", ");
}

function formatThumbnailIdeas(ideas: string[]) {
  return ideas.map((idea, index) => `${index + 1}. ${idea}`).join("\n\n");
}

function formatSectionContent(section: {
  heading: string;
  content: string;
  retentionTip?: string;
}) {
  const parts = [`## ${section.heading}`, section.content];
  if (section.retentionTip) {
    parts.push(`[Retention tip: ${section.retentionTip}]`);
  }
  return parts.join("\n\n");
}

function labelForVideoType(value: string) {
  if (value === "shorts" || value === "long-form") {
    return STUDIO_VIDEO_TYPE_LABELS[value as StudioVideoType];
  }
  return value;
}

function labelForTone(value: string | null) {
  if (!value) return null;
  if (value in STUDIO_TONE_LABELS) {
    return STUDIO_TONE_LABELS[value as StudioTone];
  }
  return value;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function StudioPackageView({ pkg }: StudioPackageViewProps) {
  const toneLabel = labelForTone(pkg.tone);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between animate-studio-fade-in-up">
        <div className="space-y-4">
          <Link href="/studio">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Studio
            </Button>
          </Link>
          <div className="space-y-3">
            <StudioBrandPill>
              <Sparkles className="h-3.5 w-3.5" />
              YouTube Package
            </StudioBrandPill>
            <h1 className="text-3xl font-bold tracking-[-0.02em] lg:text-4xl">
              {pkg.topic}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="electric">{labelForVideoType(pkg.videoType)}</Badge>
              {toneLabel && <Badge variant="purple">{toneLabel}</Badge>}
              {pkg.niche && <Badge variant="outline">{pkg.niche}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0 text-electric" />
          {formatDate(pkg.createdAt)}
        </div>
      </div>

      <CopySection title="Title options (5)" content={formatTitles(pkg.titles)} />

      <CopySection title="Full script" content={pkg.script} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CopySection title="Hook" content={pkg.hook} />
        <CopySection title="Intro" content={pkg.intro} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10 text-electric">
            <Film className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Main sections</h2>
        </div>
        {pkg.mainSections.map((section, index) => (
          <CopySection
            key={`${section.heading}-${index}`}
            title={`Section ${index + 1}: ${section.heading}`}
            content={formatSectionContent(section)}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CopySection title="Outro" content={pkg.outro} />
        <CopySection title="Call to action" content={pkg.callToAction} />
      </div>

      <CopySection title="YouTube description" content={pkg.description} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CopySection title="Tags" content={formatTags(pkg.tags)} mono />
        <CopySection
          title="Thumbnail text ideas"
          content={formatThumbnailIdeas(pkg.thumbnailIdeas)}
        />
      </div>

      <CopySection title="Pinned comment" content={pkg.pinnedComment} />
    </div>
  );
}
