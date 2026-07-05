import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireScrubberUser } from "@/lib/scrubber/api-auth";
import {
  fetchXRequestToken,
  getBuyerXCallbackUrl,
  getXConsumerCredentials,
  logXOAuthEnvDebug,
} from "@/lib/social/x-oauth";

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

export async function GET() {
  const user = await requireScrubberUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getXConsumerCredentials()) {
    return NextResponse.json(
      {
        error:
          "X app credentials not configured. Set X_API_KEY and X_API_SECRET.",
      },
      { status: 503 },
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
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
