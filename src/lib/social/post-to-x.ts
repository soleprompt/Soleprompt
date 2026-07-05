import { getStoredXCredentials } from "@/lib/social/x-connection";
import {
  buildOAuthAuthorizationHeader,
  type XUserCredentials,
} from "@/lib/social/x-oauth";

const TWEET_URL = "https://api.twitter.com/2/tweets";
const MAX_TWEET_LENGTH = 280;

export type PostToXResult =
  | { ok: true; postId: string }
  | { ok: false; error: string };

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
    const response = await fetch(TWEET_URL, {
      method: "POST",
      headers: {
        Authorization: buildOAuthAuthorizationHeader(
          "POST",
          TWEET_URL,
          creds,
          { key: creds.accessToken, secret: creds.accessSecret },
        ),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    });

    const payload = (await response.json()) as {
      data?: { id: string };
      errors?: { detail?: string; title?: string }[];
      detail?: string;
      title?: string;
    };

    if (!response.ok) {
      const apiError =
        payload.errors?.map((entry) => entry.detail ?? entry.title).join("; ") ??
        payload.detail ??
        payload.title ??
        `X API returned ${response.status}`;
      return { ok: false, error: apiError };
    }

    const postId = payload.data?.id;
    if (!postId) {
      return { ok: false, error: "X API did not return a post ID." };
    }

    return { ok: true, postId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error posting to X";
    return { ok: false, error: message };
  }
}

export type { XUserCredentials };
