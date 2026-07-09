import {
  canTweetNow,
  getDailyTweetCount,
  getLastTweetPostedAt,
  type CanTweetNowResult,
} from "@/lib/social/tweet-limits";

/** @deprecated Use tweet-limits — kept for API compatibility. */
export const MAX_REPLIES_PER_DAY = 10;

/** @deprecated Cooldown is unified in tweet-limits. */
export const MIN_HOURS_BETWEEN_REPLIES = 0.5;

export type CanReplyNowResult = CanTweetNowResult;

export async function getDailyReplyCount(
  date: Date = new Date(),
): Promise<number> {
  return getDailyTweetCount(date);
}

export async function getLastReplyPostedAt(): Promise<Date | null> {
  return getLastTweetPostedAt();
}

export async function canReplyNow(): Promise<CanReplyNowResult> {
  return canTweetNow();
}
