import crypto from "node:crypto";

const TWEET_URL = "https://api.twitter.com/2/tweets";
const MAX_TWEET_LENGTH = 280;

export type PostToXResult =
  | { ok: true; postId: string }
  | { ok: false; error: string };

type XCredentials = {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
};

function getXCredentials(): XCredentials | null {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return null;
  }

  return { apiKey, apiSecret, accessToken, accessSecret };
}

function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function buildOAuthHeader(
  method: string,
  url: string,
  creds: XCredentials,
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };

  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(
      Object.keys(oauthParams)
        .sort()
        .map((key) => `${percentEncode(key)}=${percentEncode(oauthParams[key]!)}`)
        .join("&"),
    ),
  ].join("&");

  const signingKey = `${percentEncode(creds.apiSecret)}&${percentEncode(creds.accessSecret)}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  const headerParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const headerValue = Object.keys(headerParams)
    .sort()
    .map(
      (key) =>
        `${percentEncode(key)}="${percentEncode(headerParams[key as keyof typeof headerParams]!)}"`,
    )
    .join(", ");

  return `OAuth ${headerValue}`;
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

  const creds = getXCredentials();
  if (!creds) {
    return {
      ok: false,
      error:
        "X API credentials not configured. Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, and X_ACCESS_SECRET.",
    };
  }

  try {
    const response = await fetch(TWEET_URL, {
      method: "POST",
      headers: {
        Authorization: buildOAuthHeader("POST", TWEET_URL, creds),
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
