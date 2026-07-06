import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { hasSocialSuiteAccess } from "@/lib/social-tools/access";
import {
  decodeLinkedInOAuthState,
  fetchLinkedInAccessToken,
  fetchLinkedInProfile,
} from "@/lib/social/linkedin-oauth";
import { saveSocialConnection } from "@/lib/social/social-connection";
import {
  redirectSocialOAuthError,
  redirectToSocialTool,
} from "@/lib/social/social-oauth-redirect";
import { syncCurrentUser } from "@/lib/user";

const LINKEDIN_OAUTH_STATE_COOKIE = "linkedin_oauth_state";

export async function GET(request: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return redirectSocialOAuthError(
      request,
      "linkedin",
      "Your session expired during authorization. Sign in and try connecting again.",
    );
  }

  if (!(await hasSocialSuiteAccess(clerkUserId))) {
    return redirectSocialOAuthError(
      request,
      "linkedin",
      "Purchase the Social Scrubbing Suite to connect accounts.",
    );
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (error) {
    return redirectToSocialTool(request, "linkedin", {
      oauth: "denied",
      message: errorDescription ?? error,
    });
  }

  if (!code || !state) {
    return redirectSocialOAuthError(
      request,
      "linkedin",
      "Missing OAuth parameters. Try connecting again.",
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(LINKEDIN_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(LINKEDIN_OAUTH_STATE_COOKIE);

  const parsedState = storedState
    ? decodeLinkedInOAuthState(storedState)
    : null;
  if (!parsedState || parsedState.nonce !== state) {
    return redirectSocialOAuthError(
      request,
      "linkedin",
      "OAuth session expired. Click Connect and complete authorization within a few minutes.",
    );
  }

  try {
    const token = await fetchLinkedInAccessToken(code);
    const profile = await fetchLinkedInProfile(token.accessToken);

    const dbUser = await syncCurrentUser();
    if (!dbUser) {
      return redirectSocialOAuthError(
        request,
        "linkedin",
        "Could not resolve your SolePrompt account. Try signing in again.",
      );
    }

    await saveSocialConnection({
      userId: dbUser.id,
      platform: "linkedin",
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenExpiresAt: token.expiresAt,
      displayName: profile.displayName,
      platformUserId: profile.id,
    });

    return redirectToSocialTool(request, "linkedin", { oauth: "connected" });
  } catch (callbackError) {
    const message =
      callbackError instanceof Error
        ? callbackError.message
        : "Failed to connect LinkedIn account.";
    return redirectSocialOAuthError(request, "linkedin", message);
  }
}
