import type {
  EngagePost,
  EngageReplyDraft,
  EngageTargetAccount,
  SocialPostStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { safeDbReadWithError } from "@/lib/safe-db";

export type EngagePostWithDrafts = EngagePost & {
  drafts: EngageReplyDraft[];
  targetAccount: EngageTargetAccount;
};

export async function getEngageTargetAccounts() {
  return safeDbReadWithError([] as EngageTargetAccount[], () =>
    prisma.engageTargetAccount.findMany({
      orderBy: [{ active: "desc" }, { username: "asc" }],
    }),
  );
}

export async function getEngagePosts(statusFilter: string) {
  const draftStatus =
    statusFilter !== "all" ? (statusFilter as SocialPostStatus) : undefined;

  return safeDbReadWithError([] as EngagePostWithDrafts[], () =>
    prisma.engagePost.findMany({
      where: draftStatus
        ? {
            drafts: {
              some: { status: draftStatus },
            },
          }
        : undefined,
      include: {
        drafts: { orderBy: { createdAt: "asc" } },
        targetAccount: true,
      },
      orderBy: [{ relevanceScore: "desc" }, { tweetedAt: "desc" }],
      take: 100,
    }),
  );
}
