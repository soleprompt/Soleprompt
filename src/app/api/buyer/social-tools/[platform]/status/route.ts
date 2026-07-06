import { NextResponse } from "next/server";
import { requireSocialSuiteUser } from "@/lib/social-tools/api-auth";
import { getMetaConsumerCredentials } from "@/lib/social/meta-oauth";
import { getLinkedInConsumerCredentials } from "@/lib/social/linkedin-oauth";
import { getSocialConnectionStatusForUser } from "@/lib/social/social-connection";
import {
  SOCIAL_TOOL_PLATFORMS,
  type SocialToolPlatform,
} from "@/lib/social-tools/constants";

function parsePlatform(value: string): SocialToolPlatform | null {
  return SOCIAL_TOOL_PLATFORMS.includes(value as SocialToolPlatform)
    ? (value as SocialToolPlatform)
    : null;
}

function isPlatformConfigured(platform: SocialToolPlatform): boolean {
  if (platform === "linkedin") {
    return Boolean(getLinkedInConsumerCredentials());
  }

  return Boolean(getMetaConsumerCredentials());
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const platform = parsePlatform((await context.params).platform);
  if (!platform) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
  }

  const user = await requireSocialSuiteUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getSocialConnectionStatusForUser(
    user.dbUser.id,
    platform,
    isPlatformConfigured(platform),
  );

  return NextResponse.json(status);
}
