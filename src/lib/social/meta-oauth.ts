import crypto from "node:crypto";
import { getAppUrl, readEnvCallbackUrl } from "@/lib/app-url";
import type { SocialToolPlatform } from "@/lib/social-tools/constants";

const META_AUTH_URL = "https://www.facebook.com/v21.0/dialog/oauth";
const META_TOKEN_URL = "https://graph.facebook.com/v21.0/oauth/access_token";
const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

export type MetaConsumerCredentials = {
  appId: string;
  appSecret: string;
};

export type MetaOAuthState = {
  platform: SocialToolPlatform;
  nonce: string;
};

const META_PLATFORM_SCOPES: Record<SocialToolPlatform, string[]> = {
  facebook: [
    "public_profile",
    "email",
    "user_posts",
    "pages_show_list",
    "pages_read_engagement",
  ],
  instagram: [
    "public_profile",
    "email",
    "instagram_basic",
    "instagram_manage_insights",
  ],
  linkedin: [],
};

export function getMetaConsumerCredentials(): MetaConsumerCredentials | null {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();

  if (!appId || !appSecret) {
    return null;
  }

  return { appId, appSecret };
}

export function logMetaOAuthEnvDebug(context: string): void {
  console.log(`[Meta OAuth] ${context}`, {
    env: {
      META_APP_ID: Boolean(process.env.META_APP_ID),
      META_APP_SECRET: Boolean(process.env.META_APP_SECRET),
      META_FACEBOOK_CALLBACK_URL: Boolean(process.env.META_FACEBOOK_CALLBACK_URL),
      META_INSTAGRAM_CALLBACK_URL: Boolean(
        process.env.META_INSTAGRAM_CALLBACK_URL,
      ),
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
  });
}

export function getMetaCallbackUrl(platform: SocialToolPlatform): string {
  if (platform === "facebook") {
    return (
      readEnvCallbackUrl("META_FACEBOOK_CALLBACK_URL") ??
      `${getAppUrl()}/api/buyer/social-tools/facebook/callback`
    );
  }

  return (
    readEnvCallbackUrl("META_INSTAGRAM_CALLBACK_URL") ??
    `${getAppUrl()}/api/buyer/social-tools/instagram/callback`
  );
}

export function encodeMetaOAuthState(state: MetaOAuthState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeMetaOAuthState(value: string): MetaOAuthState | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as MetaOAuthState;

    if (
      (parsed.platform !== "facebook" && parsed.platform !== "instagram") ||
      typeof parsed.nonce !== "string" ||
      !parsed.nonce
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function buildMetaAuthorizeUrl(
  platform: SocialToolPlatform,
  state: string,
): string {
  const credentials = getMetaConsumerCredentials();
  if (!credentials) {
    throw new Error("META_APP_ID and META_APP_SECRET must be configured.");
  }

  const callbackUrl = getMetaCallbackUrl(platform);
  const scopes = META_PLATFORM_SCOPES[platform].join(",");

  const params = new URLSearchParams({
    client_id: credentials.appId,
    redirect_uri: callbackUrl,
    state,
    response_type: "code",
    scope: scopes,
  });

  return `${META_AUTH_URL}?${params.toString()}`;
}

export function createMetaOAuthState(platform: SocialToolPlatform): MetaOAuthState {
  return {
    platform,
    nonce: crypto.randomBytes(16).toString("hex"),
  };
}

type MetaTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

type MetaProfileResponse = {
  id: string;
  name?: string;
};

export async function fetchMetaAccessToken(
  platform: SocialToolPlatform,
  code: string,
): Promise<{
  accessToken: string;
  expiresAt: Date | null;
}> {
  const credentials = getMetaConsumerCredentials();
  if (!credentials) {
    throw new Error("META_APP_ID and META_APP_SECRET must be configured.");
  }

  const callbackUrl = getMetaCallbackUrl(platform);
  const params = new URLSearchParams({
    client_id: credentials.appId,
    client_secret: credentials.appSecret,
    redirect_uri: callbackUrl,
    code,
  });

  const response = await fetch(`${META_TOKEN_URL}?${params.toString()}`);
  const body = (await response.json()) as MetaTokenResponse & {
    error?: { message?: string };
  };

  if (!response.ok || !body.access_token) {
    const message = body.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Failed to exchange Meta access token: ${message}`);
  }

  const expiresAt =
    typeof body.expires_in === "number"
      ? new Date(Date.now() + body.expires_in * 1000)
      : null;

  return { accessToken: body.access_token, expiresAt };
}

export async function fetchMetaProfile(
  accessToken: string,
): Promise<{ id: string; displayName: string }> {
  const params = new URLSearchParams({
    fields: "id,name",
    access_token: accessToken,
  });

  const response = await fetch(`${META_GRAPH_URL}/me?${params.toString()}`);
  const body = (await response.json()) as MetaProfileResponse & {
    error?: { message?: string };
  };

  if (!response.ok || !body.id) {
    const message = body.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Failed to load Meta profile: ${message}`);
  }

  return {
    id: body.id,
    displayName: body.name?.trim() || `Meta user ${body.id}`,
  };
}
