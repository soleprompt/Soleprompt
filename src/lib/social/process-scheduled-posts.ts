import { prisma } from "@/lib/db";
import { postToX } from "@/lib/social/post-to-x";

export type ProcessScheduledPostsResult = {
  processed: number;
  posted: number;
  failed: number;
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

  for (const post of duePosts) {
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
      posted += 1;
    } else {
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
  };
}
