import { NextResponse } from "next/server";
import type { SocialToolPlatform } from "@/lib/social-tools/constants";

export function redirectToSocialTool(
  request: Request,
  platform: SocialToolPlatform,
  params: Record<string, string>,
) {
  const search = new URLSearchParams(params);
  return NextResponse.redirect(
    new URL(`/buyer/social/${platform}?${search.toString()}`, request.url),
  );
}

export function redirectToSocialToolsHub(
  request: Request,
  params: Record<string, string>,
) {
  const search = new URLSearchParams(params);
  return NextResponse.redirect(
    new URL(`/buyer/social?${search.toString()}`, request.url),
  );
}

export function redirectSocialOAuthError(
  request: Request,
  platform: SocialToolPlatform,
  message: string,
) {
  return redirectToSocialTool(request, platform, {
    oauth: "error",
    message,
  });
}
