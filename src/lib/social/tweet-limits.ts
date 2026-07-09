import { prisma } from "@/lib/db";
import { getDailyTweetLimit } from "@/lib/social/auto-social-config";

export const MIN_MINUTES_BETWEEN_TWEETS = 30;

const MS_BETWEEN_TWEETS = MIN_MINUTES_BETWEEN_TWEETS * 60 * 1000;

/**
 * Daily limits use UTC calendar days on `postedAt`.
 */
function getUtcDayBounds(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function getDailyTweetCount(
  date: Date = new Date(),
): Promise<number> {
  const { start, end } = getUtcDayBounds(date);

  const [postCount, replyCount, engageCount] = await Promise.all([
    prisma.socialPost.count({
      where: {
        status: "posted",
        postedAt: { gte: start, lt: end },
      },
    }),
    prisma.socialReply.count({
      where: {
        status: "posted",
        postedAt: { gte: start, lt: end },
      },
    }),
    prisma.engageReplyDraft.count({
      where: {
        status: "posted",
        postedAt: { gte: start, lt: end },
      },
    }),
  ]);

  return postCount + replyCount + engageCount;
}

export async function getLastTweetPostedAt(): Promise<Date | null> {
  const [lastPost, lastReply, lastEngage] = await Promise.all([
    prisma.socialPost.findFirst({
      where: { status: "posted", postedAt: { not: null } },
      orderBy: { postedAt: "desc" },
      select: { postedAt: true },
    }),
    prisma.socialReply.findFirst({
      where: { status: "posted", postedAt: { not: null } },
      orderBy: { postedAt: "desc" },
      select: { postedAt: true },
    }),
    prisma.engageReplyDraft.findFirst({
      where: { status: "posted", postedAt: { not: null } },
      orderBy: { postedAt: "desc" },
      select: { postedAt: true },
    }),
  ]);

  const dates = [
    lastPost?.postedAt,
    lastReply?.postedAt,
    lastEngage?.postedAt,
  ].filter((d): d is Date => d != null);

  if (dates.length === 0) {
    return null;
  }

  return dates.reduce((latest, current) =>
    current > latest ? current : latest,
  );
}

export type CanTweetNowResult = {
  allowed: boolean;
  reason?: string;
  nextAvailableAt?: Date;
  dailyCount: number;
  dailyLimit: number;
};

function formatLimitReason(
  kind: "daily" | "cooldown",
  nextAvailableAt: Date,
  dailyLimit: number,
): string {
  const timeLabel = nextAvailableAt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });

  if (kind === "daily") {
    return `Daily X tweet limit reached (${dailyLimit} tweets per UTC day across posts and replies). Next slot after ${timeLabel}.`;
  }

  return `Minimum ${MIN_MINUTES_BETWEEN_TWEETS} minutes between X tweets. Next slot at ${timeLabel}.`;
}

export async function canTweetNow(): Promise<CanTweetNowResult> {
  const now = new Date();
  const dailyLimit = getDailyTweetLimit();
  const dailyCount = await getDailyTweetCount(now);

  if (dailyCount >= dailyLimit) {
    const { end } = getUtcDayBounds(now);
    return {
      allowed: false,
      reason: formatLimitReason("daily", end, dailyLimit),
      nextAvailableAt: end,
      dailyCount,
      dailyLimit,
    };
  }

  const lastPostedAt = await getLastTweetPostedAt();
  if (lastPostedAt) {
    const nextAvailableAt = new Date(
      lastPostedAt.getTime() + MS_BETWEEN_TWEETS,
    );
    if (nextAvailableAt > now) {
      return {
        allowed: false,
        reason: formatLimitReason("cooldown", nextAvailableAt, dailyLimit),
        nextAvailableAt,
        dailyCount,
        dailyLimit,
      };
    }
  }

  return {
    allowed: true,
    dailyCount,
    dailyLimit,
  };
}
