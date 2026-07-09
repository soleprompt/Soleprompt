import { prisma } from "@/lib/db";
import { isSocialAutoApproveEnabled } from "@/lib/social/auto-social-config";
import { pickAutoPostContent } from "@/lib/social/auto-post-templates";
import {
  AUTO_POST_TYPES,
  type AutoPostType,
  getDailyPostQuotas,
} from "@/lib/social/auto-post-types";
import type { SocialPostStatus } from "@/generated/prisma/client";

const PIPELINE_STATUSES: SocialPostStatus[] = [
  "draft",
  "approved",
  "scheduled",
  "posted",
];

function getUtcDayBounds(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function countTodayPostsByType(
  date: Date = new Date(),
): Promise<Record<AutoPostType, number>> {
  const { start, end } = getUtcDayBounds(date);

  const rows = await prisma.socialPost.groupBy({
    by: ["postType"],
    where: {
      status: { in: PIPELINE_STATUSES },
      OR: [
        { postedAt: { gte: start, lt: end } },
        {
          postedAt: null,
          createdAt: { gte: start, lt: end },
        },
      ],
    },
    _count: { _all: true },
  });

  const counts = Object.fromEntries(
    AUTO_POST_TYPES.map((type) => [type, 0]),
  ) as Record<AutoPostType, number>;

  for (const row of rows) {
    counts[row.postType] = row._count._all;
  }

  return counts;
}

export type EnsureDailyAutoPostsResult = {
  generated: number;
  byType: Partial<Record<AutoPostType, number>>;
  quotas: Record<AutoPostType, number>;
  existing: Record<AutoPostType, number>;
  skipped: boolean;
};

/**
 * Ensures today's auto-post mix exists in the pipeline (draft or approved).
 * Called by the social cron before publishing.
 */
export async function ensureDailyAutoPosts(
  date: Date = new Date(),
): Promise<EnsureDailyAutoPostsResult> {
  const quotas = getDailyPostQuotas(date);
  const existing = await countTodayPostsByType(date);

  if (!isSocialAutoApproveEnabled()) {
    return {
      generated: 0,
      byType: {},
      quotas,
      existing,
      skipped: true,
    };
  }

  const byType: Partial<Record<AutoPostType, number>> = {};
  let generated = 0;
  const autoApprove = isSocialAutoApproveEnabled();
  const status = autoApprove ? "approved" : "draft";

  for (const postType of AUTO_POST_TYPES) {
    const target = quotas[postType];
    const have = existing[postType];
    const needed = Math.max(0, target - have);

    if (needed === 0) {
      continue;
    }

    const creates = Array.from({ length: needed }, () => ({
      postType,
      content: pickAutoPostContent(postType),
      status: status as SocialPostStatus,
    }));

    await prisma.socialPost.createMany({ data: creates });

    byType[postType] = needed;
    generated += needed;
    existing[postType] = have + needed;
  }

  if (generated > 0) {
    console.log("[social] Daily auto-post mix generated", {
      generated,
      byType,
      quotas,
    });
  }

  return { generated, byType, quotas, existing, skipped: false };
}
