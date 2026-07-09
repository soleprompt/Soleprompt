import { ArrowRight, Clapperboard } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
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
      <div className="rounded-2xl border border-dashed border-border bg-card/30 px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-electric/10">
          <Clapperboard className="h-6 w-6 text-electric" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No packages yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Enter a topic above and generate your first full YouTube package — titles,
          script, description, tags, and more.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Recent packages</h2>
      <ul className="space-y-2">
        {packages.map((pkg) => {
          const toneLabel = labelForTone(pkg.tone);

          return (
            <li key={pkg.id}>
              <Link
                href={`/studio/${pkg.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/50 px-4 py-4 transition-colors hover:border-electric/30 hover:bg-card"
              >
                <div className="min-w-0 space-y-2">
                  <p className="truncate font-medium group-hover:text-electric">
                    {pkg.topic}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="electric">{labelForVideoType(pkg.videoType)}</Badge>
                    {toneLabel && <Badge variant="purple">{toneLabel}</Badge>}
                    {pkg.niche && (
                      <span className="truncate text-xs text-muted-foreground">
                        {pkg.niche}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">{formatDate(pkg.createdAt)}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
