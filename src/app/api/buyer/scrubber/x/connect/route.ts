import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { hasScrubberAccess } from "@/lib/scrubber/access";
import { requireScrubberUser } from "@/lib/scrubber/api-auth";
import {
  fetchXRequestToken,
  getBuyerXCallbackUrl,
  getXConsumerCredentials,
  logXOAuthEnvDebug,
} from "@/lib/social/x-oauth";
import { redirectXOAuthError } from "@/lib/social/x-oauth-redirect";

const OAUTH_TOKEN_COOKIE = "x_buyer_oauth_token";
const OAUTH_TOKEN_SECRET_COOKIE = "x_buyer_oauth_token_secret";
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
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return redirectXOAuthError(
      request,
      "scrubber",
      "Please sign in before connecting X.",
    );
  }

  if (!(await hasScrubberAccess(clerkUserId))) {
    return redirectXOAuthError(
      request,
      "scrubber",
      "Purchase the X Scrubbing Tool ($20) to connect and delete tweets.",
    );
  }

  const user = await requireScrubberUser();
  if (!user) {
    return redirectXOAuthError(
      request,
      "scrubber",
      "Could not load your account. Try signing in again.",
    );
  }

  if (!getXConsumerCredentials()) {
    return redirectXOAuthError(
      request,
      "scrubber",
      "X app credentials not configured. Set X_API_KEY and X_API_SECRET on the server.",
    );
  }

  try {
    logXOAuthEnvDebug("buyer scrubber connect flow start");
    const callbackUrl = getBuyerXCallbackUrl();

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
    return redirectXOAuthError(request, "scrubber", message);
  }
}
