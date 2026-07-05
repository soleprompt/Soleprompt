import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireSignedInUser } from "@/lib/x-checker/api-auth";
import {
  fetchXRequestToken,
  getBuyerSocialXCallbackUrl,
  getXConsumerCredentials,
  logXOAuthEnvDebug,
} from "@/lib/social/x-oauth";
import { redirectXOAuthError } from "@/lib/social/x-oauth-redirect";

const OAUTH_TOKEN_COOKIE = "x_social_oauth_token";
const OAUTH_TOKEN_SECRET_COOKIE = "x_social_oauth_token_secret";
const OAUTH_COOKIE_MAX_AGE = 600;

function oauthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/",
  };
}

export async function GET(request: Request) {
  const user = await requireSignedInUser();
  if (!user) {
    return redirectXOAuthError(
      request,
      "checker",
      "Please sign in before connecting X.",
    );
  }

  if (!getXConsumerCredentials()) {
    return redirectXOAuthError(
      request,
      "checker",
      "X app credentials not configured. Set X_API_KEY and X_API_SECRET on the server.",
    );
  }

  try {
    logXOAuthEnvDebug("buyer social x-checker connect flow start");
    const callbackUrl = getBuyerSocialXCallbackUrl();

    const { oauthToken, oauthTokenSecret, authorizeUrl } =
      await fetchXRequestToken(callbackUrl);

    const cookieStore = await cookies();
    cookieStore.set(OAUTH_TOKEN_COOKIE, oauthToken, oauthCookieOptions());
    cookieStore.set(
      OAUTH_TOKEN_SECRET_COOKIE,
      oauthTokenSecret,
      oauthCookieOptions(),
    );

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start X OAuth flow.";
    return redirectXOAuthError(request, "checker", message);
  }
}
