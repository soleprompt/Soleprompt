import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireSocialSuiteUser } from "@/lib/social-tools/api-auth";
import {
  buildLinkedInAuthorizeUrl,
  createLinkedInOAuthState,
  encodeLinkedInOAuthState,
  getLinkedInConsumerCredentials,
  logLinkedInOAuthEnvDebug,
} from "@/lib/social/linkedin-oauth";
import { oauthCookieOptions } from "@/lib/social/oauth-cookies";
import { redirectSocialOAuthError } from "@/lib/social/social-oauth-redirect";

const LINKEDIN_OAUTH_STATE_COOKIE = "linkedin_oauth_state";

export async function GET(request: Request) {
  const user = await requireSocialSuiteUser();
  if (!user) {
    return redirectSocialOAuthError(
      request,
      "linkedin",
      "Purchase the Social Scrubbing Suite to connect accounts.",
    );
  }

  if (!getLinkedInConsumerCredentials()) {
    return redirectSocialOAuthError(
      request,
      "linkedin",
      "LinkedIn app credentials not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET on the server.",
    );
  }

  try {
    logLinkedInOAuthEnvDebug("buyer social-tools linkedin connect flow start");
    const state = createLinkedInOAuthState();
    const cookieStore = await cookies();
    cookieStore.set(
      LINKEDIN_OAUTH_STATE_COOKIE,
      encodeLinkedInOAuthState(state),
      oauthCookieOptions(),
    );

    return NextResponse.redirect(buildLinkedInAuthorizeUrl(state.nonce));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to start LinkedIn OAuth flow.";
    console.error("[LinkedIn OAuth] buyer connect failed:", message);
    return redirectSocialOAuthError(request, "linkedin", message);
  }
}
