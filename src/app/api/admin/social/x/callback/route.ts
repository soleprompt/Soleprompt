import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminUser } from "@/lib/admin";
import { saveXConnection } from "@/lib/social/x-connection";
import { fetchXAccessToken } from "@/lib/social/x-oauth";
import { syncCurrentUser } from "@/lib/user";

const OAUTH_TOKEN_COOKIE = "x_oauth_token";
const OAUTH_TOKEN_SECRET_COOKIE = "x_oauth_token_secret";

function redirectToSocial(request: Request, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return NextResponse.redirect(
    new URL(`/admin/social?${search.toString()}`, request.url),
  );
}

export async function GET(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const denied = searchParams.get("denied");
  const oauthVerifier = searchParams.get("oauth_verifier");
  const oauthToken = searchParams.get("oauth_token");

  if (denied) {
    return redirectToSocial(request, { x: "denied" });
  }

  if (!oauthToken || !oauthVerifier) {
    return redirectToSocial(request, {
      x: "error",
      message: "Missing OAuth parameters.",
    });
  }

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(OAUTH_TOKEN_COOKIE)?.value;
  const storedSecret = cookieStore.get(OAUTH_TOKEN_SECRET_COOKIE)?.value;

  cookieStore.delete(OAUTH_TOKEN_COOKIE);
  cookieStore.delete(OAUTH_TOKEN_SECRET_COOKIE);

  if (!storedToken || !storedSecret || storedToken !== oauthToken) {
    return redirectToSocial(request, {
      x: "error",
      message: "OAuth session expired. Try connecting again.",
    });
  }

  try {
    const access = await fetchXAccessToken(
      oauthToken,
      storedSecret,
      oauthVerifier,
    );

    const dbUser = await syncCurrentUser();
    if (!dbUser) {
      return redirectToSocial(request, {
        x: "error",
        message: "Could not resolve admin user record.",
      });
    }

    await saveXConnection({
      userId: dbUser.id,
      accessToken: access.accessToken,
      accessSecret: access.accessSecret,
      screenName: access.screenName,
      xUserId: access.userId,
    });

    return redirectToSocial(request, { x: "connected" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect X account.";
    return redirectToSocial(request, { x: "error", message });
  }
}
