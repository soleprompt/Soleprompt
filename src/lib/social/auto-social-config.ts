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

/**
 * Combined daily cap for original posts + replies (all social surfaces).
 * Hard default: 10 tweets per UTC day.
 */
export function getDailyTweetLimit(): number {
  const raw = process.env.SOCIAL_DAILY_TWEET_LIMIT?.trim();
  if (!raw) {
    return 10;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 10;
  }
  return Math.min(parsed, 10);
}
