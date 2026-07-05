import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { saveXConnection } from "@/lib/social/x-connection";
import { fetchXAccessToken } from "@/lib/social/x-oauth";
import {
  redirectToXChecker,
  redirectXOAuthError,
} from "@/lib/social/x-oauth-redirect";
import { syncCurrentUser } from "@/lib/user";

const OAUTH_TOKEN_COOKIE = "x_social_oauth_token";
const OAUTH_TOKEN_SECRET_COOKIE = "x_social_oauth_token_secret";

export async function GET(request: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return redirectXOAuthError(
      request,
      "checker",
      "Your session expired during X authorization. Sign in and try connecting again.",
    );
  }

  const { searchParams } = new URL(request.url);
  const denied = searchParams.get("denied");
  const oauthVerifier = searchParams.get("oauth_verifier");
  const oauthToken = searchParams.get("oauth_token");

  if (denied) {
    return redirectToXChecker(request, { x: "denied" });
  }

  if (!oauthToken || !oauthVerifier) {
    return redirectXOAuthError(
      request,
      "checker",
      "Missing OAuth parameters from X. Try connecting again.",
    );
  }

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(OAUTH_TOKEN_COOKIE)?.value;
  const storedSecret = cookieStore.get(OAUTH_TOKEN_SECRET_COOKIE)?.value;

  cookieStore.delete(OAUTH_TOKEN_COOKIE);
  cookieStore.delete(OAUTH_TOKEN_SECRET_COOKIE);

  if (!storedToken || !storedSecret || storedToken !== oauthToken) {
    return redirectXOAuthError(
      request,
      "checker",
      "OAuth session expired. Click Connect X and complete authorization within a few minutes.",
    );
  }

  try {
    const access = await fetchXAccessToken(
      oauthToken,
      storedSecret,
      oauthVerifier,
    );

    const dbUser = await syncCurrentUser();
    if (!dbUser) {
      return redirectXOAuthError(
        request,
        "checker",
        "Could not resolve your SolePrompt account. Try signing in again.",
      );
    }

    await saveXConnection({
      userId: dbUser.id,
      accessToken: access.accessToken,
      accessSecret: access.accessSecret,
      screenName: access.screenName,
      xUserId: access.userId,
    });

    return redirectToXChecker(request, { x: "connected" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect X account.";
    return redirectXOAuthError(request, "checker", message);
  }
}
