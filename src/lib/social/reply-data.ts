import type { SocialPostStatus, SocialReply } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { safeDbReadWithError } from "@/lib/safe-db";

export async function getAdminSocialReplies(statusFilter: string) {
  const status =
    statusFilter !== "all" ? (statusFilter as SocialPostStatus) : undefined;

  return safeDbReadWithError([] as SocialReply[], () =>
    prisma.socialReply.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  );
}
