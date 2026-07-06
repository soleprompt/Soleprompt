import { NextResponse } from "next/server";
import { requireSocialSuiteUser } from "@/lib/social-tools/api-auth";
import { disconnectSocialConnectionForUser } from "@/lib/social/social-connection";
import {
  SOCIAL_TOOL_PLATFORMS,
  type SocialToolPlatform,
} from "@/lib/social-tools/constants";

function parsePlatform(value: string): SocialToolPlatform | null {
  return SOCIAL_TOOL_PLATFORMS.includes(value as SocialToolPlatform)
    ? (value as SocialToolPlatform)
    : null;
}

export async function POST(
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

  await disconnectSocialConnectionForUser(user.dbUser.id, platform);
  return NextResponse.json({ ok: true });
}
