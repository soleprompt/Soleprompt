import { getXCredentialsForUser } from "@/lib/social/x-connection";
import {
  buildOAuthAuthorizationHeader,
  type XUserCredentials,
} from "@/lib/social/x-oauth";

export type UserTweet = {
  id: string;
  text: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
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
  meta?: { next_token?: string; result_count?: number };
  errors?: { message?: string; detail?: string }[];
  detail?: string;
};

const MAX_RESULTS = 100;

function buildUserTweetsUrl(xUserId: string, paginationToken?: string): string {
  const base = `https://api.twitter.com/2/users/${xUserId}/tweets`;
  const params = new URLSearchParams({
    max_results: String(MAX_RESULTS),
    "tweet.fields": "created_at,public_metrics,text",
    exclude: "retweets,replies",
  });
  if (paginationToken) {
    params.set("pagination_token", paginationToken);
  }
  return `${base}?${params.toString()}`;
}

function parseTweets(payload: XUserTweetsResponse): UserTweet[] {
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

async function fetchUserTweetsPage(
  creds: XUserCredentials,
  xUserId: string,
  paginationToken?: string,
): Promise<
  | { ok: true; tweets: UserTweet[]; nextToken?: string }
  | { ok: false; error: string }
> {
  const url = buildUserTweetsUrl(xUserId, paginationToken);
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
    let payload: XUserTweetsResponse = {};
    if (body.trim()) {
      try {
        payload = JSON.parse(body) as XUserTweetsResponse;
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

    return {
      ok: true,
      tweets: parseTweets(payload),
      nextToken: payload.meta?.next_token,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error fetching tweets";
    return { ok: false, error: message };
  }
}

export async function fetchUserTweets(
  userId: string,
  options?: { maxPages?: number },
): Promise<
  | { ok: true; tweets: UserTweet[]; xUserId: string; screenName: string }
  | { ok: false; error: string }
> {
  const creds = await getXCredentialsForUser(userId);
  if (!creds) {
    return {
      ok: false,
      error:
        "X is not connected. Connect your account to scan your tweets.",
    };
  }

  const connection = creds.connection;
  const maxPages = options?.maxPages ?? 2;
  const allTweets: UserTweet[] = [];
  let nextToken: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const result = await fetchUserTweetsPage(
      creds,
      connection.xUserId,
      nextToken,
    );

    if (!result.ok) {
      return result;
    }

    allTweets.push(...result.tweets);
    nextToken = result.nextToken;

    if (!nextToken) {
      break;
    }
  }

  return {
    ok: true,
    tweets: allTweets,
    xUserId: connection.xUserId,
    screenName: connection.screenName,
  };
}
