import type { SocialPostType } from "@/generated/prisma/client";

export type AutoPostType = SocialPostType;

export const AUTO_POST_TYPES: AutoPostType[] = [
  "original",
  "demo_video",
  "customer_win",
  "ai_tip",
  "youtube_example",
];

export const AUTO_POST_TYPE_LABELS: Record<AutoPostType, string> = {
  original: "Original",
  demo_video: "Demo video",
  customer_win: "Customer win",
  ai_tip: "AI tip",
  youtube_example: "YouTube example",
};

/** Fixed daily quota for non-original post types. */
export const FIXED_DAILY_QUOTAS: Record<
  Exclude<AutoPostType, "original">,
  number
> = {
  demo_video: 1,
  customer_win: 1,
  ai_tip: 1,
  youtube_example: 1,
};

export const DEFAULT_ORIGINAL_POST_MIN = 3;
export const DEFAULT_ORIGINAL_POST_MAX = 5;

export type DailyPostQuotas = Record<AutoPostType, number>;

function readOriginalBounds(): { min: number; max: number } {
  const minRaw = process.env.SOCIAL_ORIGINAL_POST_MIN?.trim();
  const maxRaw = process.env.SOCIAL_ORIGINAL_POST_MAX?.trim();

  let min = DEFAULT_ORIGINAL_POST_MIN;
  let max = DEFAULT_ORIGINAL_POST_MAX;

  if (minRaw) {
    const parsed = Number.parseInt(minRaw, 10);
    if (Number.isFinite(parsed) && parsed >= 1) {
      min = Math.min(parsed, DEFAULT_ORIGINAL_POST_MAX);
    }
  }

  if (maxRaw) {
    const parsed = Number.parseInt(maxRaw, 10);
    if (Number.isFinite(parsed) && parsed >= 1) {
      max = Math.max(parsed, min);
    }
  }

  return { min, max };
}

/**
 * Original count varies within min–max per UTC day (stable for the whole day).
 * Other types have fixed quotas of 1 each.
 */
export function getDailyPostQuotas(date: Date = new Date()): DailyPostQuotas {
  const { min, max } = readOriginalBounds();
  const dayKey =
    date.getUTCFullYear() * 10_000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate();
  const originalRange = max - min + 1;
  const originalCount = min + (dayKey % originalRange);

  return {
    original: originalCount,
    demo_video: FIXED_DAILY_QUOTAS.demo_video,
    customer_win: FIXED_DAILY_QUOTAS.customer_win,
    ai_tip: FIXED_DAILY_QUOTAS.ai_tip,
    youtube_example: FIXED_DAILY_QUOTAS.youtube_example,
  };
}

/** Minimum auto-posts per day (min originals + 4 fixed types). */
export function getMinDailyAutoPosts(): number {
  const { min } = readOriginalBounds();
  const fixedTotal = Object.values(FIXED_DAILY_QUOTAS).reduce(
    (sum, n) => sum + n,
    0,
  );
  return min + fixedTotal;
}
