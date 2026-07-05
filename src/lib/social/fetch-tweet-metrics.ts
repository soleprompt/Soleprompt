import { getStoredXCredentials } from "@/lib/social/x-connection";
import { buildOAuthAuthorizationHeader } from "@/lib/social/x-oauth";

export type TweetPublicMetrics = {
  likeCount: number;
  impressionCount: number;
  replyCount: number;
  retweetCount: number;
  quoteCount: number;
};

type XMetricsResponse = {
  data?: {
    id?: string;
    public_metrics?: {
      like_count?: number;
      impression_count?: number;
      reply_count?: number;
      retweet_count?: number;
      quote_count?: number;
    };
  };
  errors?: { message?: string; detail?: string }[];
  detail?: string;
};

function buildTweetLookupUrl(tweetId: string): string {
  const base = `https://api.twitter.com/2/tweets/${tweetId}`;
  const params = new URLSearchParams({
    "tweet.fields": "public_metrics",
  });
  return `${base}?${params.toString()}`;
}

export async function fetchTweetPublicMetrics(
  tweetId: string,
): Promise<
  | { ok: true; metrics: TweetPublicMetrics }
  | { ok: false; error: string }
> {
  const trimmedId = tweetId.trim();
  if (!/^\d{5,25}$/.test(trimmedId)) {
    return { ok: false, error: "Invalid tweet ID." };
  }

  const creds = await getStoredXCredentials();
  if (!creds) {
    return {
      ok: false,
      error: "X is not connected. Connect an account to fetch metrics.",
    };
  }

  const url = buildTweetLookupUrl(trimmedId);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: buildOAuthAuthorizationHeader(
          "GET",
          url.split("?")[0]!,
          { apiKey: creds.apiKey, apiSecret: creds.apiSecret },
          { key: creds.accessToken, secret: creds.accessSecret },
          Object.fromEntries(new URL(url).searchParams.entries()),
        ),
      },
    });

    const body = await response.text();
    let payload: XMetricsResponse = {};
    if (body.trim()) {
      try {
        payload = JSON.parse(body) as XMetricsResponse;
      } catch {
        return {
          ok: false,
          error: `X API returned non-JSON response (HTTP ${response.status}).`,
        };
      }
    }

    if (!response.ok) {
      const message =
        payload.errors?.map((e) => e.message ?? e.detail).filter(Boolean).join("; ") ??
        payload.detail ??
        `X API returned HTTP ${response.status}.`;
      return { ok: false, error: message };
    }

    const pm = payload.data?.public_metrics;
    if (!pm) {
      return { ok: false, error: "No public metrics returned for this tweet." };
    }

    return {
      ok: true,
      metrics: {
        likeCount: pm.like_count ?? 0,
        impressionCount: pm.impression_count ?? 0,
        replyCount: pm.reply_count ?? 0,
        retweetCount: pm.retweet_count ?? 0,
        quoteCount: pm.quote_count ?? 0,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error fetching metrics";
    return { ok: false, error: message };
  }
}
