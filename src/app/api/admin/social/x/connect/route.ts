import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminUser } from "@/lib/admin";
import {
  fetchXRequestToken,
  getXCallbackUrl,
  getXConsumerCredentials,
  logXOAuthEnvDebug,
} from "@/lib/social/x-oauth";

const OAUTH_TOKEN_COOKIE = "x_oauth_token";
const OAUTH_TOKEN_SECRET_COOKIE = "x_oauth_token_secret";
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
  if (!(await isAdminUser())) {
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
    logXOAuthEnvDebug("connect flow start");
    const callbackUrl = getXCallbackUrl();
    console.log("[X OAuth] connect using callback URL:", callbackUrl);

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
    console.error("[X OAuth] connect flow failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
