import { getStoredXCredentials } from "@/lib/social/x-connection";
import {
  buildOAuthAuthorizationHeader,
  type XUserCredentials,
} from "@/lib/social/x-oauth";

/**
 * X API v2 Create Post endpoint (OAuth 1.0a user context).
 * @see https://developer.x.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 */
export const X_CREATE_TWEET_URL = "https://api.twitter.com/2/tweets";

const MAX_TWEET_LENGTH = 280;
const MAX_ERROR_LENGTH = 2000;

export type PostToXResult =
  | { ok: true; postId: string }
  | { ok: false; error: string };

type XApiErrorEntry = {
  message?: string;
  detail?: string;
  title?: string;
  code?: number;
};

type XCreateTweetResponse = {
  data?: { id?: string | number; text?: string };
  errors?: XApiErrorEntry[];
  detail?: string;
  title?: string;
};

function isValidXTweetId(value: unknown): value is string {
  if (value == null) {
    return false;
  }
  const id = String(value).trim();
  return /^\d{5,25}$/.test(id);
}

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/oauth_[a-z_]+=[^\s&"]+/gi, "[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [redacted]")
    .slice(0, MAX_ERROR_LENGTH);
}

function formatXApiErrors(payload: XCreateTweetResponse): string | null {
  if (payload.errors?.length) {
    const parts = payload.errors
      .map((entry) => {
        const bits = [
          entry.message,
          entry.detail,
          entry.title,
          entry.code != null ? `(code ${entry.code})` : null,
        ].filter(Boolean);
        return bits.length > 0 ? bits.join(" — ") : null;
      })
      .filter(Boolean);

    if (parts.length > 0) {
      return parts.join("; ");
    }
  }

  if (payload.detail || payload.title) {
    return [payload.title, payload.detail].filter(Boolean).join(": ");
  }

  return null;
}

function logXPostResponse(status: number, body: string): void {
  const safeBody = body
    .slice(0, 2000)
    .replace(/oauth_[a-z_]+="[^"]+"/gi, 'oauth_*="[redacted]"');

  console.log("[X post] API response", {
    endpoint: X_CREATE_TWEET_URL,
    status,
    body: safeBody,
  });
}

export async function postToX(text: string): Promise<PostToXResult> {
  const trimmed = text.trim();

  if (!trimmed) {
    return { ok: false, error: "Tweet content cannot be empty." };
  }

  if (trimmed.length > MAX_TWEET_LENGTH) {
    return {
      ok: false,
      error: `Tweet exceeds ${MAX_TWEET_LENGTH} characters (${trimmed.length}).`,
    };
  }

  const creds = await getStoredXCredentials();
  if (!creds) {
    return {
      ok: false,
      error:
        "X is not connected. Connect an account in Admin → Social or set X_ACCESS_TOKEN and X_ACCESS_SECRET.",
    };
  }

  try {
    console.log("[X post] Publishing tweet", {
      endpoint: X_CREATE_TWEET_URL,
      charCount: trimmed.length,
    });

    const response = await fetch(X_CREATE_TWEET_URL, {
      method: "POST",
      headers: {
        Authorization: buildOAuthAuthorizationHeader(
          "POST",
          X_CREATE_TWEET_URL,
          { apiKey: creds.apiKey, apiSecret: creds.apiSecret },
          { key: creds.accessToken, secret: creds.accessSecret },
        ),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    });

    const responseText = await response.text();
    logXPostResponse(response.status, responseText);

    let payload: XCreateTweetResponse = {};
    if (responseText.trim()) {
      try {
        payload = JSON.parse(responseText) as XCreateTweetResponse;
      } catch {
        return {
          ok: false,
          error: sanitizeErrorMessage(
            `X API returned non-JSON response (HTTP ${response.status}).`,
          ),
        };
      }
    }

    const apiError = formatXApiErrors(payload);

    if (!response.ok) {
      return {
        ok: false,
        error: sanitizeErrorMessage(
          apiError ??
            `X API returned HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`,
        ),
      };
    }

    if (apiError) {
      return {
        ok: false,
        error: sanitizeErrorMessage(apiError),
      };
    }

    const rawId = payload.data?.id;
    if (!isValidXTweetId(rawId)) {
      return {
        ok: false,
        error: sanitizeErrorMessage(
          "X API returned success but no valid tweet ID was present in the response.",
        ),
      };
    }

    const postId = String(rawId).trim();
    console.log("[X post] Tweet published", { postId });

    return { ok: true, postId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error posting to X";
    return { ok: false, error: sanitizeErrorMessage(message) };
  }
}

export type { XUserCredentials };
