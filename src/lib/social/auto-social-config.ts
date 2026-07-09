import { getMinDailyAutoPosts } from "@/lib/social/auto-post-types";

/**
 * When enabled (default), generated replies/posts are auto-approved and
 * published by the social cron worker up to the daily tweet cap.
 * Set SOCIAL_AUTO_APPROVE=false to restore manual approval.
 */
export function isSocialAutoApproveEnabled(): boolean {
  const raw = process.env.SOCIAL_AUTO_APPROVE?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "off") {
    return false;
  }
  return true;
}

/** Default leaves headroom for replies on top of the 7–9 daily auto-post mix. */
const DEFAULT_DAILY_TWEET_LIMIT = 12;
const MAX_DAILY_TWEET_LIMIT = 20;

/**
 * Combined daily cap for original posts + replies (all social surfaces).
 * Default: 12 tweets per UTC day (7–9 auto-posts + reply budget).
 * Hard max: 20.
 */
export function getDailyTweetLimit(): number {
  const raw = process.env.SOCIAL_DAILY_TWEET_LIMIT?.trim();
  if (!raw) {
    return DEFAULT_DAILY_TWEET_LIMIT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_DAILY_TWEET_LIMIT;
  }
  return Math.min(parsed, MAX_DAILY_TWEET_LIMIT);
}

/** Minimum recommended limit so the full daily content mix can publish. */
export function getRecommendedDailyTweetLimit(): number {
  return getMinDailyAutoPosts() + 3;
}
