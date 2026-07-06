import crypto from "node:crypto";
import { getAppUrl, readEnvCallbackUrl } from "@/lib/app-url";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_PROFILE_URL = "https://api.linkedin.com/v2/userinfo";

const LINKEDIN_SCOPES = ["openid", "profile", "email", "w_member_social"];

export type LinkedInConsumerCredentials = {
  clientId: string;
  clientSecret: string;
};

export type LinkedInOAuthState = {
  nonce: string;
};

export function getLinkedInConsumerCredentials(): LinkedInConsumerCredentials | null {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

export function logLinkedInOAuthEnvDebug(context: string): void {
  console.log(`[LinkedIn OAuth] ${context}`, {
    env: {
      LINKEDIN_CLIENT_ID: Boolean(process.env.LINKEDIN_CLIENT_ID),
      LINKEDIN_CLIENT_SECRET: Boolean(process.env.LINKEDIN_CLIENT_SECRET),
      LINKEDIN_CALLBACK_URL: Boolean(process.env.LINKEDIN_CALLBACK_URL),
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
  });
}

export function getLinkedInCallbackUrl(): string {
  return (
    readEnvCallbackUrl("LINKEDIN_CALLBACK_URL") ??
    `${getAppUrl()}/api/buyer/social-tools/linkedin/callback`
  );
}

export function createLinkedInOAuthState(): LinkedInOAuthState {
  return { nonce: crypto.randomBytes(16).toString("hex") };
}

export function encodeLinkedInOAuthState(state: LinkedInOAuthState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeLinkedInOAuthState(
  value: string,
): LinkedInOAuthState | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as LinkedInOAuthState;

    if (typeof parsed.nonce !== "string" || !parsed.nonce) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function buildLinkedInAuthorizeUrl(state: string): string {
  const credentials = getLinkedInConsumerCredentials();
  if (!credentials) {
    throw new Error(
      "LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be configured.",
    );
  }

  const callbackUrl = getLinkedInCallbackUrl();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: credentials.clientId,
    redirect_uri: callbackUrl,
    state,
    scope: LINKEDIN_SCOPES.join(" "),
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

type LinkedInTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
};

type LinkedInProfileResponse = {
  sub: string;
  name?: string;
  email?: string;
};

export async function fetchLinkedInAccessToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}> {
  const credentials = getLinkedInConsumerCredentials();
  if (!credentials) {
    throw new Error(
      "LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be configured.",
    );
  }

  const callbackUrl = getLinkedInCallbackUrl();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: callbackUrl,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const payload = (await response.json()) as LinkedInTokenResponse & {
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    const message = payload.error_description ?? `HTTP ${response.status}`;
    throw new Error(`Failed to exchange LinkedIn access token: ${message}`);
  }

  const expiresAt =
    typeof payload.expires_in === "number"
      ? new Date(Date.now() + payload.expires_in * 1000)
      : null;

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresAt,
  };
}

export async function fetchLinkedInProfile(
  accessToken: string,
): Promise<{ id: string; displayName: string }> {
  const response = await fetch(LINKEDIN_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const body = (await response.json()) as LinkedInProfileResponse & {
    message?: string;
  };

  if (!response.ok || !body.sub) {
    const message = body.message ?? `HTTP ${response.status}`;
    throw new Error(`Failed to load LinkedIn profile: ${message}`);
  }

  return {
    id: body.sub,
    displayName: body.name?.trim() || body.email?.trim() || `LinkedIn ${body.sub}`,
  };
}
