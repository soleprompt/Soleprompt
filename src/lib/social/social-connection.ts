import { prisma } from "@/lib/db";
import type { SocialPlatform } from "@/generated/prisma/client";
import type { SocialToolPlatform } from "@/lib/social-tools/constants";

export type SocialConnectionStatus = {
  connected: boolean;
  configured: boolean;
  displayName?: string;
  platformUserId?: string;
  connectedAt?: string;
};

export type SaveSocialConnectionInput = {
  userId: string;
  platform: SocialToolPlatform;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  displayName: string;
  platformUserId: string;
};

function toPrismaPlatform(platform: SocialToolPlatform): SocialPlatform {
  return platform;
}

export async function getSocialConnectionStatusForUser(
  userId: string,
  platform: SocialToolPlatform,
  configured: boolean,
): Promise<SocialConnectionStatus> {
  const connection = await prisma.socialConnection.findUnique({
    where: {
      userId_platform: { userId, platform: toPrismaPlatform(platform) },
    },
  });

  if (!connection) {
    return { connected: false, configured };
  }

  return {
    connected: true,
    configured,
    displayName: connection.displayName,
    platformUserId: connection.platformUserId,
    connectedAt: connection.connectedAt.toISOString(),
  };
}

export async function saveSocialConnection(
  input: SaveSocialConnectionInput,
): Promise<void> {
  const platform = toPrismaPlatform(input.platform);

  await prisma.socialConnection.upsert({
    where: {
      userId_platform: { userId: input.userId, platform },
    },
    create: {
      userId: input.userId,
      platform,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenExpiresAt: input.tokenExpiresAt ?? null,
      displayName: input.displayName,
      platformUserId: input.platformUserId,
    },
    update: {
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenExpiresAt: input.tokenExpiresAt ?? null,
      displayName: input.displayName,
      platformUserId: input.platformUserId,
    },
  });
}

export async function disconnectSocialConnectionForUser(
  userId: string,
  platform: SocialToolPlatform,
): Promise<void> {
  await prisma.socialConnection.deleteMany({
    where: { userId, platform: toPrismaPlatform(platform) },
  });
}

export async function getSocialAccessTokenForUser(
  userId: string,
  platform: SocialToolPlatform,
): Promise<string | null> {
  const connection = await prisma.socialConnection.findUnique({
    where: {
      userId_platform: { userId, platform: toPrismaPlatform(platform) },
    },
    select: { accessToken: true },
  });

  return connection?.accessToken ?? null;
}
