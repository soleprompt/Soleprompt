import { getStoredXCredentials } from "@/lib/social/x-connection";
import {
  buildOAuthAuthorizationHeader,
  type XUserCredentials,
} from "@/lib/social/x-oauth";

export type AccountTweet = {
  id: string;
  text: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
};

type XUserLookupResponse = {
  data?: { id?: string; username?: string };
  errors?: { message?: string; detail?: string }[];
  detail?: string;
};

type XUserTweetsResponse = {
  data?: Array<{
    id?: string;
    text?: string;
    created_at?: string;
    public_metrics?: {
      like_count?: number;
      retweet_count?: number;
      reply_count?: number;
    };
  }>;
  meta?: { next_token?: string };
  errors?: { message?: string; detail?: string }[];
  detail?: string;
};

const MAX_RESULTS = 10;

function normalizeUsername(username: string): string {
  return username.trim().replace(/^@/, "").toLowerCase();
}

function buildLookupUrl(username: string): string {
  return `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=id,username`;
}

function buildUserTweetsUrl(xUserId: string): string {
  const base = `https://api.twitter.com/2/users/${xUserId}/tweets`;
  const params = new URLSearchParams({
    max_results: String(MAX_RESULTS),
    "tweet.fields": "created_at,public_metrics,text",
    exclude: "retweets,replies",
  });
  return `${base}?${params.toString()}`;
}

async function xGet<T>(
  creds: XUserCredentials,
  url: string,
): Promise<{ ok: true; payload: T } | { ok: false; error: string }> {
  const urlObj = new URL(url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: buildOAuthAuthorizationHeader(
          "GET",
          `${urlObj.origin}${urlObj.pathname}`,
          { apiKey: creds.apiKey, apiSecret: creds.apiSecret },
          { key: creds.accessToken, secret: creds.accessSecret },
          Object.fromEntries(urlObj.searchParams.entries()),
        ),
      },
    });

    const body = await response.text();
    let payload: T = {} as T;
    if (body.trim()) {
      try {
        payload = JSON.parse(body) as T;
      } catch {
        return {
          ok: false,
          error: `X API returned non-JSON response (HTTP ${response.status}).`,
        };
      }
    }

    const errors = (payload as XUserTweetsResponse).errors;
    if (!response.ok) {
      const message =
        errors?.map((e) => e.message ?? e.detail).filter(Boolean).join("; ") ??
        (payload as XUserTweetsResponse).detail ??
        `X API returned HTTP ${response.status}.`;
      return { ok: false, error: message };
    }

    return { ok: true, payload };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error calling X API";
    return { ok: false, error: message };
  }
}

export async function lookupXUserByUsername(
  username: string,
): Promise<
  | { ok: true; xUserId: string; username: string }
  | { ok: false; error: string }
> {
  const creds = await getStoredXCredentials();
  if (!creds) {
    return {
      ok: false,
      error:
        "X is not connected. Connect an account in Admin → Social or set X_ACCESS_TOKEN and X_ACCESS_SECRET.",
    };
  }

  const normalized = normalizeUsername(username);
  if (!normalized) {
    return { ok: false, error: "Username is required." };
  }

  const result = await xGet<XUserLookupResponse>(
    creds,
    buildLookupUrl(normalized),
  );
  if (!result.ok) {
    return result;
  }

  const xUserId = result.payload.data?.id;
  const resolvedUsername = result.payload.data?.username;
  if (!xUserId) {
    return { ok: false, error: `User @${normalized} not found on X.` };
  }

  return {
    ok: true,
    xUserId,
    username: resolvedUsername ?? normalized,
  };
}

function parseTweets(payload: XUserTweetsResponse): AccountTweet[] {
  if (!payload.data?.length) {
    return [];
  }

  return payload.data
    .filter((tweet) => tweet.id && tweet.text)
    .map((tweet) => ({
      id: tweet.id!,
      text: tweet.text!,
      createdAt: tweet.created_at ?? new Date().toISOString(),
      likeCount: tweet.public_metrics?.like_count ?? 0,
      retweetCount: tweet.public_metrics?.retweet_count ?? 0,
      replyCount: tweet.public_metrics?.reply_count ?? 0,
    }));
}

export async function fetchAccountTweets(
  xUserId: string,
): Promise<
  | { ok: true; tweets: AccountTweet[] }
  | { ok: false; error: string }
> {
  const creds = await getStoredXCredentials();
  if (!creds) {
    return {
      ok: false,
      error:
        "X is not connected. Connect an account in Admin → Social or set X_ACCESS_TOKEN and X_ACCESS_SECRET.",
    };
  }

  const result = await xGet<XUserTweetsResponse>(
    creds,
    buildUserTweetsUrl(xUserId),
  );
  if (!result.ok) {
    return result;
  }

  return { ok: true, tweets: parseTweets(result.payload) };
}

export function buildTweetUrl(username: string, tweetId: string): string {
  const handle = normalizeUsername(username);
  return `https://x.com/${handle}/status/${tweetId}`;
}
