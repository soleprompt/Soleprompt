import { ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  StudioEmptyState,
  StudioGlassCard,
  StudioListItem,
} from "@/components/studio/studio-ui";
import {
  STUDIO_TONE_LABELS,
  STUDIO_VIDEO_TYPE_LABELS,
  type StudioPackageRecord,
  type StudioTone,
  type StudioVideoType,
} from "@/lib/studio/types";

type StudioHistoryProps = {
  packages: StudioPackageRecord[];
};

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
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudioHistory({ packages }: StudioHistoryProps) {
  if (packages.length === 0) {
    return (
      <StudioGlassCard className="animate-studio-fade-in-up studio-stagger-3">
        <StudioEmptyState
          icon={Package}
          variant="electric"
          title="No packages yet"
          description="Enter a topic above and generate your first full YouTube package — titles, script, description, tags, and more."
        />
      </StudioGlassCard>
    );
  }

  return (
    <div className="space-y-4 animate-studio-fade-in-up studio-stagger-3">
      <h2 className="text-lg font-semibold tracking-tight">Recent packages</h2>
      <ul className="space-y-2">
        {packages.map((pkg) => {
          const toneLabel = labelForTone(pkg.tone);

          return (
            <li key={pkg.id}>
              <StudioListItem
                href={`/studio/${pkg.id}`}
                title={pkg.topic}
                accent="electric"
                meta={
                  <>
                    <Badge variant="electric">
                      {labelForVideoType(pkg.videoType)}
                    </Badge>
                    {toneLabel && <Badge variant="purple">{toneLabel}</Badge>}
                    {pkg.niche && (
                      <span className="truncate text-xs text-muted-foreground">
                        {pkg.niche}
                      </span>
                    )}
                  </>
                }
                trailing={
                  <>
                    <span className="hidden sm:inline">
                      {formatDate(pkg.createdAt)}
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
