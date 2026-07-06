import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireSocialSuiteUser } from "@/lib/social-tools/api-auth";
import {
  buildMetaAuthorizeUrl,
  createMetaOAuthState,
  encodeMetaOAuthState,
  getMetaConsumerCredentials,
  logMetaOAuthEnvDebug,
} from "@/lib/social/meta-oauth";
import { oauthCookieOptions } from "@/lib/social/oauth-cookies";
import { redirectSocialOAuthError } from "@/lib/social/social-oauth-redirect";
import type { SocialToolPlatform } from "@/lib/social-tools/constants";

const META_OAUTH_STATE_COOKIE = "meta_oauth_state";

export async function startMetaOAuthConnect(
  request: Request,
  platform: Extract<SocialToolPlatform, "facebook" | "instagram">,
) {
  const user = await requireSocialSuiteUser();
  if (!user) {
    return redirectSocialOAuthError(
      request,
      platform,
      "Purchase the Social Scrubbing Suite to connect accounts.",
    );
  }

  if (!getMetaConsumerCredentials()) {
    return redirectSocialOAuthError(
      request,
      platform,
      "Meta app credentials not configured. Set META_APP_ID and META_APP_SECRET on the server.",
    );
  }

  try {
    logMetaOAuthEnvDebug(`buyer social-tools ${platform} connect flow start`);
    const state = createMetaOAuthState(platform);
    const cookieStore = await cookies();
    cookieStore.set(
      META_OAUTH_STATE_COOKIE,
      encodeMetaOAuthState(state),
      oauthCookieOptions(),
    );

    return NextResponse.redirect(buildMetaAuthorizeUrl(platform, state.nonce));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `Failed to start ${platform} OAuth flow.`;
    console.error(`[Meta OAuth] buyer ${platform} connect failed:`, message);
    return redirectSocialOAuthError(request, platform, message);
  }
}
