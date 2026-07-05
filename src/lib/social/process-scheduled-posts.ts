import { prisma } from "@/lib/db";
import { canPostNow } from "@/lib/social/posting-limits";
import { postToX } from "@/lib/social/post-to-x";

export type ProcessScheduledPostsResult = {
  processed: number;
  posted: number;
  failed: number;
  deferred: number;
};

export async function processScheduledPosts(): Promise<ProcessScheduledPostsResult> {
  const now = new Date();

  const duePosts = await prisma.socialPost.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
  });

  let posted = 0;
  let failed = 0;
  let deferred = 0;

  for (const post of duePosts) {
    const limits = await canPostNow();
    if (!limits.allowed) {
      console.log("[X post] Scheduled publish deferred by limits", {
        postId: post.id,
        reason: limits.reason,
      });

      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "scheduled",
          error: limits.reason,
          scheduledAt: limits.nextAvailableAt ?? post.scheduledAt,
        },
      });
      deferred += 1;
      continue;
    }

    console.log("[X post] Scheduled publish", { postId: post.id });
    const result = await postToX(post.content);

    if (result.ok) {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "posted",
          postedAt: new Date(),
          xPostId: result.postId,
          error: null,
        },
      });
      console.log("[X post] Scheduled post published", {
        postId: post.id,
        xPostId: result.postId,
      });
      posted += 1;
    } else {
      console.error("[X post] Scheduled post failed", {
        postId: post.id,
        error: result.error,
      });
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "failed",
          error: result.error,
        },
      });
      failed += 1;
    }
  }

  return {
    processed: duePosts.length,
    posted,
    failed,
    deferred,
  };
}
