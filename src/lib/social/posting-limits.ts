import { prisma } from "@/lib/db";

export const MAX_DAILY_X_POSTS = 3;
export const MIN_HOURS_BETWEEN_X_POSTS = 4;

const MS_BETWEEN_POSTS = MIN_HOURS_BETWEEN_X_POSTS * 60 * 60 * 1000;

/**
 * Daily limits use UTC calendar days on `postedAt`.
 * A "day" is midnight–midnight UTC; the count resets at 00:00 UTC.
 */
function getUtcDayBounds(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function getDailyPostCount(date: Date = new Date()): Promise<number> {
  const { start, end } = getUtcDayBounds(date);

  return prisma.socialPost.count({
    where: {
      status: "posted",
      postedAt: { gte: start, lt: end },
    },
  });
}

export async function getLastPostedAt(): Promise<Date | null> {
  const last = await prisma.socialPost.findFirst({
    where: { status: "posted", postedAt: { not: null } },
    orderBy: { postedAt: "desc" },
    select: { postedAt: true },
  });

  return last?.postedAt ?? null;
}

export type CanPostNowResult = {
  allowed: boolean;
  reason?: string;
  nextAvailableAt?: Date;
  dailyCount: number;
  dailyLimit: number;
};

function formatLimitReason(
  kind: "daily" | "cooldown",
  nextAvailableAt: Date,
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
    return `Daily X posting limit reached (${MAX_DAILY_X_POSTS} posts per UTC day). Next slot after ${timeLabel}.`;
  }

  return `Minimum ${MIN_HOURS_BETWEEN_X_POSTS} hours between X posts. Next slot at ${timeLabel}.`;
}

export async function canPostNow(): Promise<CanPostNowResult> {
  const now = new Date();
  const dailyCount = await getDailyPostCount(now);

  if (dailyCount >= MAX_DAILY_X_POSTS) {
    const { end } = getUtcDayBounds(now);
    return {
      allowed: false,
      reason: formatLimitReason("daily", end),
      nextAvailableAt: end,
      dailyCount,
      dailyLimit: MAX_DAILY_X_POSTS,
    };
  }

  const lastPostedAt = await getLastPostedAt();
  if (lastPostedAt) {
    const nextAvailableAt = new Date(lastPostedAt.getTime() + MS_BETWEEN_POSTS);
    if (nextAvailableAt > now) {
      return {
        allowed: false,
        reason: formatLimitReason("cooldown", nextAvailableAt),
        nextAvailableAt,
        dailyCount,
        dailyLimit: MAX_DAILY_X_POSTS,
      };
    }
  }

  return {
    allowed: true,
    dailyCount,
    dailyLimit: MAX_DAILY_X_POSTS,
  };
}
