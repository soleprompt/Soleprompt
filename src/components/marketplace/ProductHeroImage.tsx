import { resolvePromptCoverImage } from "@/lib/tool-images";
import { BADGE_STYLES, getPromptBadges } from "@/lib/prompt-badges";
import type { Prompt } from "@/types";
import { cn } from "@/lib/utils";

interface ProductHeroImageProps {
  prompt: Prompt & { createdAt?: string | Date };
  trendingIds?: string[];
  className?: string;
}

export function ProductHeroImage({
  prompt,
  trendingIds,
  className,
}: ProductHeroImageProps) {
  const src = resolvePromptCoverImage(prompt);
  const badges = getPromptBadges(prompt, {
    trendingIds: trendingIds ? new Set(trendingIds) : undefined,
  });

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-[#0a0a12] shadow-lg shadow-electric/5",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge.type}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm",
              BADGE_STYLES[badge.type],
            )}
          >
            {badge.label}
          </span>
        ))}
      </div>
    </div>
  );
}
