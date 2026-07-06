import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { hasSocialSuiteAccess } from "@/lib/social-tools/access";
import {
  decodeMetaOAuthState,
  fetchMetaAccessToken,
  fetchMetaProfile,
} from "@/lib/social/meta-oauth";
import { saveSocialConnection } from "@/lib/social/social-connection";
import {
  redirectSocialOAuthError,
  redirectToSocialTool,
} from "@/lib/social/social-oauth-redirect";
import { syncCurrentUser } from "@/lib/user";
import type { SocialToolPlatform } from "@/lib/social-tools/constants";

const META_OAUTH_STATE_COOKIE = "meta_oauth_state";

export async function handleMetaOAuthCallback(
  request: Request,
  platform: Extract<SocialToolPlatform, "facebook" | "instagram">,
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return redirectSocialOAuthError(
      request,
      platform,
      "Your session expired during authorization. Sign in and try connecting again.",
    );
  }

  if (!(await hasSocialSuiteAccess(clerkUserId))) {
    return redirectSocialOAuthError(
      request,
      platform,
      "Purchase the Social Scrubbing Suite to connect accounts.",
    );
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (error) {
    return redirectToSocialTool(request, platform, {
      oauth: "denied",
      message: errorDescription ?? error,
    });
  }

  if (!code || !state) {
    return redirectSocialOAuthError(
      request,
      platform,
      "Missing OAuth parameters. Try connecting again.",
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(META_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(META_OAUTH_STATE_COOKIE);

  const parsedState = storedState ? decodeMetaOAuthState(storedState) : null;
  if (!parsedState || parsedState.platform !== platform || parsedState.nonce !== state) {
    return redirectSocialOAuthError(
      request,
      platform,
      "OAuth session expired. Click Connect and complete authorization within a few minutes.",
    );
  }

  try {
    const token = await fetchMetaAccessToken(platform, code);
    const profile = await fetchMetaProfile(token.accessToken);

    const dbUser = await syncCurrentUser();
    if (!dbUser) {
      return redirectSocialOAuthError(
        request,
        platform,
        "Could not resolve your SolePrompt account. Try signing in again.",
      );
    }

    await saveSocialConnection({
      userId: dbUser.id,
      platform,
      accessToken: token.accessToken,
      tokenExpiresAt: token.expiresAt,
      displayName: profile.displayName,
      platformUserId: profile.id,
    });

    return redirectToSocialTool(request, platform, { oauth: "connected" });
  } catch (callbackError) {
    const message =
      callbackError instanceof Error
        ? callbackError.message
        : `Failed to connect ${platform} account.`;
    return redirectSocialOAuthError(request, platform, message);
  }
}
