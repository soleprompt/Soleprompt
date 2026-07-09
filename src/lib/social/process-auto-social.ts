import { prisma } from "@/lib/db";
import { ensureDailyAutoPosts } from "@/lib/social/auto-post-scheduler";
import type { EnsureDailyAutoPostsResult } from "@/lib/social/auto-post-scheduler";
import { isSocialAutoApproveEnabled } from "@/lib/social/auto-social-config";
import { pickBestReplyOption } from "@/lib/social/auto-select";
import { canTweetNow } from "@/lib/social/tweet-limits";
import { postReplyToX, postToX } from "@/lib/social/post-to-x";

export type ProcessAutoSocialResult = {
  dailyContent: EnsureDailyAutoPostsResult;
  scheduledPosts: { processed: number; posted: number; failed: number; deferred: number };
  approvedPosts: { processed: number; posted: number; failed: number; deferred: number };
  approvedReplies: { processed: number; posted: number; failed: number; deferred: number };
  approvedEngageDrafts: { processed: number; posted: number; failed: number; deferred: number };
  autoApproved: { replies: number; engageDrafts: number; posts: number };
};

type ItemResult = {
  processed: number;
  posted: number;
  failed: number;
  deferred: number;
};

function emptyResult(): ItemResult {
  return { processed: 0, posted: 0, failed: 0, deferred: 0 };
}

