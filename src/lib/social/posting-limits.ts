import {
  canTweetNow,
  getDailyTweetCount,
  getLastTweetPostedAt,
  type CanTweetNowResult,
} from "@/lib/social/tweet-limits";

/** @deprecated Use tweet-limits — kept for API compatibility. */
export const MAX_DAILY_X_POSTS = 12;

/** @deprecated Cooldown is unified in tweet-limits. */
export const MIN_HOURS_BETWEEN_X_POSTS = 0.5;

export type CanPostNowResult = CanTweetNowResult;

export async function getDailyPostCount(date: Date = new Date()): Promise<number> {
  return getDailyTweetCount(date);
}

export async function getLastPostedAt(): Promise<Date | null> {
  return getLastTweetPostedAt();
}

export async function canPostNow(): Promise<CanPostNowResult> {
  return canTweetNow();
}
