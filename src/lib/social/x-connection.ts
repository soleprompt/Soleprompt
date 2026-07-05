import { prisma } from "@/lib/db";
import {
  getXConsumerCredentials,
  type XUserCredentials,
} from "@/lib/social/x-oauth";

export type XConnectionStatus = {
  connected: boolean;
  configured: boolean;
  screenName?: string;
  xUserId?: string;
  connectedAt?: string;
  source?: "database" | "env";
};

export async function getStoredXCredentials(): Promise<XUserCredentials | null> {
  const consumer = getXConsumerCredentials();
  if (!consumer) {
    return null;
  }

  const connection = await prisma.xConnection.findFirst({
    orderBy: { connectedAt: "desc" },
  });

  if (connection) {
    return {
      ...consumer,
      accessToken: connection.accessToken,
      accessSecret: connection.accessSecret,
    };
  }

  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!accessToken || !accessSecret) {
    return null;
  }

  return {
    ...consumer,
    accessToken,
    accessSecret,
  };
}

export async function getXConnectionStatus(): Promise<XConnectionStatus> {
  const consumer = getXConsumerCredentials();
  const configured = Boolean(consumer);

  const connection = await prisma.xConnection.findFirst({
    orderBy: { connectedAt: "desc" },
  });

  if (connection) {
    return {
      connected: true,
      configured,
      screenName: connection.screenName,
      xUserId: connection.xUserId,
      connectedAt: connection.connectedAt.toISOString(),
      source: "database",
    };
  }

  const hasEnvTokens = Boolean(
    process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_SECRET,
  );

  return {
    connected: hasEnvTokens,
    configured,
    source: hasEnvTokens ? "env" : undefined,
  };
}

export async function saveXConnection(input: {
  userId: string;
  accessToken: string;
  accessSecret: string;
  screenName: string;
  xUserId: string;
}): Promise<void> {
  await prisma.$transaction([
    prisma.xConnection.deleteMany(),
    prisma.xConnection.create({
      data: {
        userId: input.userId,
        accessToken: input.accessToken,
        accessSecret: input.accessSecret,
        screenName: input.screenName,
        xUserId: input.xUserId,
      },
    }),
  ]);
}

export async function disconnectXConnection(): Promise<void> {
  await prisma.xConnection.deleteMany();
}
