import { prisma } from "@/lib/db";

export const MAX_REPLIES_PER_DAY = 10;
export const MIN_HOURS_BETWEEN_REPLIES = 0.5;

const MS_BETWEEN_REPLIES = MIN_HOURS_BETWEEN_REPLIES * 60 * 60 * 1000;

function getUtcDayBounds(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function getDailyReplyCount(
  date: Date = new Date(),
): Promise<number> {
  const { start, end } = getUtcDayBounds(date);

  const [socialCount, engageCount] = await Promise.all([
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

  return socialCount + engageCount;
}

export async function getLastReplyPostedAt(): Promise<Date | null> {
  const [lastSocial, lastEngage] = await Promise.all([
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

  const dates = [lastSocial?.postedAt, lastEngage?.postedAt].filter(
    (d): d is Date => d != null,
  );

  if (dates.length === 0) {
    return null;
  }

  return dates.reduce((latest, current) =>
    current > latest ? current : latest,
  );
}

export type CanReplyNowResult = {
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
    return `Daily X reply limit reached (${MAX_REPLIES_PER_DAY} replies per UTC day). Next slot after ${timeLabel}.`;
  }

  return `Minimum ${MIN_HOURS_BETWEEN_REPLIES * 60} minutes between X replies. Next slot at ${timeLabel}.`;
}

export async function canReplyNow(): Promise<CanReplyNowResult> {
  const now = new Date();
  const dailyCount = await getDailyReplyCount(now);

  if (dailyCount >= MAX_REPLIES_PER_DAY) {
    const { end } = getUtcDayBounds(now);
    return {
      allowed: false,
      reason: formatLimitReason("daily", end),
      nextAvailableAt: end,
      dailyCount,
      dailyLimit: MAX_REPLIES_PER_DAY,
    };
  }

  const lastPostedAt = await getLastReplyPostedAt();
  if (lastPostedAt) {
    const nextAvailableAt = new Date(
      lastPostedAt.getTime() + MS_BETWEEN_REPLIES,
    );
    if (nextAvailableAt > now) {
      return {
        allowed: false,
        reason: formatLimitReason("cooldown", nextAvailableAt),
        nextAvailableAt,
        dailyCount,
        dailyLimit: MAX_REPLIES_PER_DAY,
      };
    }
  }

  return {
    allowed: true,
    dailyCount,
    dailyLimit: MAX_REPLIES_PER_DAY,
  };
}
