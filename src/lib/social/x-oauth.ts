import crypto from "node:crypto";
import { getAppUrl, readEnvCallbackUrl } from "@/lib/app-url";

const REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token";
const ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token";
const AUTHORIZE_URL = "https://api.twitter.com/oauth/authorize";

export type XConsumerCredentials = {
  apiKey: string;
  apiSecret: string;
};

export type XUserCredentials = XConsumerCredentials & {
  accessToken: string;
  accessSecret: string;
};

export function getXConsumerCredentials(): XConsumerCredentials | null {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;

  if (!apiKey || !apiSecret) {
    return null;
  }

  return { apiKey, apiSecret };
}

/** Logs which X OAuth env vars are set (presence only — never values). */
export function logXOAuthEnvDebug(context: string): void {
  console.log(`[X OAuth] ${context}`, {
    env: {
      X_API_KEY: Boolean(process.env.X_API_KEY),
      X_API_SECRET: Boolean(process.env.X_API_SECRET),
      X_CALLBACK_URL: Boolean(process.env.X_CALLBACK_URL),
      X_BUYER_CALLBACK_URL: Boolean(process.env.X_BUYER_CALLBACK_URL),
      X_SOCIAL_CALLBACK_URL: Boolean(process.env.X_SOCIAL_CALLBACK_URL),
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      X_ACCESS_TOKEN: Boolean(process.env.X_ACCESS_TOKEN),
      X_ACCESS_SECRET: Boolean(process.env.X_ACCESS_SECRET),
    },
  });
}

function formatRequestTokenError(
  status: number,
  body: string,
  callbackUrl: string,
): string {
  const trimmedBody = body.trim();
  const bodyHint = trimmedBody ? ` Response: ${trimmedBody.slice(0, 200)}` : "";

  if (status === 401) {
    return (
      `Failed to obtain X request token (401).` +
      bodyHint +
      ` Callback URL sent: ${callbackUrl}.` +
      " Common causes: invalid X_API_KEY/X_API_SECRET, OAuth 1.0a disabled in the X developer portal," +
      " callback URL not registered exactly (scheme, host, path), or app missing Read+Write permissions."
    );
  }

  if (status === 403) {
    return (
      `Failed to obtain X request token (403).` +
      bodyHint +
      ` Callback URL sent: ${callbackUrl}.` +
      " The app may lack required permissions, elevated access for OAuth 1.0a," +
      " or the callback URL may not be registered in the X developer portal."
    );
  }

  return (
    `Failed to obtain X request token (${status}).` +
    bodyHint +
    ` Callback URL sent: ${callbackUrl}.`
  );
}

export function getXCallbackUrl(): string {
  return (
    readEnvCallbackUrl("X_CALLBACK_URL") ??
    `${getAppUrl()}/api/admin/social/x/callback`
  );
}

export function getBuyerXCallbackUrl(): string {
  return (
    readEnvCallbackUrl("X_BUYER_CALLBACK_URL") ??
    `${getAppUrl()}/api/buyer/scrubber/x/callback`
  );
}

/** Callback for the free X Checker tool (public /tools/x-checker). */
export function getBuyerSocialXCallbackUrl(): string {
  return (
    readEnvCallbackUrl("X_SOCIAL_CALLBACK_URL") ??
    `${getAppUrl()}/api/buyer/social/x/callback`
  );
}

export function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function buildOAuthAuthorizationHeader(
  method: string,
  url: string,
  consumer: XConsumerCredentials,
  token?: { key: string; secret: string },
  extraParams: Record<string, string> = {},
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumer.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    ...extraParams,
  };

  if (token) {
    oauthParams.oauth_token = token.key;
  }

  const allParams = { ...oauthParams, ...extraParams };
  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(
      Object.keys(allParams)
        .sort()
        .map((key) => `${percentEncode(key)}=${percentEncode(allParams[key]!)}`)
        .join("&"),
    ),
  ].join("&");

  const signingKey = `${percentEncode(consumer.apiSecret)}&${percentEncode(token?.secret ?? "")}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  const headerParams: Record<string, string> = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const headerValue = Object.keys(headerParams)
    .sort()
    .map(
      (key) =>
        `${percentEncode(key)}="${percentEncode(headerParams[key]!)}"`,
    )
    .join(", ");

  return `OAuth ${headerValue}`;
}

function parseOAuthResponse(body: string): Record<string, string> {
  return Object.fromEntries(
    body.split("&").map((pair) => {
      const [key, value = ""] = pair.split("=");
      return [decodeURIComponent(key!), decodeURIComponent(value)];
    }),
  );
}

export async function fetchXRequestToken(callbackUrl: string): Promise<{
  oauthToken: string;
  oauthTokenSecret: string;
  authorizeUrl: string;
}> {
  const consumer = getXConsumerCredentials();
  if (!consumer) {
    throw new Error("X_API_KEY and X_API_SECRET must be configured.");
  }

  console.log("[X OAuth] request_token request", { callbackUrl });

  const response = await fetch(REQUEST_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: buildOAuthAuthorizationHeader(
        "POST",
        REQUEST_TOKEN_URL,
        consumer,
        undefined,
        { oauth_callback: callbackUrl },
      ),
    },
  });

  const body = await response.text();
  console.log("[X OAuth] request_token response", {
    status: response.status,
    statusText: response.statusText,
    body,
  });

  if (!response.ok) {
    throw new Error(formatRequestTokenError(response.status, body, callbackUrl));
  }

  const params = parseOAuthResponse(body);
  const oauthToken = params.oauth_token;
  const oauthTokenSecret = params.oauth_token_secret;

  if (!oauthToken || !oauthTokenSecret) {
    throw new Error("X request token response was missing required fields.");
  }

  return {
    oauthToken,
    oauthTokenSecret,
    authorizeUrl: `${AUTHORIZE_URL}?oauth_token=${encodeURIComponent(oauthToken)}`,
  };
}

export async function fetchXAccessToken(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string,
): Promise<{
  accessToken: string;
  accessSecret: string;
  userId: string;
  screenName: string;
}> {
  const consumer = getXConsumerCredentials();
  if (!consumer) {
    throw new Error("X_API_KEY and X_API_SECRET must be configured.");
  }

  const response = await fetch(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: buildOAuthAuthorizationHeader(
        "POST",
        ACCESS_TOKEN_URL,
        consumer,
        { key: oauthToken, secret: oauthTokenSecret },
        { oauth_verifier: oauthVerifier },
      ),
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to exchange X access token (${response.status}).`);
  }

  const params = parseOAuthResponse(body);
  const accessToken = params.oauth_token;
  const accessSecret = params.oauth_token_secret;
  const userId = params.user_id;
  const screenName = params.screen_name;

  if (!accessToken || !accessSecret || !userId || !screenName) {
    throw new Error("X access token response was missing required fields.");
  }

  return { accessToken, accessSecret, userId, screenName };
}
