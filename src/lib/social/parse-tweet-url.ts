const TWEET_ID_PATTERN = /^\d{5,25}$/;
const TWEET_URL_PATTERN =
  /(?:twitter\.com|x\.com)\/(?:[^/]+\/)?status(?:es)?\/(\d{5,25})/i;

export type ParsedTweetRef = {
  tweetId: string;
  tweetUrl: string;
  authorHandle?: string;
};

export function parseTweetInput(input: string): ParsedTweetRef | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (TWEET_ID_PATTERN.test(trimmed)) {
    return {
      tweetId: trimmed,
      tweetUrl: `https://x.com/i/web/status/${trimmed}`,
    };
  }

  const urlMatch = trimmed.match(TWEET_URL_PATTERN);
  if (urlMatch?.[1]) {
    const tweetId = urlMatch[1];
    const authorMatch = trimmed.match(
      /(?:twitter\.com|x\.com)\/(@?[A-Za-z0-9_]{1,15})\/status/i,
    );
    const rawHandle = authorMatch?.[1];
    const authorHandle = rawHandle?.startsWith("@")
      ? rawHandle
      : rawHandle
        ? `@${rawHandle}`
        : undefined;

    return {
      tweetId,
      tweetUrl: trimmed.split("?")[0] ?? trimmed,
      authorHandle,
    };
  }

  return null;
}
