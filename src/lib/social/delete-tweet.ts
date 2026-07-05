import { getXCredentialsForUser } from "@/lib/social/x-connection";
import { buildOAuthAuthorizationHeader } from "@/lib/social/x-oauth";

export type DeleteTweetResult =
  | { ok: true; tweetId: string }
  | { ok: false; error: string };

const MAX_ERROR_LENGTH = 2000;

type XDeleteTweetResponse = {
  data?: { deleted?: boolean };
  errors?: { message?: string; detail?: string; title?: string }[];
  detail?: string;
  title?: string;
};

function isValidXTweetId(value: string): boolean {
  const id = value.trim();
  return /^\d{5,25}$/.test(id);
}

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/oauth_[a-z_]+=[^\s&"]+/gi, "[redacted]")
    .slice(0, MAX_ERROR_LENGTH);
}

function buildDeleteTweetUrl(tweetId: string): string {
  return `https://api.twitter.com/2/tweets/${tweetId}`;
}

export async function deleteTweet(
  userId: string,
  tweetId: string,
): Promise<DeleteTweetResult> {
  const trimmedId = tweetId.trim();
  if (!isValidXTweetId(trimmedId)) {
    return { ok: false, error: "Invalid tweet ID." };
  }

  const creds = await getXCredentialsForUser(userId);
  if (!creds) {
    return {
      ok: false,
      error:
        "X is not connected. Connect your account from the X Scrubber page first.",
    };
  }

  const url = buildDeleteTweetUrl(trimmedId);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: buildOAuthAuthorizationHeader(
          "DELETE",
          url,
          { apiKey: creds.apiKey, apiSecret: creds.apiSecret },
          { key: creds.accessToken, secret: creds.accessSecret },
        ),
      },
    });

    const body = await response.text();
    let payload: XDeleteTweetResponse = {};
    if (body.trim()) {
      try {
        payload = JSON.parse(body) as XDeleteTweetResponse;
      } catch {
        return {
          ok: false,
          error: sanitizeErrorMessage(
            `X API returned non-JSON response (HTTP ${response.status}).`,
          ),
        };
      }
    }

    if (!response.ok) {
      const apiError =
        payload.errors?.map((e) => e.message ?? e.detail ?? e.title).filter(Boolean).join("; ") ??
        payload.detail ??
        payload.title;
      return {
        ok: false,
        error: sanitizeErrorMessage(
          apiError ?? `X API returned HTTP ${response.status}.`,
        ),
      };
    }

    if (payload.data?.deleted === false) {
      return { ok: false, error: "X API reported the tweet was not deleted." };
    }

    return { ok: true, tweetId: trimmedId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error deleting tweet";
    return { ok: false, error: sanitizeErrorMessage(message) };
  }
}

export async function deleteTweets(
  userId: string,
  tweetIds: string[],
): Promise<{
  deleted: string[];
  failed: Array<{ tweetId: string; error: string }>;
}> {
  const deleted: string[] = [];
  const failed: Array<{ tweetId: string; error: string }> = [];

  for (const tweetId of tweetIds) {
    const result = await deleteTweet(userId, tweetId);
    if (result.ok) {
      deleted.push(result.tweetId);
    } else {
      failed.push({ tweetId, error: result.error });
    }
  }

  return { deleted, failed };
}