async function autoApprovePendingDrafts(): Promise<{
  replies: number;
  engageDrafts: number;
  posts: number;
}> {
  if (!isSocialAutoApproveEnabled()) {
    return { replies: 0, engageDrafts: 0, posts: 0 };
  }

  let replies = 0;
  let engageDrafts = 0;
  let posts = 0;

  const draftPosts = await prisma.socialPost.findMany({
    where: { status: "draft" },
    orderBy: { createdAt: "asc" },
  });

  for (const post of draftPosts) {
    await prisma.socialPost.update({
      where: { id: post.id },
      data: { status: "approved", error: null },
    });
    posts += 1;
  }

  const batchReplies = await prisma.socialReply.findMany({
    where: { parentBatchId: { not: null }, status: "draft" },
    orderBy: { createdAt: "asc" },
  });

  const repliesByBatch = new Map<string, typeof batchReplies>();
  for (const reply of batchReplies) {
    const batchId = reply.parentBatchId!;
    const list = repliesByBatch.get(batchId) ?? [];
    list.push(reply);
    repliesByBatch.set(batchId, list);
  }

  for (const [batchId, options] of repliesByBatch) {
    const best = pickBestReplyOption(options);

    await prisma.$transaction(async (tx) => {
      await tx.socialReply.deleteMany({
        where: { parentBatchId: batchId, id: { not: best.id } },
      });
      await tx.socialReply.update({
        where: { id: best.id },
        data: { status: "approved", parentBatchId: null, error: null },
      });
    });

    replies += 1;
  }

  const standaloneDraftReplies = await prisma.socialReply.findMany({
    where: { parentBatchId: null, status: "draft" },
    orderBy: { createdAt: "asc" },
  });

  for (const reply of standaloneDraftReplies) {
    await prisma.socialReply.update({
      where: { id: reply.id },
      data: { status: "approved", error: null },
    });
    replies += 1;
  }

  const engagePosts = await prisma.engagePost.findMany({
    where: { drafts: { some: { status: "draft" } } },
    include: { drafts: { where: { status: "draft" }, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  for (const post of engagePosts) {
    if (post.drafts.length === 0) {
      continue;
    }

    const best = pickBestReplyOption(post.drafts);

    await prisma.$transaction(async (tx) => {
      await tx.engageReplyDraft.deleteMany({
        where: {
          postId: post.id,
          id: { not: best.id },
        },
      });
      await tx.engageReplyDraft.update({
        where: { id: best.id },
        data: { status: "approved", error: null },
      });
    });

    engageDrafts += 1;
  }

  return { replies, engageDrafts, posts };
}

async function processScheduledPosts(): Promise<ItemResult> {
  const now = new Date();
  const result = emptyResult();

  const duePosts = await prisma.socialPost.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
  });

  result.processed = duePosts.length;

  for (const post of duePosts) {
    const posted = await publishSocialPost(post.id, post.content);
    if (posted === "posted") {
      result.posted += 1;
    } else if (posted === "deferred") {
      result.deferred += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
}

async function processApprovedPosts(): Promise<ItemResult> {
  const result = emptyResult();

  const approvedPosts = await prisma.socialPost.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "asc" },
  });

  result.processed = approvedPosts.length;

  for (const post of approvedPosts) {
    const posted = await publishSocialPost(post.id, post.content);
    if (posted === "posted") {
      result.posted += 1;
    } else if (posted === "deferred") {
      result.deferred += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
}

async function processApprovedReplies(): Promise<ItemResult> {
  const now = new Date();
  const result = emptyResult();

  const dueReplies = await prisma.socialReply.findMany({
    where: {
      status: { in: ["approved", "scheduled"] },
      OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
  });

  result.processed = dueReplies.length;

  for (const reply of dueReplies) {
    const posted = await publishSocialReply(
      reply.id,
      reply.content,
      reply.targetTweetId,
    );
    if (posted === "posted") {
      result.posted += 1;
    } else if (posted === "deferred") {
      result.deferred += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
}

async function processApprovedEngageDrafts(): Promise<ItemResult> {
  const result = emptyResult();

  const approvedDrafts = await prisma.engageReplyDraft.findMany({
    where: { status: "approved" },
    include: { post: true },
    orderBy: { createdAt: "asc" },
  });

  result.processed = approvedDrafts.length;

  for (const draft of approvedDrafts) {
    const posted = await publishEngageDraft(
      draft.id,
      draft.content,
      draft.post.xTweetId,
    );
    if (posted === "posted") {
      result.posted += 1;
    } else if (posted === "deferred") {
      result.deferred += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
}

type PublishOutcome = "posted" | "failed" | "deferred";

async function publishSocialPost(
  postId: string,
  content: string,
): Promise<PublishOutcome> {
  const limits = await canTweetNow();
  if (!limits.allowed) {
    console.log("[X post] Auto-publish deferred by limits", {
      postId,
      reason: limits.reason,
    });

    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: "scheduled",
        error: limits.reason,
        scheduledAt: limits.nextAvailableAt ?? new Date(),
      },
    });
    return "deferred";
  }

  console.log("[X post] Auto-publish", { postId });
  const result = await postToX(content);

  if (result.ok) {
    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: "posted",
        postedAt: new Date(),
        xPostId: result.postId,
        error: null,
      },
    });
    return "posted";
  }

  console.error("[X post] Auto-publish failed", { postId, error: result.error });
  await prisma.socialPost.update({
    where: { id: postId },
    data: { status: "failed", error: result.error },
  });
  return "failed";
}

async function publishSocialReply(
  replyId: string,
  content: string,
  targetTweetId: string,
): Promise<PublishOutcome> {
  const limits = await canTweetNow();
  if (!limits.allowed) {
    console.log("[X reply] Auto-publish deferred by limits", {
      replyId,
      reason: limits.reason,
    });

    await prisma.socialReply.update({
      where: { id: replyId },
      data: {
        status: "scheduled",
        error: limits.reason,
        scheduledAt: limits.nextAvailableAt ?? new Date(),
      },
    });
    return "deferred";
  }

  console.log("[X reply] Auto-publish", { replyId, targetTweetId });
  const result = await postReplyToX(content, targetTweetId);

  if (result.ok) {
    await prisma.socialReply.update({
      where: { id: replyId },
      data: {
        status: "posted",
        postedAt: new Date(),
        xReplyId: result.postId,
        error: null,
      },
    });
    return "posted";
  }

  console.error("[X reply] Auto-publish failed", {
    replyId,
    error: result.error,
  });
  await prisma.socialReply.update({
    where: { id: replyId },
    data: { status: "failed", error: result.error },
  });
  return "failed";
}

async function publishEngageDraft(
  draftId: string,
  content: string,
  targetTweetId: string,
): Promise<PublishOutcome> {
  const limits = await canTweetNow();
  if (!limits.allowed) {
    console.log("[X engage] Auto-publish deferred by limits", {
      draftId,
      reason: limits.reason,
    });

    await prisma.engageReplyDraft.update({
      where: { id: draftId },
      data: {
        status: "approved",
        error: limits.reason,
      },
    });
    return "deferred";
  }

  console.log("[X engage] Auto-publish", { draftId, targetTweetId });
  const result = await postReplyToX(content, targetTweetId);

  if (result.ok) {
    await prisma.engageReplyDraft.update({
      where: { id: draftId },
      data: {
        status: "posted",
        postedAt: new Date(),
        xReplyId: result.postId,
        error: null,
      },
    });
    return "posted";
  }

  console.error("[X engage] Auto-publish failed", {
    draftId,
    error: result.error,
  });
  await prisma.engageReplyDraft.update({
    where: { id: draftId },
    data: { status: "failed", error: result.error },
  });
  return "failed";
}

export async function processAutoSocial(): Promise<ProcessAutoSocialResult> {
  const dailyContent = await ensureDailyAutoPosts();
  const autoApproved = await autoApprovePendingDrafts();

  const [scheduledPosts, approvedPosts, approvedReplies, approvedEngageDrafts] =
    await Promise.all([
      processScheduledPosts(),
      isSocialAutoApproveEnabled()
        ? processApprovedPosts()
        : emptyResult(),
      isSocialAutoApproveEnabled()
        ? processApprovedReplies()
        : emptyResult(),
      isSocialAutoApproveEnabled()
        ? processApprovedEngageDrafts()
        : emptyResult(),
    ]);

  return {
    dailyContent,
    scheduledPosts,
    approvedPosts,
    approvedReplies,
    approvedEngageDrafts,
    autoApproved,
  };
}

/** @deprecated Use processAutoSocial — kept for imports. */
export async function processScheduledPostsOnly() {
  const scheduledPosts = await processScheduledPosts();
  return {
    processed: scheduledPosts.processed,
    posted: scheduledPosts.posted,
    failed: scheduledPosts.failed,
    deferred: scheduledPosts.deferred,
  };
}
